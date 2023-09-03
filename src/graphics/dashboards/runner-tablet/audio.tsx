import React, { useEffect, useMemo, useState } from "react";
import { CouchPerson } from "@asm-graphics/types/OverlayProps";
import { RunDataActiveRun } from "@asm-graphics/types/RunData";
import styled from "styled-components";
import { useReplicant } from "use-nodecg";
import { AudioFader } from "./audio-fader";
import { HEADSETS } from "./headsets";
// import useDebounce from '../../../hooks/useDebounce';

const RTAudioContainer = styled.div``;

const HeadsetSelectors = styled.div`
	display: flex;
	justify-content: center;
	gap: 2rem;
	margin-top: 1rem;
`;

const HeadsetName = styled.button`
	all: unset;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 1rem;
	border-radius: 20px;
	width: 4rem;
	padding: 1rem;
	text-align: center;
`;

const MixingContainer = styled.div`
	width: 100%;
	height: 500px;
	border-top: 5px solid black;
	margin: auto;
	margin-top: 1rem;
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding-top: 16px;
	padding-bottom: 48px;
`;

const MixingDivide = styled.div`
	height: 546px;
	width: 5px;
	margin-top: 11px;
`;

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

export const RTAudio = (props: Props) => {
	const [runDataActiveRep] = useReplicant<RunDataActiveRun | undefined>("runDataActiveRun", undefined, {
		namespace: "nodecg-speedcontrol",
	});
	const [couchNamesRep] = useReplicant<CouchPerson[]>("couch-names", []);
	const [busFadersRep] = useReplicant<number[][]>("x32:busFaders", []);
	const [faderValues, setFaderValues] = useState<number[][]>([]);
	// const debouncedFadersRep = useDebounce(busFadersRep, 100);

	const numberOfRunners = useMemo(
		() => runDataActiveRep?.teams.reduce((total, team) => total + team.players.length, 0) ?? 0,
		[runDataActiveRep],
	);
	const headsetUserMap = useMemo(() => {
		const map = new Map(HEADSETS.map((headset) => [headset.name, headset.name]));
		runDataActiveRep?.teams.map((team) => {
			team.players.map((player) => {
				if ("microphone" in player.customData) map.set(player.customData.microphone, player.name);
			});
		});

		couchNamesRep.map((couch) => {
			if (couch.microphone) map.set(couch.microphone, couch.name);
		});

		return map;
	}, [runDataActiveRep, couchNamesRep]);

	useEffect(() => {
		setFaderValues(busFadersRep);
	}, [busFadersRep]);

	const [selectedHeadset, setSelectedHeadset] = useState(HEADSETS[0].name);
	const selectedHeadsetObj = HEADSETS.find((headset) => headset.name === selectedHeadset);

	// MixBus falls back to 16 since it is an unused bus (FX4)
	const mixBus = selectedHeadsetObj?.mixBus ?? 16;

	const handleFaderChange = (float: number, mixBus: number, channel: number) => {
		const nextFaderValues = faderValues.map((faders, faderMixBus) => {
			if (faderMixBus === mixBus) {
				return faders.map((fader, faderChannel) => {
					if (faderChannel === channel) {
						return float;
					} else {
						return fader;
					}
				});
			} else {
				return faders;
			}
		});

		setFaderValues(nextFaderValues);
		nodecg.sendMessage("x32:setFader", { float: float, channel: channel, mixBus: mixBus });
	};

	return (
		<RTAudioContainer className={props.className} style={props.style}>
			<HeadsetSelectors>
				{HEADSETS.filter((headset) => headset.name !== "Host").map((headset) => {
					return (
						<HeadsetName
							key={headset.name}
							style={{
								background: headset.colour,
								color: headset.textColour,
								fontWeight: selectedHeadset === headset.name ? "bold" : "",
							}}
							onClick={() => setSelectedHeadset(headset.name)}
						>
							{headsetUserMap.get(headset.name) ?? headset.name}
						</HeadsetName>
					);
				})}
			</HeadsetSelectors>
			<MixingContainer
				style={{ borderColor: selectedHeadsetObj?.colour, background: `${selectedHeadsetObj?.colour}22` }}
			>
				<AudioFader
					key={"MASTER"}
					label={`MASTER`}
					mixBus={mixBus}
					channel={0}
					value={faderValues[mixBus]?.[0]}
					onChange={(float) => handleFaderChange(float, mixBus, 0)}
					colour={selectedHeadsetObj?.colour}
				/>
				<MixingDivide style={{ background: selectedHeadsetObj?.colour }} />
				{[...Array(numberOfRunners).keys()].map((number) => {
					return (
						<AudioFader
							key={number}
							label={`Game ${number + 1}`}
							mixBus={mixBus}
							channel={9 + number * 2}
							value={faderValues[mixBus]?.[9 + number + number * 2]}
							onChange={(float) => handleFaderChange(float, mixBus, 9 + number * 2)}
							colour={selectedHeadsetObj?.colour}
						/>
					);
				})}
				<MixingDivide style={{ background: selectedHeadsetObj?.colour }} />
				{HEADSETS.map((headset) => {
					return (
						<AudioFader
							key={headset.name}
							label={
								headset.name === selectedHeadset
									? "You"
									: headsetUserMap.get(headset.name) ?? headset.name
							}
							mixBus={mixBus}
							channel={headset.channel}
							value={faderValues[mixBus]?.[headset.channel]}
							onChange={(float) => handleFaderChange(float, mixBus, headset.channel)}
							colour={selectedHeadsetObj?.colour}
						/>
					);
				})}
			</MixingContainer>
		</RTAudioContainer>
	);
};
