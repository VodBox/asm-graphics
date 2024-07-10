import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import { HashRouter as Router, Route, Link, Routes } from "react-router-dom";
import { useListenFor, useReplicant } from "@nodecg/react-hooks";
import _ from "underscore";
import { useNormalisedTime } from "../hooks/useCurrentTime";

// import { CurrentOverlay } from '@asm-graphics/types/CurrentOverlay';
import type { RunDataActiveRun, RunDataArray } from "@asm-graphics/types/RunData";
import type { Timer } from "@asm-graphics/types/Timer";
import type { Commentator, OverlayProps, OverlayRef } from "@asm-graphics/types/OverlayProps";
import type NodeCG from "@nodecg/types";

import type { AudioIndicator } from "@asm-graphics/types/Audio";

import { TickerOverlay } from "./ticker";
import { Standard } from "./overlays/standard";
import { Standard2 } from "./overlays/standard-2";
import { Widescreen } from "./overlays/widescreen";
import { Widescreen2 } from "./overlays/widescreen-2";
import { Widescreen3 } from "./overlays/widescreen-3";
import { DS } from "./overlays/ds";
import { GBA } from "./overlays/gba";
import { GBA2 } from "./overlays/gba-2";
import { GBC } from "./overlays/gbc";
import { DS2 } from "./overlays/ds2";
import { WHG } from "./overlays/whg11-8";
import { ThreeDS } from "./overlays/3ds";
import { ThreeDS2 } from "./overlays/3ds-2";
import { SM64MovementRando } from "./overlays/sm64-rando";
import { NoGraphics } from "./overlays/no-graphics";
import { StandardVertical } from "./overlays/standard-vertical";
import { uiTime } from "./elements/event-specific/asm-24/colours";
import { sunriseEnd, sunriseStart, sunsetEnd, sunsetStart } from "./elements/event-specific/asm-24/time-utils";

const GameplayOverlayCont = styled.div<{ time: string }>`
	--time: #${(props: { time: string }) => props.time};
`;

const GameplayContainer = styled.div`
	height: 1080px;
	width: 1920px;
	border-right: 5px solid black;
	border-bottom: 5px solid black;
`;

const SpacedLinks = styled(Link)`
	margin: 16px 16px 0 16px;
	font-weight: bold;
	font-size: 20px;
	text-decoration: none;
	display: inline-block;
`;

interface GameplayOverlayProps {
	preview?: boolean;
}

// https://stackoverflow.com/questions/58220995/cannot-read-property-history-of-undefined-usehistory-hook-of-react-router-5
export const GameplayRouterParent = (props: GameplayOverlayProps) => {
	return (
		<Router>
			<GameplayOverlay preview={props.preview} />
		</Router>
	);
};

