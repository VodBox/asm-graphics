import * as nodecgApiContext from "./nodecg-api-context";

import type { Commentator } from "@asm-graphics/types/OverlayProps";
import type { Donation, DonationMatch } from "@asm-graphics/types/Donations";
import type { Goal, War } from "@asm-graphics/types/Incentives";
import type { Stream } from "@asm-graphics/types/Streams";
import type { CurrentOverlay } from "@asm-graphics/types/CurrentOverlay";
import type { StaffMessage } from "@asm-graphics/types/StaffMessages";
import type { Tweet } from "@asm-graphics/types/Twitter";
import type { AudioIndicator, OBSAudioIndicator } from "@asm-graphics/types/Audio";
import type { User as AusSpeedrunsUser } from "@asm-graphics/types/AusSpeedrunsWebsite";
import type { ConnectionStatus } from "@asm-graphics/types/Connections";
import { SM64MovementAbilities } from "./sm64-rando";

const nodecg = nodecgApiContext.get();

nodecg.log.info("Setting up replicants");

/* Commentators/Host */
export const commentatorsRep = nodecg.Replicant<Commentator[]>("commentators", { defaultValue: [], persistent: true });
export const hostRep = nodecg.Replicant<Commentator>("host", {
	defaultValue: {
		id: "host",
		name: "",
	},
	persistent: true,
});
export const headsetsUsed = nodecg.Replicant<Record<string, number>>("headsets-used", {
	defaultValue: {},
	persistent: true,
});

/* Donations */
export const donationTotalRep = nodecg.Replicant<number>("donationTotal", { defaultValue: 0 });
export const donationsRep = nodecg.Replicant<Donation[]>("donations", { defaultValue: [] });
export const manualDonationsRep = nodecg.Replicant<Donation[]>("manual-donations", { defaultValue: [] });
export const manualDonationTotalRep = nodecg.Replicant<number>("manual-donation-total", { defaultValue: 0 });
export const donationMatchesRep = nodecg.Replicant<DonationMatch[]>("donation-matches", { defaultValue: [] });

/* Audio Shared */
export const gameAudioActiveRep = nodecg.Replicant<number>("game-audio-indicator", { defaultValue: -1 });
export const microphoneGateRep = nodecg.Replicant<number>("x32:audio-gate", { defaultValue: -10 });
export const hostLevelRep = nodecg.Replicant<number>("x32:host-level", { defaultValue: 0.75 });
export const gameAudioNamesRep = nodecg.Replicant<string[]>("game-audio-names", { defaultValue: [] });

/* OBS Audio */
export const obsAudioActivityRep = nodecg.Replicant<OBSAudioIndicator[]>("obs-audio-indicator", {
	defaultValue: [],
	persistent: false,
});
export const obsMicrophoneGateRep = nodecg.Replicant<number>("obs:audio-gate", { defaultValue: -10 });

/* X32 Audio */
export const x32StatusRep = nodecg.Replicant<ConnectionStatus>("x32:status", {
	defaultValue: "disconnected",
	persistent: false,
});
export const x32AudioActivityRep = nodecg.Replicant<AudioIndicator>("audio-indicators", { defaultValue: {} });
export const x32BusFadersRep = nodecg.Replicant<number[][]>("x32:busFaders", { defaultValue: [], persistent: false });

/* Incentives */
export const incentivesRep = nodecg.Replicant<(Goal | War)[]>("incentives", { defaultValue: [] });

/* Overlay/Online */
export const currentOverlayRep = nodecg.Replicant<CurrentOverlay>("currentOverlay", {
	defaultValue: { preview: "widescreen", live: "standard" },
});
export const twitchStreamsRep = nodecg.Replicant<Stream[]>("twitchStreams", { defaultValue: [] });

/* Staff Messages DEPRECATED */
export const staffMessagesRep = nodecg.Replicant<StaffMessage[]>("staff-messages", { defaultValue: [] });

/* GraphQL */
export const incentivesUpdatedLastRep = nodecg.Replicant<number | undefined>("incentives:updated-at", {
	defaultValue: undefined,
});
export const allAusSpeedrunsUsernamesRep = nodecg.Replicant<AusSpeedrunsUser[]>("all-usernames", { defaultValue: [] });

/* OBS */
export const obsStatusRep = nodecg.Replicant<ConnectionStatus>("obs:status", {
	defaultValue: "disconnected",
	persistent: false,
});
export const obsCurrentSceneRep = nodecg.Replicant<string>("obs:currentScene", { defaultValue: "Intermission" });
export const obsStreamTimecode = nodecg.Replicant<string | undefined>("obs:streamTimecode", { defaultValue: undefined });

/* Credits */
export const lowerThirdNameRep = nodecg.Replicant<{ name: string; title: string }>("credits-name", {
	defaultValue: { name: "", title: "" },
});

/* Runner Tablet */
export const runnerStatusRep = nodecg.Replicant<boolean>("runner:ready", { defaultValue: false });
export const techStatusRep = nodecg.Replicant<boolean>("tech:ready", { defaultValue: false });

/* ASMM */
export const asmmTotalKmRep = nodecg.Replicant<number>("asmm:totalKM", { defaultValue: 0 });

/* ASNN */
export const asnnHeadlineRep = nodecg.Replicant<string>("asnn:headline", { defaultValue: "" });
export const asnnTickerRep = nodecg.Replicant<string[]>("asnn:ticker", { defaultValue: [] });

/* Randomiser */
export const sm64RandoRep = nodecg.Replicant<SM64MovementAbilities>("rando:sm64-movement", {
	defaultValue: {
		jump: false,
		tripleJump: false,
		sideFlip: false,
		longJump: false,
		kick: false,
		backFlip: false,
		groundPound: false,
		wallKick: false,
		climb: false,
		dive: false,
		grab: false,
		ledgeGrab: false,
		keyUpstairs: false,
		keyDownstairs: false,
		capMetal: false,
		capWing: false,
		capInvisibility: false,
	}
});
