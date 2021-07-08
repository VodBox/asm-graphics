import React, { useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { useListenFor, useReplicant } from 'use-nodecg';

import {
	Paper,
	Grid,
	IconButton,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Snackbar,
} from '@material-ui/core';
import { Close, Refresh } from '@material-ui/icons';
import Draggable from 'react-draggable';
// @ts-ignore
import { TwitchPlayer } from 'react-twitch-embed';

import { Header } from './dashboards/header';
import { Donations } from './dashboards/donations';
import { Upcoming } from './dashboards/upcoming';
import { Incentives } from './dashboards/incentives';
import { Twitter } from './dashboards/tweets';
import { StaffMessages } from './dashboards/staff-messages';
import { Timer } from './dashboards/timer';
import { HostName } from './dashboards/host-name';
import { Config } from '../types/ConfigSchema';

const TWITCHPARENTS = (nodecg.bundleConfig as Config).twitch.parents;

const HostDashContainer = styled.div`
	// height: 1007px;
	height: 100%;
	// width: 1920px;
	font-family: Noto Sans;
	// overflow: hidden;
`;

const TopBar = styled.div`
	height: 60px;
	background: var(--asm-orange);
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-weight: bold;
	padding: 0 16px;
	font-size: 29px;
	color: #ffffff;
`;

const TotalBox = styled(Paper)`
	font-weight: bold;
	font-size: 45px;
	text-align: center;
	padding: 8px 0;

	& .MutPaper-root {
		background: #555;
		color: #fff;
	}
`;

const TwitchFloating = styled.div`
	display: flex;
	padding: 10px;
	width: fit-content;
	background: var(--asm-orange);
	border-radius: 8px;
`;

export const HostDash: React.FC = () => {
	const incentiveLoadingRef = useRef<HTMLButtonElement>(null);
	// Implement donation total
	const [donationRep] = useReplicant<number, number>('donationTotal', 100);
	const [currentTime, setCurrentTime] = useState('00:00:00');
	const [showScript, setShowScript] = useState(false);
	const [timeFormat, setTimeFormat] = useState(false); // False: 24hr, True: 12 Hour
	const [copyNotif, setCopyNotif] = useState(false); // False: 24hr, True: 12 Hour
	const [showStream, setShowStream] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			if (timeFormat) {
				setCurrentTime(new Date().toLocaleTimeString('en-AU'));
			} else {
				setCurrentTime(new Date().toLocaleTimeString('en-GB'));
			}
		}, 500);
		return () => clearInterval(interval);
	}, [timeFormat]);

	useListenFor('incentivesUpdated', (statusCode: number) => {
		switch (statusCode) {
			case 200:
				if (incentiveLoadingRef.current) incentiveLoadingRef.current.classList.remove('rotate');
				break;
			case 400:
				break;

			default:
				nodecg.log.error('[Host dashboard] Unexpected status code: ' + statusCode);
				break;
		}
	});

	const updateIncentives = () => {
		nodecg.sendMessage('updateIncentives');
		if (incentiveLoadingRef.current) incentiveLoadingRef.current.classList.add('rotate');
	};

	const showDialog = () => {
		setShowScript(true);
	};

	const hideDialog = () => {
		setShowScript(false);
	};

	const copyDonateCommand = () => {
		navigator.clipboard.writeText('!donate').then(() => {
			setCopyNotif(true);
		});
	};

	const closeCopyNotif = () => {
		setCopyNotif(false);
	};

	return (
		<HostDashContainer>
			<TopBar>
				<span onClick={() => setTimeFormat(!timeFormat)} style={{ cursor: 'pointer', width: 500 }}>
					{currentTime}
				</span>
				<span onClick={showDialog} style={{ cursor: 'pointer', width: 500, textAlign: 'center' }}>
					Take a breath.
				</span>
				<span style={{ width: 500, textAlign: 'right', cursor: 'pointer' }} onClick={() => setShowStream(!showStream)}>ASM2021</span>
			</TopBar>
			{/* , height: 926  */}
			<Grid container justify="space-around" style={{ background: '#ececec', height: 'calc(100% - 60px)' }}>
				<Grid
					item
					container
					justify="space-around"
					direction="column"
					xs
					style={{ padding: 8, height: '100%' }}>
					<Paper style={{ height: '14%', overflowY: 'auto', overflowX: 'hidden' }}>
						<Header text="Your Name :)" />
						<HostName />
					</Paper>
					<Paper style={{ height: '42%', overflowY: 'auto', overflowX: 'hidden' }}>
						<Header text="Tweets" />
						<Twitter />
					</Paper>
					<Paper style={{ height: '42%', overflowY: 'auto', overflowX: 'hidden' }}>
						<Header
							text="Incentives"
							url="https://docs.google.com/spreadsheets/d/1GjMC3pwOqqJ8USRTlZVpdvCsx-7e55qucVTjGt2Ffrk">
							<IconButton size="small" onClick={updateIncentives} ref={incentiveLoadingRef}>
								<Refresh fontSize="small" />
							</IconButton>
						</Header>
						<Incentives style={{ height: 'calc(100% - 56px)', overflowY: 'auto', overflowX: 'hidden' }} />
					</Paper>
				</Grid>
				<Grid
					item
					container
					justify="space-around"
					wrap="nowrap"
					direction="column"
					xs
					style={{ padding: 8, gap: 8, height: '100%' }}>
					<TotalBox>${(donationRep || 10000).toLocaleString()}</TotalBox>
					<Paper style={{ overflow: 'hidden', height: 209, minHeight: 209 }}>
						<Timer />
					</Paper>
					<Paper style={{ overflow: 'hidden' }}>
						<Header text="Donations" style={{ cursor: 'pointer' }} onClick={copyDonateCommand} />
						<Donations />
					</Paper>
				</Grid>
				<Grid
					item
					container
					justify="space-around"
					direction="column"
					xs
					style={{ padding: 8, height: '100%' }}>
					<Paper style={{ height: '49%', overflow: 'hidden' }}>
						<Header text="Upcoming Runs" url="https://horaro.org/asm2021/schedule" />
						<Upcoming style={{ height: 'calc(100% - 56px)', overflowY: 'auto', overflowX: 'hidden' }} />
					</Paper>
					<Paper style={{ height: '49%', overflow: 'hidden' }}>
						<Header text="Staff Messages" />
						<StaffMessages />
					</Paper>
				</Grid>
			</Grid>
			{showStream && (
				<Draggable defaultPosition={{x: 25, y: -900}}>
					<TwitchFloating>
						<TwitchPlayer channel="ausspeedruns" parents={TWITCHPARENTS} width={958} height={539} />
						<iframe
							height={539}
							width={250}
							src={`https://www.twitch.tv/embed/ausspeedruns/chat?${TWITCHPARENTS.map((parent) => {
								return `&parent=${parent}`;
							}).join('')}&darkpopout`}
						/>
					</TwitchFloating>
				</Draggable>
			)}
			<Dialog open={showScript} onClose={hideDialog}>
				<DialogTitle id="alert-dialog-title">{'Example charity script'}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						&quot;We are AusSpeedruns, a group who does speedrun events to raise money for charity. For this
						event we&apos;re raising money for Royal Flying Doctor Service, who provide emergency medical
						and primary health care services to anyone who lives, works or travels in rural and remote
						Australia. If you&apos;d like to donate, you can go to ausspeedruns.com&quot;
						<br />
						<br />
						(While doing this, if someone else hasn&apos;t, would recommend typing !donate in chat to
						trigger the bot to post the donation link in chat)
						<br />
						<br />
						Remember, this is just a guide, so slight modifications to feel more natural to you is fine (in
						fact, encouraged). For example just changing it to something like:
						<br />
						<br />
						&quot;We&apos;re AusSpeedruns, and we do speedrun events to raise money for charity. For ASM2021
						we&apos;re raising money for the Royal Flying Doctor Service, a charity that provides primary
						and emergency health services to people in remote and rural areas across Australia. If
						you&apos;d like to donate, the link to do so is ausspeedruns.com&quot;
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={hideDialog} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				open={copyNotif}
				autoHideDuration={5000}
				onClose={closeCopyNotif}
				message="Copied '!donate' to clipboard"
				action={
					<IconButton size="small" aria-label="close" color="inherit" onClick={closeCopyNotif}>
						<Close fontSize="small" />
					</IconButton>
				}
			/>
		</HostDashContainer>
	);
};

render(<HostDash />, document.getElementById('hostdash'));
