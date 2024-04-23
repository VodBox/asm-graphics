import React, { forwardRef, useImperativeHandle, useRef } from "react";
import styled from "styled-components";

import { OverlayProps, OverlayRef } from "@asm-graphics/types/OverlayProps";

import { IVerticalStyling, VerticalInfo } from "../elements/info-box/vertical";
import { SponsorBoxRef, SponsorsBox } from "../elements/sponsors";
import { Facecam } from "../elements/facecam";
import { Couch } from "../elements/couch";

import DreamhackLogo from "../elements/event-specific/dh-24/DreamHack_Logo_RGB_WHITE.png";
import StandardBG from "../elements/event-specific/dh-24/Standard.png";

const StandardContainer = styled.div`
	height: 1016px;
	width: 1920px;
`;

const Sidebar = styled.div`
	position: absolute;
	height: 1016px;
	width: 565px;
	border-right: 1px solid var(--accent);
	overflow: hidden;
`;

const InfoBoxBG = styled.div`
	background: var(--main);
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	align-items: center;
	height: 664px;
	clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
	background-blend-mode: multiply;
	background-repeat: repeat;
	background-position-y: 10px;
	position: relative;
`;

// const SponsorBoxS = styled(SponsorsBox)`
// 	/* width: 65%; */
// 	/* height: 264px; */
// 	flex-grow: 1;
// 	/* margin-top: -70px; */
// `;

// const SponsorsSize = {
// 	height: 125,
// 	width: 480,
// };

// const TwitterSize = {
// 	height: 200,
// 	width: 480,
// 	marginTop: -44,
// };

const VerticalInfoS = styled(VerticalInfo)`
	height: 348px;
	z-index: 1;
`;

const customVerticalStyle: IVerticalStyling = {
	timerSize: 75,
	gameInfoSize: 20,
	gameTitleSize: 40,
	gameStackHeight: 200,
	timerStackHeight: 300,
	categorySize: 38,
};

export const Standard = forwardRef<OverlayRef, OverlayProps>((props, ref) => {
	const sponsorRef = useRef<SponsorBoxRef>(null);

	useImperativeHandle(ref, () => ({
		showTweet(newVal) {
			sponsorRef.current?.showTweet?.(newVal);
		},
	}));

	const nameplateMaxWidth = 330 / (props.runData?.teams?.[0]?.players?.length ?? 1) + 70;

	return (
		<StandardContainer>
			<Sidebar>
				<Facecam
					maxNameWidth={nameplateMaxWidth}
					height={352}
					teams={props.runData?.teams}
					pronounStartSide="right"
					audioIndicator={props.microphoneAudioIndicator}
					verticalCoop
				/>
				<InfoBoxBG>
					<img
						src={StandardBG}
						style={{
							position: "absolute",
							height: "auto",
							width: "100%",
							objectFit: "contain",
							bottom: 0,
							zIndex: -1,
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: 0,
							height: 8,
							width: "100%",
							background: "var(--dh-orange-to-red)",
						}}
					/>
					<VerticalInfoS timer={props.timer} runData={props.runData} style={customVerticalStyle} />
					<Couch
						style={{ zIndex: 3 }}
						commentators={props.commentators}
						host={props.host}
						audio={props.microphoneAudioIndicator}
					/>
					<img src={DreamhackLogo} style={{ width: "80%" }} />
					{/*<SponsorBoxS
						sponsors={props.sponsors}
						ref={sponsorRef}
						sponsorStyle={SponsorsSize}
						tweetStyle={TwitterSize}
					/>*/}
				</InfoBoxBG>
			</Sidebar>
		</StandardContainer>
	);
});

Standard.displayName = "Standard";
