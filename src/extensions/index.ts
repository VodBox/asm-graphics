import type { ConfigSchema } from "@asm-graphics/types/ConfigSchema";
import * as nodecgApiContext from "./nodecg-api-context";
import { ExtendedServerAPI } from "@asm-graphics/types/NodeCGExtension";

let ncgConfig: ExtendedServerAPI<ConfigSchema>["bundleConfig"];

module.exports = (nodecg: ExtendedServerAPI<ConfigSchema>) => {
	// Store a reference to this nodecg API context in a place where other libs can easily access it.
	// This must be done before any other files are `require`d.
	nodecgApiContext.set(nodecg);
	ncgConfig = nodecg.bundleConfig;
	init()
		.then(() => {
			nodecg.log.info("Initialization successful.");
		})
		.catch((error) => {
			nodecg.log.error("Failed to initialize:", error);
		});
};

async function init() {
	const nodecg = nodecgApiContext.get();

	nodecg.Replicant('collections', 'nodecg').on('change', newVal => {
		console.log("COLLECTIONS");
		console.log(JSON.stringify(newVal));
	});

	nodecg.Replicant('bundles', 'nodecg').on('change', newVal => {
		console.log("BUNDLES");
		console.log(JSON.stringify(newVal));
	});

	nodecg.Replicant('graphics:instances', 'nodecg').on('change', newVal => {
		console.log("INSTANCES");
		console.log(JSON.stringify(newVal));
	});

	require("./replicants");

	// The order of these is literally just the chronological order of when they were made, a.k.a the best way to watch Star Wars

	if (ncgConfig.obs.enabled) {
		// require('./util/obs');
		require("./obs-local");
	}

	require("./commentators");

	if (ncgConfig.twitter.enabled) {
		require("./twitter");
		require("./util/twitter");
	} else {
		nodecg.log.info("Twitter not enabled. Showing tweets will not work");
	}

	if (ncgConfig?.tiltify?.enabled) {
		// require('./donations/tiltify');
		require("./donations/tiltify-v5");
	}

	require("./incentives");
	require("./staff-messages");
	require("./donations");
	require("./schedule-import");
	require("./ausspeedruns-website");

	if (ncgConfig.x32?.enabled) {
		require("./x32-audio");
	}

	require("./runner-tablet");

	if (ncgConfig.asmm?.enabled) {
		require("./asmm");
	}
}
