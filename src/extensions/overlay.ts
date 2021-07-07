import * as nodecgApiContext from './nodecg-api-context';
import obs from './util/obs';

import { CurrentOverlay } from '../types/CurrentOverlay';
import { Stream } from '../types/Streams';
import { CouchInformation, NoCam } from '../types/OverlayProps';

const nodecg = nodecgApiContext.get();

const currentOverlayRep = nodecg.Replicant<CurrentOverlay>('currentOverlay');
const twitchStreamsRep = nodecg.Replicant<Stream[]>('twitchStreams');
const currentSceneRep = nodecg.Replicant<string>('obsCurrentScene');
const couchNamesRep = nodecg.Replicant<CouchInformation>('couch-names');
const noCamRep = nodecg.Replicant<NoCam>('no-cam');

// Manual obs connections
nodecg.listenFor('connectOBS', () => {
	try {
		obs.connect();
	} catch (error) {
		nodecg.log.error(`[Overlay] Failed to connect to OBS: ${error}`)
	}
});

nodecg.listenFor('disconnectOBS', () => {
	try {
		obs.disconnect();
	} catch (error) {
		nodecg.log.error(`[Overlay] Failed to disconnect to OBS: ${error}`)
	}
});

nodecg.listenFor('changeOverlayPreview', (newVal: string) => {
	currentOverlayRep.value.preview = newVal;
});

// This should only be used for developer testing purposes
nodecg.listenFor('changeOverlayLive', (newVal: string) => {
	currentOverlayRep.value.live = newVal;
});

// Twitch stream commands, could probably combine these to one since I am logging even hidden ones
nodecg.listenFor('newTwitchStream', (newVal: Stream) => {
	const index = twitchStreamsRep.value.findIndex(stream => stream.channel === newVal.channel);
	if (index === -1) {
		// Add new stream
		twitchStreamsRep.value.push(newVal);
	} else {
		// Update size
		twitchStreamsRep.value[index].size = newVal.size;

		if (twitchStreamsRep.value[index].state === 'live') {
			twitchStreamsRep.value[index].state = 'both';
		} else {
			twitchStreamsRep.value[index].state = 'preview';
		}
	}

	const clonedArray = twitchStreamsRep.value.slice();

	clonedArray.sort((a, b) => {
		if (a.channel < b.channel) return -1;
		if (a.channel > b.channel) return 1;
		return 0;
	});

	twitchStreamsRep.value = clonedArray;
});

nodecg.listenFor('removeTwitchStream', (newVal: string) => {
	const index = twitchStreamsRep.value.findIndex(stream => stream.channel === newVal);
	if (index === -1) {
		nodecg.log.warn(`[OBS] Tried removing Stream ${newVal} but it couldn't be found`);
	} else if (twitchStreamsRep.value[index].state === 'preview') {
		twitchStreamsRep.value[index].state = 'hidden';
	} else if (twitchStreamsRep.value[index].state === 'both') {
		twitchStreamsRep.value[index].state = 'live';
	}
});

nodecg.listenFor('transitionGameplay', () => {
	// Check if intermission is live
	obs.send('GetCurrentScene').then(val => {
		nodecg.sendMessage('runTransitionGraphic');

		if (val.name === 'Intermission') {
			transitionGameplay();
			obs.transition('Game Overlay');
		} else {
			// Wait for 1.5 seconds to switch gameplay router
			setTimeout(transitionGameplay, 1600);
		}
	});
});

function transitionGameplay() {
	// Change graphic
	currentOverlayRep.value = {
		live: currentOverlayRep.value.preview,
		preview: currentOverlayRep.value.live
	};

	// Change couch names
	couchNamesRep.value = {
		current: couchNamesRep.value.preview,
		preview: couchNamesRep.value.current
	}

	// Change no cam
	noCamRep.value = {
		current: noCamRep.value.preview,
		preview: noCamRep.value.current
	}


	// Change livestreams
	const liveStreams = twitchStreamsRep.value.map(stream => {
		const modifiedStream = stream;
		if (stream.state === 'preview') {
			modifiedStream.state = 'live';
		} else if (stream.state === 'live') {
			modifiedStream.state = 'preview';
		} else if (stream.state === 'both') {
			// Do Nothing
		} else {
			modifiedStream.state = 'hidden';
		}

		return modifiedStream;
	});

	twitchStreamsRep.value = liveStreams;

	// Change livestream sources
	liveStreams.forEach(stream => {
		// We're only changing the ASM Stations
		const obsSourceName = `ASM Station ${stream.channel.slice(-1)}`;
		if (stream.state === 'live' || stream.state === 'both') {
			obs.enableSource(obsSourceName, true, 'Game Overlay');

			switch (stream.size) {
				case 'left':
					obs.setSceneItemProperties('Game Overlay', obsSourceName, { position: { x: 0 }, crop: { right: 960, left: 0 }, bounds: {}, scale: {} });
					break;

				case 'right':
					obs.setSceneItemProperties('Game Overlay', obsSourceName, { position: { x: 960 }, crop: { right: 0, left: 960 }, bounds: {}, scale: {} });
					break;

				case 'whole':
				default:
					obs.setSceneItemProperties('Game Overlay', obsSourceName, { position: { x: 0 }, crop: { right: 0, left: 0 }, bounds: {}, scale: {} });
					break;
			}

		} else {
			// Reset source
			obs.enableSource(obsSourceName, false, 'Game Overlay');
			obs.setSceneItemProperties('Game Overlay', obsSourceName, { position: { x: 0, y: 0 }, scale: { x: 1920, y: 1080 }, crop: { right: 0, left: 0 }, bounds: {} });
		}
	});

	nodecg.sendMessage('updateAudioMutes');
}


// Intermission
nodecg.listenFor('goToIntermission', () => {
	nodecg.sendMessage('runTransitionGraphic');
	obs.transition('Intermission');
});

// If a transition is done from OBS
obs.on('TransitionBegin', () => {
	nodecg.sendMessage('runTransitionGraphic');
});

// CURRENT SCENE
// Change current scene replicant on scene change
obs.on('SwitchScenes', () => {
	getCurrentScene();
});

// Set replicant value on connection
obs.on('ConnectionOpened', () => {
	getCurrentScene();
});


function getCurrentScene() {
	try {
		obs.send('GetCurrentScene').then((val) => {
			currentSceneRep.value = val.name;
		});
	} catch (error) {
		nodecg.log.error('Could not get the current scene from OBS:', error);
	}
}

nodecg.listenFor('discord-gameplay', (enable: boolean) => {
	obs.enableSource('Discord', enable, 'Game Overlay')
});

nodecg.listenFor('ps5-stream-scale', (enable: boolean) => {
	if (enable) {
		obs.setSceneItemProperties('Game Overlay', 'ASM Station 1', { position: { x: 391, y: 156 }, scale: { x: 1529, y: 860 }, bounds:{}, crop: {} })
	} else {
		obs.setSceneItemProperties('Game Overlay', 'ASM Station 1', { position: { x: 0, y: 0 }, scale: { x: 1920, y: 1080 }, bounds:{}, crop: {} })
	}
});
