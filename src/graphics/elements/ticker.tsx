import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import gsap from "gsap";
import { format } from "date-fns";

import { RunDataArray, RunDataActiveRun } from "@asm-graphics/types/RunData";
import { Goal, War } from "@asm-graphics/types/Incentives";

import { TickerRuns } from "./ticker/runs";
import { TickerCTA } from "./ticker/cta";
import { TickerMilestones } from "./ticker/milestones";
import { TickerGoals } from "./ticker/goal";
import { TickerWar } from "./ticker/war";
import { LerpNum } from "./ticker/lerp-num";
import { TickerPrizes } from "./ticker/prizes";
import { TickerASMM } from "./ticker/asmm";

import ChannelBug from "../media/ASM-Gif.gif";
// import ChannelBug from '../media/TGXBug.svg';
import GoCLogo from "../media/Sponsors/GoCWhite.svg";
import TickerGreeble from "../media/ASM23/ticker.png";

const TickerContainer = styled.div`
	height: 64px;
	width: 1920px;
	background: var(--main);
	font-family: var(--main-font);
	display: flex;
	justify-content: space-between;
	overflow: hidden;
`;

const ASMLogo = styled.img`
	height: 64px;
	width: auto;
`;

const DonationArea = styled.div`
	height: 100%;
	width: fit-content;
	float: right;
	font-size: 37px;

	display: flex;
	align-items: center;
	padding: 0 10px;
	color: var(--text-light);
	font-weight: bold;
	font-family: var(--mono-font);
`;

const CurrentTimeArea = styled.div`
	height: 100%;
	width: fit-content;
	background: var(--sec);
	color: var(--text-dark);
	font-weight: bold;
	/* border-left: 6px solid var(--accent); */
	padding: 0 16px;
	text-transform: uppercase;
	font-size: 22px;
	text-align: center;
	display: flex;
	align-items: center;
	line-height: 20px;
	font-family: var(--mono-font);
`;

const ContentArea = styled.div`
	height: 64px;
	// width: 1435px;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
	font-family: var(--main-font);
`;

const CharityLogo = styled.img`
	height: 45px;
	width: auto;
	margin-left: 10px;
`;

const LeftBlock = styled.div`
	display: flex;
`;

export interface TickerItemHandles {
	animation(tl: gsap.core.Timeline): gsap.core.Timeline;
}

export interface TickerProps {
	runDataArray: RunDataArray;
	runDataActive: RunDataActiveRun;
	incentives?: (Goal | War)[];
	donationAmount: number;
	asmm?: number;
	tickerOrder: {
		type: "cta" | "milestone" | "prizes" | "goals" | "wars" | "nextruns" | "asmm";
		id?: number;
	}[];
}

export const Ticker: React.FC<TickerProps> = (props) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [numberOfLoops, setNumberOfLoops] = useState(0);
	const contentRef = useRef<HTMLDivElement>(null);
	const runsRef = useRef<TickerItemHandles>(null);
	const ctaRef = useRef<TickerItemHandles>(null);
	const milestoneRef = useRef<TickerItemHandles>(null);
	const goalsRef = useRef<TickerItemHandles>(null);
	const warsRef = useRef<TickerItemHandles>(null);
	const prizesRef = useRef<TickerItemHandles>(null);
	const asmmRef = useRef<TickerItemHandles>(null);

	let goalIncentives: Goal[] = [];
	let warIncentives: War[] = [];
	if (props.incentives) {
		goalIncentives = props.incentives
			.filter((incentive) => {
				if (incentive.active && incentive.type === "Goal") {
					return incentive;
				}

				return undefined;
			})
			.slice(0, 3) as Goal[];

		warIncentives = props.incentives
			.filter((incentive) => {
				if (incentive.active && incentive.type === "War") {
					return incentive;
				}

				return undefined;
			})
			.slice(0, 3) as War[];
	}

	const showContent = (element: TickerItemHandles | null) => {
		const tl = gsap.timeline();

		if (!element) return tl;

		element.animation(tl);
		return tl;
	};

	const runLoop = useCallback((order: { type: string; id?: number }[]) => {
		setNumberOfLoops(numberOfLoops + 1);
		const localTl = gsap.timeline({ onComplete: runLoop });

		// -=1.02 so that the animation "overlaps" and if it was just -1 there would be a 1px tall gap
		order.forEach((type) => {
			switch (type.type) {
				case "cta":
					localTl.add(showContent(ctaRef.current), "-=1.02");
					break;
				case "nextruns":
					localTl.add(showContent(runsRef.current), "-=1.02");
					break;
				case "prizes":
					localTl.add(showContent(prizesRef.current), "-=1.02");
					break;
				case "goals":
					localTl.add(showContent(goalsRef.current), "-=1.02");
					break;
				case "wars":
					localTl.add(showContent(warsRef.current), "-=1.02");
					break;
				case "milestone":
					localTl.add(showContent(milestoneRef.current), "-=1.02");
					break;
				case "asmm":
					localTl.add(showContent(asmmRef.current), "-=1.02");
					break;
				default:
					break;
			}
		});

		localTl.play();
	}, [numberOfLoops]);

	useEffect(() => {
		gsap.defaults({ ease: "power2.inOut" });

		if (props.tickerOrder.length === 0) return;

		runLoop(props.tickerOrder);
	}, [props.tickerOrder, runLoop]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 500);
		return () => clearInterval(interval);
	}, []);

	return (
		<TickerContainer>
			<LeftBlock>
				<ASMLogo src={ChannelBug} />
			</LeftBlock>
			<ContentArea ref={contentRef}>
				<TickerRuns ref={runsRef} currentRun={props.runDataActive} runArray={props.runDataArray} />
				<TickerCTA ref={ctaRef} currentTotal={props.donationAmount} />
				<TickerMilestones currentTotal={props.donationAmount} ref={milestoneRef} />
				<TickerGoals goals={goalIncentives} ref={goalsRef} />
				<TickerWar wars={warIncentives} ref={warsRef} />
				<TickerPrizes ref={prizesRef} />
				<TickerASMM ref={asmmRef} totalKM={props.asmm ?? 0} />
				<img
					src={TickerGreeble}
					style={{ height: "100%", width: "auto", position: "absolute", right: 0, zIndex: 1 }}
				/>
			</ContentArea>
			<CurrentTimeArea>
				{format(currentTime, "E d")}
				<br />
				{format(currentTime, "h:mm a")}
			</CurrentTimeArea>
			<DonationArea>
				$<LerpNum value={props.donationAmount} />
				<CharityLogo src={GoCLogo} />
			</DonationArea>
		</TickerContainer>
	);
};
