import React from 'react';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';

import { OverlayProps } from '../../types/OverlayProps';

import { Timer } from '../elements/timer';
import * as RunInfo from '../elements/run-info';
import { SponsorsBox } from '../elements/sponsors';
import { AudioIndicator } from '../elements/audio-indicator';
import { Facecam } from '../elements/facecam';
import { RaceFinish } from '../elements/race-finish';
import { OrangeStripe } from '../elements/orange-stripe';
import { Couch } from '../elements/couch';

const Standard2Container = styled.div`
	height: 1016px;
	width: 1920px;
`;

const Topbar = styled.div`
	display: flex;
	position: absolute;
	height: 296px;
	width: 1920px;
	border-bottom: 1px solid var(--asm-orange);
	overflow: hidden;
`;

const InfoTopDivider = styled.div`
	height: 1px;
	width: 652px;
	background: var(--asm-orange);
`;

const InfoSideDivider = styled.div`
	height: 100px;
	width: 1px;
	background: var(--asm-orange);
`;

const VerticalStack = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-evenly;
`;

const InfoBox = styled.div`
	height: 100%;
	width: 666px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	padding-top: 10px;
	box-sizing: border-box;
	background: var(--main-col);
`;

const InfoSubBox = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	width: 100%;
`;

const RightBox = styled.div`
	width: 666px;
	height: 100%;
	background: var(--main-col);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const SponsorSize = {
	height: 195,
	width: 340,
};

const TwitterSize = {
	height: 200,
	width: 400,
	marginTop: -40,
};

const CentralDivider = styled.div`
	height: 719px;
	width: 2px;
	position: absolute;
	top: 297px;
	left: 959px;
	background: var(--asm-orange);
`;

export const Standard2: React.FC<OverlayProps> = (props) => {
	const [audioIndicatorRep] = useReplicant<string, string>(
		'audio-indicator',
		'',
	);

	let raceTimers = (
		<>
			<RaceFinish
				style={{ top: 220, left: 830 }}
				time={props.timer}
				teamID={props.runData?.teams[0]?.id || ''}
			/>
			<RaceFinish
				style={{ top: 220, left: 960 }}
				time={props.timer}
				teamID={props.runData?.teams[1]?.id || ''}
			/>
		</>
	);

	return (
		<Standard2Container>
			<Topbar>
				<InfoBox>
					<VerticalStack style={{ height: 100 }}>
						<RunInfo.GameTitle
							maxWidth={540}
							game={props.runData?.game || ''}
							style={{ fontSize: 37 }}
						/>
						<RunInfo.System
							system={props.runData?.system || ''}
							style={{ fontSize: 25, zIndex: 2 }}
						/>
					</VerticalStack>
					<InfoTopDivider />
					<InfoSubBox>
						<VerticalStack style={{ height: 120 }}>
							<RunInfo.Category
								maxWidth={370}
								category={props.runData?.category || ''}
							/>
							<RunInfo.Estimate
								fontSize={30}
								estimate={props.runData?.estimate || ''}
							/>
						</VerticalStack>
						<InfoSideDivider />
						<Timer fontSize={75} timer={props.timer} />
					</InfoSubBox>
					<OrangeStripe
						side="bottom"
						style={{
							transform: 'scaleY(1.28125)',
							transformOrigin: 'bottom',
						}}
					/>
				</InfoBox>

				<AudioIndicator
					active={
						audioIndicatorRep ===
						(props.runData?.teams[0]?.id || '')
					}
					side="left"
					style={{ position: 'absolute', top: 255, left: 625 }}
				/>
				<AudioIndicator
					active={
						audioIndicatorRep ===
						(props.runData?.teams[1]?.id || '')
					}
					side="right"
					style={{
						position: 'absolute',
						top: 255,
						right: 625,
						zIndex: 2,
					}}
				/>

				<Facecam
					width={586}
					style={{
						borderRight: '1px solid var(--asm-orange)',
						borderLeft: '1px solid var(--asm-orange)',
					}}
					teams={props.runData?.teams[0]}
				/>

				{raceTimers}

				<RightBox>
					<div
						style={{ display: 'flex', width: '100%', flexGrow: 1, alignItems: 'center' }}>
						<Couch
							couch={
								props.preview
									? props.couchInformation.preview
									: props.couchInformation.current
							}
							style={{ width: '30%' }}
						/>
						<SponsorsBox
							style={{ flexGrow: 1 }}
							sponsorStyle={SponsorSize}
							tweetStyle={TwitterSize}
						/>
					</div>
					<OrangeStripe
						side="bottom"
						style={{
							transform: 'scaleY(1.28125)',
							transformOrigin: 'bottom',
						}}
					/>
				</RightBox>
			</Topbar>
			<CentralDivider />
		</Standard2Container>
	);
};
