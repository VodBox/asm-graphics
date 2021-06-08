import React from 'react';
import styled from 'styled-components';

import { FitText } from '../fit-text';

import { RunData } from '../../../types/RunData';

const InterNextRunItemContainer = styled.div`
	height: 80px;
	width: 100%;
	font-family: Noto Sans;
	background: linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 100%);
	display: flex;
`;

const Time = styled.div`
	width: 100px;
	font-size: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #000000;
	border-right: 5px solid var(--main-col);
`;

const InfoBlock = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	//align-items: center;
	//justify-content: center;
	color: #000000;
	padding: 5px 10px 5px 5px;
`;

const GameTitle = styled(FitText)`
	font-size: 33px;
	max-width: 370px;
`;

const TopText = styled.div`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	width: 100%;
	margin-top: -4px;
`;

const Category = styled(FitText)`
	max-width: 320px;
`;

const Runners = styled(FitText)`
	max-width: 182px;
`;

interface Props {
	run: RunData;
}

export const InterNextRunItem: React.FC<Props> = (props: Props) => {
	const scheduleTime = new Date(props.run.scheduled || '');

	// Thanks setup block
	let playerNames;
	if (props.run.teams.length === 0) {
		playerNames = '';
	} else {
		playerNames = props.run?.teams
			.map((team) => {
				return team.players.map((player) => player.name).join(', ');
			})
			.join(' vs ');
	}

	// If one team then combine
	// If more then combine team names and add vs

	return (
		<InterNextRunItemContainer>
			<Time>{scheduleTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</Time>
			<InfoBlock>
				<TopText>
					<GameTitle text={props.run.game || ''} />
					{/* <System>{props.run.system}</System> */}
					<span style={{ fontSize: 25 }}>
						<span style={{ fontSize: 14 }}>EST </span>
						{props.run.estimate}
					</span>
				</TopText>
				<TopText style={{ fontSize: 18, marginTop: 5 }}>
					<Category text={props.run.category?.toUpperCase() || ''} />
					<Runners text={playerNames || ''} />
				</TopText>
			</InfoBlock>
		</InterNextRunItemContainer>
	);
};

const EndRunCont = styled.div`
	color: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 34px;
	margin-top: -15px;
`;

export const EndRunItem: React.FC = () => {
	return (
		<EndRunCont>
			<span>The End</span>
			<span>
				<b>Thank you for watching FAST 2020!</b>
			</span>
		</EndRunCont>
	);
};
