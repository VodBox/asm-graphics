import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import { useListenFor, useReplicant } from "use-nodecg";

import {
	Paper,
	IconButton,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Snackbar,
} from "@mui/material";
import { Close, Refresh } from "@mui/icons-material";
import Draggable from "react-draggable";
import format from "date-fns/format";

import type { Donation } from "@asm-graphics/types/Donations";

import { Header } from "./dashboards/header";
import { Donations } from "./dashboards/donations";
import { Upcoming } from "./dashboards/upcoming";
import { Incentives } from "./dashboards/incentives";
import { ManualDonations } from "./dashboards/manual-donations";
import { Timer } from "./dashboards/timer";
import { HostName } from "./dashboards/host-name";
import { DonationMatches } from "./dashboards/donation-matches";

const TWITCHPARENTS = nodecg.bundleConfig.twitch.parents;

const HostDashContainer = styled.div`
	height: 100vh;
	font-family:
		Noto Sans,
		sans-serif;
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
	const [donationTotalRep] = useReplicant<number>("donationTotal", 100);
	const [donationsRep] = useReplicant<Donation[]>("donations", []);
	const [manualDonationRep] = useReplicant<number>("manual-donation-total", 100);
	const [incentivesUpdatedRep] = useReplicant<number | undefined>("incentives:updated-at", undefined);
	const [hostLevelRep] = useReplicant<number>("x32:host-level", 0.75);
	const [currentTime, setCurrentTime] = useState("00:00:00");
	const [showScript, setShowScript] = useState(false);
	const [timeFormat, setTimeFormat] = useState(false); // False: 24hr, True: 12 Hour
	const [copyNotification, setCopyNotification] = useState(false);
	const [showStream, setShowStream] = useState(false);

	const [muted, setMuted] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date().toLocaleTimeString(timeFormat ? "en-AU" : "en-GB"));
		}, 500);
		return () => clearInterval(interval);
	}, [timeFormat]);

	useListenFor("incentivesUpdated", (statusCode) => {
		switch (statusCode) {
			case 200:
				if (incentiveLoadingRef.current) incentiveLoadingRef.current.classList.remove("rotate");
				break;
			case 400:
				break;
			default:
				nodecg.log.error("[Host dashboard] Unexpected status code: " + statusCode);
				break;
		}
	});

	const updateIncentives = () => {
		nodecg.sendMessage("updateIncentives");
		if (incentiveLoadingRef.current) incentiveLoadingRef.current.classList.add("rotate");
	};

	const showDialog = () => {
		setShowScript(true);
	};

	const hideDialog = () => {
		setShowScript(false);
	};

	const copyDonateCommand = () => {
		navigator.clipboard.writeText("!donate").then(() => {
			setCopyNotification(true);
		});
	};

	const closeCopyNotification = () => {
		setCopyNotification(false);
	};

	// TODO Clean this shizz up
	function muteOrUnmute() {
		if (muted) {
			nodecg.sendMessage("x32:setFader", { mixBus: 0, float: hostLevelRep, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 1, float: hostLevelRep, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 3, float: hostLevelRep, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 5, float: hostLevelRep, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 7, float: hostLevelRep, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 9, float: hostLevelRep, channel: 5 });
			setMuted(false);
		} else {
			nodecg.sendMessage("x32:setFader", { mixBus: 0, float: 0, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 1, float: 0, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 3, float: 0, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 5, float: 0, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 7, float: 0, channel: 5 });
			nodecg.sendMessage("x32:setFader", { mixBus: 9, float: 0, channel: 5 });
			setMuted(true);
		}
	}

	return (
		<HostDashContainer>
			<TopBar>
				<span
					onClick={() => {
						setTimeFormat(!timeFormat);
						setCurrentTime(new Date().toLocaleTimeString(!timeFormat ? "en-AU" : "en-GB"));
					}}
					style={{ cursor: "pointer", width: 500 }}>
					{currentTime}
				</span>
				<span onClick={showDialog} style={{ cursor: "pointer", width: 500, textAlign: "center" }}>
					Take a breath.
				</span>
				<span
					style={{ width: 500, textAlign: "right", cursor: "pointer" }}
					onClick={() => setShowStream(!showStream)}>
					{nodecg.bundleConfig.graphql?.event ?? ""}
				</span>
			</TopBar>
			{/* , height: 926  */}
			<div
				style={{
					display: "flex",
					gap: 8,
					background: "#ececec",
					height: "calc(100% - 76px)",
					boxSizing: "border-box",
				}}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: 8,
						gap: 8,
						height: "100%",
						flexBasis: "33%",
					}}>
					<Paper style={{ overflowY: "auto", overflowX: "hidden", minHeight: 160 }}>
						<Header text="Your Name :)" />
						<HostName />
					</Paper>
					<Paper style={{ overflowY: "auto", overflowX: "hidden" }}>
						<Header text="Donation Matches" />
						<DonationMatches style={{ height: "calc(100% - 56px)", overflowY: "auto", overflowX: "hidden" }} />
					</Paper>
					<Paper style={{ flexShrink: 1.5, overflowY: "auto", overflowX: "hidden" }}>
						<Header
							text={`Incentives – Last Updated: ${
								incentivesUpdatedRep ? format(incentivesUpdatedRep, "E h:mm:ss a") : "UNKNOWN"
							}`}
							url="https://docs.google.com/spreadsheets/d/1IsMrjs3Z09WfCmnj0r46WSTK3sbFPD9dXlkIsgMNIe8">
							<IconButton size="small" onClick={updateIncentives} ref={incentiveLoadingRef}>
								<Refresh fontSize="small" />
							</IconButton>
						</Header>
						<Incentives style={{ height: "calc(100% - 56px)", overflowY: "auto", overflowX: "hidden" }} />
					</Paper>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: 8,
						gap: 8,
						height: "100%",
						flexBasis: "33%",
					}}>
					<TotalBox>${(donationTotalRep + manualDonationRep ?? 0).toLocaleString()}</TotalBox>
					<Paper style={{ overflow: "hidden", height: 300, minHeight: 300 }}>
						<Timer />
					</Paper>
					<div style={{ display: "flex", height: 75 }}>
						<Button
							fullWidth
							color={muted ? "error" : "success"}
							onClick={muteOrUnmute}
							variant="contained">
							{muted ? "UNMUTE" : "Mute"}
						</Button>
					</div>
					<Paper style={{ overflow: "hidden", flexGrow: 1 }}>
						<Header
							text={`${donationsRep.length} Donations`}
							style={{ cursor: "pointer" }}
							onClick={copyDonateCommand}
						/>
						<Donations />
					</Paper>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: 8,
						gap: 8,
						height: "100%",
						flexBasis: "33%",
					}}>
					<Paper style={{ height: "49%", overflow: "hidden" }}>
						<Header text="Upcoming Runs" url="https://ausspeedruns.com/ASM2023/schedule" />
						<Upcoming style={{ height: "calc(100% - 56px)", overflowY: "auto", overflowX: "hidden" }} />
					</Paper>
					<Paper style={{ height: "49%", overflow: "hidden" }}>
						<Header text={`Manual Donations $${(manualDonationRep ?? 0).toLocaleString()}`} />
						<ManualDonations />
					</Paper>
				</div>
			</div>
			{showStream && (
				<Draggable defaultPosition={{ x: 25, y: -900 }}>
					<TwitchFloating>
						<iframe
							height={800}
							width={500}
							src={`https://www.twitch.tv/embed/ausspeedruns/chat?${TWITCHPARENTS.map((parent) => {
								return `&parent=${parent}`;
							}).join("")}&darkpopout`}
						/>
					</TwitchFloating>
				</Draggable>
			)}
			<Dialog open={showScript} onClose={hideDialog}>
				<DialogTitle id="alert-dialog-title">{"Example charity script"}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<div>
							<p>Video Ads</p>
							<Button variant="outlined" onClick={() => nodecg.sendMessage("playAd", "GOC")}>
								Game On Cancer (36 seconds)
							</Button>
							<Button variant="outlined" onClick={() => nodecg.sendMessage("playAd", "Elgato_WaveDX")}>
								ELGATO Wave DX (20 seconds)
							</Button>
							<Button variant="outlined" onClick={() => nodecg.sendMessage("playAd", "Elgato_KeyLight")}>
								ELGATO Keylight (45 seconds)
							</Button>
							<Button
								variant="outlined"
								onClick={() => nodecg.sendMessage("playAd", "Elgato_GreenScreen")}>
								ELGATO Green Screen (30 seconds)
							</Button>
							<Button
								variant="outlined"
								onClick={() => nodecg.sendMessage("playAd", "Elgato_WaveMicArm")}>
								ELGATO Wave Mic Arm (53 seconds)
							</Button>
						</div>
						<hr />
						<br />
						&quot;We are AusSpeedruns, a group doing speedrun events to raise money for charity. For this
						event we&apos;re raising money for Game on Cancer, a charity which funds early-career cancer
						researchers who are working across all areas of cancer research. If you&apos;d like to donate,
						you can go to donate.ausspeedruns.com&quot;
						<br />
						<br />
						(While doing this, if someone else hasn&apos;t, would recommend typing !donate in chat to
						trigger the bot to post the link in chat)
						<br />
						<br />
						Remember, this is just a guide, so slight modifications to feel more natural to you is fine (in
						fact, encouraged).
						<br />
						<p>
							Elgato are our major sponsor for this event and it&apos;s fantastic to have them on board to
							support the Game on Cancer initiative. Elgato are a world leading provider of audiovisual
							technology for content creators that make premium webcams, microphones, Stream Deck
							controllers, capture cards, and so much more -
							<br />
							-Including the Wave DX Microphone that I&apos;m using here, and the green screen and key
							lights being used throughout ASM. We (also) have some prizes you can win for donating during
							this event for people within Australia.
							<br />
							These prizes include Elgato Streamer packs, which consist of an Elgato Stream Deck Mk2 and a
							Wave 3 Microphone. We&apos;re also giving away plenty of games - including 3 physical copies
							of Sonic Origins Plus, provided by Five Star Games, 5 digital copies of Heavenly Bodies by
							2pt Interactive, and 3 digital copies of Speaking Simulator by Affable Games.
							<br />
							To enter into the pool for all these prizes a minimum donation of $100 is required, but even
							as little as $5 could see you winning one of these games.
							<br />
							For more information and the full terms and conditions, make sure to visit
							prizes.ausspeedruns.com.
							<br />
							And we&apos;d like to thank Elgato, Five Star Games, 2pt Interactive, and Affable Games for
							providing these wonderful prizes!
						</p>
						<p>
							(Again, recommend typing !prizes in chat to trigger the bot to post the link) proposed reads
							the prizes one is long, and its somewhat redundant to mention sponsor throughout and at the
							end, but feels better to throw in at mention of specific game for clarity given elgato
							haven&apos;t given anything specific in their wants, coming up with a secondary read feels
							frivolous - on proposal their &apos;secondary&apos; read would be from us during ASNN, but
							is obviously conditional on the green screen actually arriving (and &apos;third&apos; read
							being the mention during prizes) (also haven&apos;t added the rockford thing to prizes cause
							unsure if that&apos;s landed yet, given its a different type it&apos;d extend the read quite
							a bit further, and i&apos;d probably recommend to not read all the prizes all the time if we
							added it in)
						</p>
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
					vertical: "bottom",
					horizontal: "right",
				}}
				open={copyNotification}
				autoHideDuration={5000}
				onClose={closeCopyNotification}
				message="Copied '!donate' to clipboard"
				action={
					<IconButton size="small" aria-label="close" color="inherit" onClick={closeCopyNotification}>
						<Close fontSize="small" />
					</IconButton>
				}
			/>
		</HostDashContainer>
	);
};

createRoot(document.getElementById("root")!).render(<HostDash />);
