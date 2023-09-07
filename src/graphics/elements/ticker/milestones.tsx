import React, { useImperativeHandle, useRef } from "react";
import styled from "styled-components";

import { TickerItemHandles } from "../ticker";

import { TickerTitle } from "./title";

const TickerMilestonesContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	height: 64px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	text-transform: uppercase;
	color: var(--text-light);
	font-size: 37px;
	z-index: 2;
`;

const NextMilestone = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	margin-right: 16px;
`;

const NextMilestoneEvent = styled.span`
	font-size: 20px;
`;

const NextMilestoneTotal = styled.span`
	font-size: 27px;
	font-weight: bold;
`;

const PrevMilestone = styled(NextMilestone)`
	// position: absolute;
	height: 100%;
	display: flex;
	align-items: center;
	margin: 0 4px 0 8px;
`;

// Determines full size
const ProgressContainer = styled.div`
	flex-grow: 1;
	height: 54px;
	margin: 0 16px 0 5px;
	border: 1px solid var(--text-light);
	position: relative;
	overflow: hidden;
`;

const ProgressBarContainer = styled.div`
	height: 100%;
	background: #ffffff;
	border-right: 5px solid var(--accent);
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

const CurrentAmount = styled(NextMilestoneTotal)`
	color: black;
	margin-right: 33px;
	font-weight: normal;
	width: 100px;
	text-align: right;
`;

type Milestone = {
	event?: string;
	total: number;
};

// @ts-ignore
const NUMBER_MILESTONES: Milestone[] = [
	{ event: "Start", total: 0 },
	{ total: 1000 },
	{ total: 2000 },
	{ total: 5000 },
	{ total: 7500 },
	{ total: 10000 },
	{ total: 25000 },
	{ total: 50000 },
	{ total: 75000 },
	{ total: 100000 },
].sort((a, b) => a.total - b.total);

// @ts-ignore
const ASM_MILESTONES: Milestone[] = [
	{ event: "ASM2016", total: 3066.52 },
	{ event: "ASM2017", total: 3271 },
	{ event: "ASM2018", total: 5091.84 },
	{ event: "ASM2019", total: 7026.63 },
	{ event: "ASM2020", total: 13069.69 },
	{ event: "ASM2021", total: 15000 },
	{ event: "ASM2022", total: 24551 },
	{ event: "ASM2023", total: 35000 },
].sort((a, b) => a.total - b.total);

// @ts-ignore
const PAX_MILESTONES: Milestone[] = [
	{ event: "PAX2017", total: 3200 },
	{ event: "PAX2019", total: 7181.73 },
	{ event: "PAX2021", total: 7222.37 },
	{ event: "ASAP2022", total: 8348.56 },
].sort((a, b) => a.total - b.total);

// @ts-ignore
const MISC_MILESTONES: Milestone[] = [
	{ event: "FAST2020", total: 7033 },
	{ event: "ASGX2023", total: 2316 },
].sort((a, b) => a.total - b.total);

interface Props {
	currentTotal: number;
}

// Milestones to use for the events
const MILESTONES = combineMilestones(ASM_MILESTONES);

function combineMilestones(milestones: Milestone[]): Milestone[] {
	// If the first array is empty, just return the second array.
	if (milestones.length === 0) {
		return NUMBER_MILESTONES;
	}

	const lastMilestone = milestones[milestones.length - 1].total;

	// Filter out items from the second array that are less than or equal to the last item of the first array.
	const filteredMilestones = NUMBER_MILESTONES.filter((milestone) => milestone.total > lastMilestone);

	return [...milestones, ...filteredMilestones];
}

export const TickerMilestones = React.forwardRef<TickerItemHandles, Props>((props: Props, ref) => {
	const containerRef = useRef(null);
	const progressBarRef = useRef(null);

	const prevMilestoneArray = MILESTONES.filter((milestone) => props.currentTotal >= milestone.total);
	const nextMilestone = MILESTONES.find((milestone) => props.currentTotal < milestone.total);

	if (prevMilestoneArray.length === 0) prevMilestoneArray.push({ event: "Start!", total: 0 });

	const prevMilestone = prevMilestoneArray[prevMilestoneArray.length - 1];

	const moneyDifference = props.currentTotal - prevMilestone.total;
	
	let showMilestones = true;
	let goalDifference = 1;
	let percentage = 100;
	if (nextMilestone) {
		goalDifference = nextMilestone.total - prevMilestone.total;
		percentage = (moneyDifference / goalDifference) * 100;
	} else {
		showMilestones = false;
	}

	useImperativeHandle(ref, () => ({
		animation: (tl) => {
			if (!showMilestones) return tl;

			// Start
			tl.set(progressBarRef.current, { width: 0 });
			tl.set(containerRef.current, { y: -64 });
			tl.to(containerRef.current, { y: 0, duration: 1 });

			tl.to(
				progressBarRef.current,
				{ width: `${percentage}%`, duration: Math.max(1, percentage / 45 + 0.5) },
				"+=1",
			);

			// End
			tl.to(containerRef.current, { y: 64, duration: 1 }, "+=10");
			tl.set(containerRef.current, { y: -64, duration: 1 });

			return tl;
		},
	}));

	if (!nextMilestone) return <></>;

	let textOnRightSide: React.CSSProperties = {};
	if (percentage < 50) {
		textOnRightSide = {
			marginRight: -110,
			color: "var(--text-light)",
			textAlign: "left",
		};
	}

	return (
		<TickerMilestonesContainer ref={containerRef} style={{ transform: "translate(0px, 64px)" }}>
			<TickerTitle>
				Milestone
				<br />
				Progress
			</TickerTitle>
			<PrevMilestone>
				<NextMilestoneEvent>{prevMilestone.event}</NextMilestoneEvent>
				<NextMilestoneTotal>${Math.floor(prevMilestone.total).toLocaleString()}</NextMilestoneTotal>
			</PrevMilestone>
			<ProgressContainer>
				<ProgressBarContainer ref={progressBarRef}>
					<CurrentAmount style={textOnRightSide}>
						${Math.floor(props.currentTotal).toLocaleString()}
					</CurrentAmount>
				</ProgressBarContainer>
			</ProgressContainer>
			<NextMilestone>
				<NextMilestoneEvent style={{ marginBottom: nextMilestone.event ? -14 : 0 }}>
					{nextMilestone.event}
				</NextMilestoneEvent>
				<NextMilestoneTotal>${Math.floor(nextMilestone.total).toLocaleString()}</NextMilestoneTotal>
			</NextMilestone>
		</TickerMilestonesContainer>
	);
});

TickerMilestones.displayName = "TickerMilestones";
