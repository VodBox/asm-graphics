import { RunDataActiveRun, RunDataActiveRunSurrounding, RunDataArray } from '@asm-graphics/types/RunData';
import * as nodecgApiContext from './nodecg-api-context';
import obs from './util/obs';
import path from 'path';
import fs from 'fs';

const nodecg = nodecgApiContext.get();
const ncgLog = new nodecg.Logger("OBS-Local");

let previewScene: string;
let programScene: string;

obs.on('CurrentPreviewSceneChanged', ({ sceneName }) => {
	previewScene = sceneName;
});

obs.on('CurrentProgramSceneChanged', ({ sceneName }) => {
	programScene = sceneName;
});

obs.on('Identified', async () => {
	previewScene = (await obs.call('GetCurrentPreviewScene')).currentPreviewSceneName;
	programScene = (await obs.call('GetCurrentProgramScene')).currentProgramSceneName;
});

obs.on('SceneTransitionStarted', async () => {
	// Get the scene we are going from and to
	const fromScene = programScene;
	const toScene = previewScene;

	let logString = `[OBS Local] Program Scene changed from ${fromScene} to ${toScene}`;

	if (toScene.startsWith("GAMEPLAY")) {
		// Only call when going from something else to game, game to game might mean we chose the wrong layouts
		if (!fromScene.startsWith("GAMEPLAY")) {
			nodecg.sendMessage('transition:toGame', { to: toScene, from: fromScene });
			logString += " | Calling transition:toGame message";
		}
	} else if (toScene.startsWith("INTERMISSION")) {
		if (!fromScene.startsWith("INTERMISSION")) {
			nodecg.sendMessage('transition:toIntermission', { to: toScene, from: fromScene });
			logString += " | Calling transition:toIntermission message";
		}
	} else if (toScene.startsWith('IRL')) {
		nodecg.sendMessage('transition:toIRL', { to: toScene, from: fromScene });
		logString += " | Calling transition:toIRL message";
	} else {
		nodecg.sendMessage('transition:UNKNOWN', { to: toScene, from: fromScene });
	}

	ncgLog.info(logString);
	nodecg.sendMessage('runTransitionGraphic');
});

// AUTOMATICALLY ADVANCE RUN WHEN TRANSITIONING FROM GAME TO INTERMISSION
nodecg.listenFor('transition:toIntermission', (data: { to: string; from: string }) => {
	if (!data.from.startsWith("GAMEPLAY")) return;
	
	setTimeout(() => {
		nodecg.sendMessageToBundle('changeToNextRun', 'nodecg-speedcontrol');

		// CUSTOM TRANSITIONS
		// Change the transitions for when we leave a game to be the next entry transition
		if (runDataActiveRunRep.value?.customData.exitTransition)
		{
			setTransitionQueue = runDataActiveRunRep.value.customData.entryTransition;
		}
	}, 1500);

});


const runDataActiveRunRep = nodecg.Replicant<RunDataActiveRun>('runDataActiveRun', 'nodecg-speedcontrol');

nodecg.listenFor('transition:toGame', (data: { to: string; from: string }) => {
	if (!data.to.startsWith("GAMEPLAY")) return;
	
	setTimeout(() => {
		// CUSTOM TRANSITIONS
		// Change the transitions for when we leave a game to be the next enter transition
		if (runDataActiveRunRep.value?.customData.exitTransition)
		{
			setTransitionQueue = runDataActiveRunRep.value.customData.exitTransition;
		}
	}, 1500);
});

let setTransitionQueue: string | null = null;

obs.on('SceneTransitionVideoEnded', (transitionName) => {
	if (setTransitionQueue)
	{
		SetCurrentSceneTransition(setTransitionQueue);
	}
});

async function SetCurrentSceneTransition(transitionName: string)
{
	// Check if it's already that transition
	const currentTransition = (await obs.call('GetCurrentSceneTransition')).transitionName;

	if (currentTransition != transitionName)
	{
		ncgLog.info(`Setting Current Scene Transition to: ${setTransitionQueue}`);
		obs.call('SetCurrentSceneTransition', {
			transitionName: transitionName
		});
		
		setTransitionQueue = null;
	}
}
