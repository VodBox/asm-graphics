import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';

// @ts-ignore
import TwitchLogo from '../media/TwitchGlitchPurple.svg';
import { RunDataPlayer } from '@asm-graphics/types/RunData';

import { FitText } from './fit-text';

function nameplateDirection(data: NameplateSide) {
	if (data.vertical) {
		return 'column';
	}

	if (data.nameplateLeft) {
		return 'row-reverse';
	}

	return 'row';
}

const NameplateContainer = styled.div`
	color: var(--text-light);
	width: 100%;
	/* height: ${(props: NameplateSide) => (props.vertical ? '100%' : '')}; */
	font-size: 30px;
	font-family: Nasalization;

	display: flex;
	flex-direction: ${(props: NameplateSide) => nameplateDirection(props)};
	justify-content: space-between;
	align-items: center;
`;

const Names = styled.div`
	background: linear-gradient(90deg, #785e16, #000000 20%, #000000 80%, #785e16);
	display: flex;
	flex-grow: 1;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: ${(props: NameplateSide) => (props.vertical ? '100%' : '')};
	position: relative;
`;

const SpeakingGlow = styled.div`
	opacity: ${(props: NameplateSide) => (props.speaking ? 1 : 0)};
	background: linear-gradient(90deg, var(--sec), #000000 20%, #000000 80%, var(--sec));
	position: absolute;
	width: 100%;
	height: 100%;
	transition-duration: 0.2s;
	transition-delay: ${(props: NameplateSide) => (props.speaking ? undefined : '0.5s')};
`;

const NormalName = styled(FitText)``;

const TwitchDiv = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
`;

const PronounBox = styled.div`
	background: var(--sec);
	font-family: Orbitron;
	font-weight: 400;
	font-size: 20px;
	text-transform: uppercase;
	color: var(--text-dark);
	padding: 0 8px;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	width: ${(props: NameplateSide) => (props.vertical ? '100%' : '')};
	box-sizing: border-box;
`;

const TwitchLogoImg = styled.img`
	height: 30px;
	width: auto;
	margin-right: 13px;
`;

interface Props {
	player: RunDataPlayer;
	nameplateLeft?: boolean;
	maxWidth?: number;
	icon?: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	speaking?: boolean;
	vertical?: boolean;
}

interface NameplateSide {
	nameplateLeft?: boolean;
	speaking?: boolean;
	vertical?: boolean;
}

// How many seconds it takes to fade between twitch and normal name
const nameLoopLength = 90;

export const Nameplate = (props: Props) => {
	const normalNameEl = useRef<HTMLDivElement>(null);
	const twitchNameEl = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Only loop if twitch name exists and if they are different, if the same then just display twitch
		if (props.player.social.twitch && props.player.name !== props.player.social.twitch) {
			const tl = gsap.timeline({
				repeat: -1,
				repeatDelay: nameLoopLength,
			});
			tl.set(normalNameEl.current, { opacity: 1 });
			tl.to(normalNameEl.current, { opacity: 0, duration: 1 });
			tl.to(twitchNameEl.current, { opacity: 1, duration: 1 });
			tl.to(twitchNameEl.current, { opacity: 0, duration: 1 }, `+=${nameLoopLength}`);
			tl.to(normalNameEl.current, { opacity: 1, duration: 1 });
		}
	}, [props.player.name, props.player.social.twitch]);

	const sameNameAndTwitch = props.player.name === props.player.social.twitch;

	const maxWidth = props.vertical ? (props.maxWidth ?? 999) * 0.7 : props.maxWidth ?? 999;

	return (
		<NameplateContainer
			style={props.style}
			className={props.className}
			nameplateLeft={props.nameplateLeft}
			speaking={props.speaking}
			vertical={props.vertical}>
			{props.icon}
			<Names speaking={props.speaking} vertical={props.vertical}>
				<SpeakingGlow speaking={props.speaking} />
				<div ref={normalNameEl} style={{ opacity: sameNameAndTwitch ? 0 : 1, zIndex: 2 }}>
					<NormalName style={{ maxWidth: maxWidth }} text={props.player.name} />
				</div>
				<TwitchDiv ref={twitchNameEl} style={{ opacity: sameNameAndTwitch ? 1 : 0, zIndex: 2 }}>
					<TwitchLogoImg src={TwitchLogo} />

					<div>
						<NormalName style={{ maxWidth: maxWidth - 45 }} text={props.player.social.twitch || ''} />
					</div>
				</TwitchDiv>
			</Names>
			{props.player.pronouns && (
				<PronounBox vertical={props.vertical}>
					<FitText
						style={{ maxWidth: props.vertical ? maxWidth : maxWidth * 0.45 }}
						text={props.player.pronouns}
					/>
				</PronounBox>
			)}
		</NameplateContainer>
	);
};