const GameplayOverlay = (props: GameplayOverlayProps) => {
	const [runDataActiveRep] = useReplicant<RunDataActiveRun>("runDataActiveRun", { bundle: "nodecg-speedcontrol" });
	const [timerRep] = useReplicant<Timer>("timer", { bundle: "nodecg-speedcontrol" });
	const [commentatorsRep] = useReplicant<Commentator[]>("commentators");
	const [hostRep] = useReplicant<Commentator>("host");
	// const [currentOverlayRep] = useReplicant<CurrentOverlay, undefined>('currentOverlay', undefined);
	const [sponsorsRep] = useReplicant<NodeCG.AssetFile[]>("assets:sponsors");
	const [gameAudioIndicatorRep] = useReplicant<number>("game-audio-indicator");
	const [microphoneAudioIndicatorRep] = useReplicant<AudioIndicator>("audio-indicators");
	const normalisedTime = useNormalisedTime();
	const [displayingRun, setDisplayingRun] = useState<RunDataActiveRun>(undefined);
	const overlayRefs = useRef<OverlayRef[]>([]);
	const [manualTime, setManualTime] = useState(0);
	const [useManualTime, setUseManualTime] = useState(false);

	// Disable runner audio indicator if they are the only runner and there isn't another commentator (except Host)
	const mutableMicAudioIndicator = _.clone(microphoneAudioIndicatorRep);
	if (
		mutableMicAudioIndicator &&
		commentatorsRep?.length == 0 &&
		runDataActiveRep?.teams.flatMap((team) => team.players).length == 1
	) {
		const runner = runDataActiveRep?.teams.flatMap((team) => team.players)[0];

		mutableMicAudioIndicator[runner.customData.microphone] = false;
	}

	const time = useManualTime ? manualTime : normalisedTime;

	const overlayArgs: OverlayProps = {
		runData: displayingRun,
		timer: timerRep,
		commentators: commentatorsRep ?? [],
		preview: props.preview,
		sponsors: sponsorsRep ?? [],
		microphoneAudioIndicator: mutableMicAudioIndicator,
		host: hostRep,
		gameAudioIndicator: gameAudioIndicatorRep ?? -1,
		asm24Time: time,
	};

	const Overlays = [
		{
			component: <Standard {...overlayArgs} ref={(el: OverlayRef) => (overlayRefs.current[0] = el)} />,
			name: "",
			// Default as standard
		},
		{
			component: <Standard {...overlayArgs} ref={(el: OverlayRef) => (overlayRefs.current[1] = el)} />,
			name: "Standard",
		},
		{
			component: <Standard2 {...overlayArgs} ref={(el: OverlayRef) => (overlayRefs.current[2] = el)} />,
			name: "Standard-2",
		},
		{
			component: <Widescreen {...overlayArgs} ref={(el: OverlayRef) => (overlayRefs.current[3] = el)} />,
			name: "Widescreen",
		},
		{
			component: <Widescreen2 {...overlayArgs} ref={(el: OverlayRef) => (overlayRefs.current[4] = el)} />,
			name: "Widescreen-2",
		},
		{
			component: <Widescreen3 {...overlayArgs} />,
			name: "Widescreen-3",
		},
		{
			component: <DS {...overlayArgs} />,
			name: "DS",
		},
		{
			component: <DS2 {...overlayArgs} />,
			name: "DS-2",
		},
		{
			component: <GBA {...overlayArgs} ref={(el: OverlayRef) => (overlayRefs.current[6] = el)} />,
			name: "GBA",
		},
		{
			component: <GBA2 {...overlayArgs} />,
			name: "GBA-2",
		},
		{
			component: <GBC {...overlayArgs} />,
			name: "GBC",
		},
		{
			component: <WHG {...overlayArgs} />,
			name: "WHG",
		},
		{
			component: <ThreeDS {...overlayArgs} />,
			name: "3DS",
		},
		{
			component: <ThreeDS2 {...overlayArgs} />,
			name: "3DS-2",
		},
		{
			component: <StandardVertical {...overlayArgs} />,
			name: "Standard-Vertical",
		},
		{
			component: <SM64MovementRando {...overlayArgs} />,
			name: "SM64-Rando",
		},
		{
			component: <NoGraphics />,
			name: "None",
		},
	];

	useListenFor("showTweet", (newVal) => {
		overlayRefs.current.forEach((ref) => {
			if (ref) ref.showTweet?.(newVal);
		});
	});

	useEffect(() => {
		if (props.preview) {
			nodecg.readReplicant("runDataArray", "nodecg-speedcontrol", (runData) => {
				nodecg.readReplicant("runDataActiveRunSurrounding", "nodecg-speedcontrol", (surrounding) => {
					setDisplayingRun(
						(runData as RunDataArray).find(
							(run) =>
								run.id === (surrounding as { previous?: string; current?: string; next?: string }).next,
						),
					);
				});
			});
		} else {
			setDisplayingRun(runDataActiveRep);
		}
	}, [props.preview, runDataActiveRep]);

	const RouteData = Overlays.map((overlay) => {
		return <Route path={`/${overlay.name}`} key={overlay.name} element={overlay.component} />;
	});

	const DevLinks = Overlays.map((overlay) => {
		return (
			<SpacedLinks to={`/${overlay.name}`} key={overlay.name}>
				{overlay.name}
			</SpacedLinks>
		);
	});

	function changeBGColor(col: string) {
		document.body.style.background = col;
	}

	return (
		<GameplayOverlayCont time={uiTime(time)}>
			<GameplayContainer>
				<Routes>{RouteData}</Routes>
				<TickerOverlay />
			</GameplayContainer>

			{DevLinks}
			<div>
				<button onClick={() => changeBGColor("#000")}>Black</button>
				<button onClick={() => changeBGColor("#f00")}>Red</button>
				<button onClick={() => changeBGColor("#0f0")}>Green</button>
				<button onClick={() => changeBGColor("#00f")}>Blue</button>
				<button onClick={() => changeBGColor("rgba(0, 0, 0, 0)")}>Transparent</button>
				<button onClick={() => nodecg.sendMessage("start-credits")}>Credits</button>
				<br />
				<input type="checkbox" checked={useManualTime} onChange={() => setUseManualTime(!useManualTime)} />
				<label htmlFor="manualTime">Use Manual Time</label>
				Time {convertTo12Hour(manualTime)}
				<input
					type="range"
					min={0}
					max={1}
					value={manualTime}
					step={0.001}
					onChange={(e) => setManualTime(e.target.valueAsNumber)}
					style={{ width: 500 }}
				/>
				<button onClick={() => setManualTime(0)}>Midday</button>
				<button onClick={() => setManualTime((sunsetStart + sunsetEnd) / 2)}>Sunset</button>
				<button onClick={() => setManualTime(0.5)}>Midnight</button>
				<button onClick={() => setManualTime((sunriseStart + sunriseEnd) / 2)}>Sunrise</button>
			</div>
		</GameplayOverlayCont>
	);
};

createRoot(document.getElementById("root")!).render(<GameplayRouterParent />);

// Convert a decimal time to a 12-hour time string where 0 is 12PM and 0.5 is 12AM
function convertTo12Hour(time: number) {
	const hour = Math.floor(time * 24);
	const minute = Math.floor((time * 24 - hour) * 60);
	const hour12 = (hour + 12) % 12 || 12;
	const minuteStr = minute.toString().padStart(2, "0");
	return `${hour12.toString().padStart(2, "0")}:${minuteStr.padStart(2, "0")} ${hour < 12 ? "PM" : "AM"}`;
}
