import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';

import type { RunDataActiveRun } from '@asm-graphics/types/RunData';
import type { User } from '@asm-graphics/types/AusSpeedrunsWebsite';
import type { CouchPerson } from '@asm-graphics/types/OverlayProps';
import { Headset, HEADSETS } from './headsets';

const RTNamesContainer = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	align-items: center;
	padding-bottom: 48px;
`;

const RunInfo = styled.div`
	/* margin-bottom: 2rem; */
`;

const TechWarning = styled.h3`
	background: red;
	color: white;
	padding: 1rem;
	border-radius: 16px;
	text-align: center;
`;

const Data = styled.div`
	display: grid;
	grid-template-columns: min-content auto;
	gap: 0.5rem 1rem;
	align-items: center;
	justify-content: center;

	span {
		white-space: nowrap;
		font-size: 1rem;
	}

	span:nth-child(even) {
		font-weight: bold;
	}
`;

const NameInputs = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	padding-bottom: 75px;
`;

const NameRow = styled.div`
	display: flex;
	margin: 1rem 0;
	font-size: 2rem;
`;

const HeadsetName = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 1rem;
	border-radius: 20px;
	margin-right: 1rem;
	width: 4rem;
	text-align: center;
`;

const Save = styled.button`
	margin-left: 1rem;
	font-size: 2rem;
	font-weight: bold;
	border: 0;
	border-radius: 10px;

	/* background-size: 200% 100%; */
	background: linear-gradient(
			rgba(255, 0, 0, 1) 0%,
			rgba(255, 154, 0, 1) 10%,
			rgba(208, 222, 33, 1) 20%,
			rgba(79, 220, 74, 1) 30%,
			rgba(63, 218, 216, 1) 40%,
			rgba(47, 201, 226, 1) 50%,
			rgba(28, 127, 238, 1) 60%,
			rgba(95, 21, 242, 1) 70%,
			rgba(186, 12, 248, 1) 80%,
			rgba(251, 7, 217, 1) 90%,
			rgba(255, 0, 0, 1) 100%
		)
		0 0/100% 200%;
	animation: a 5s linear infinite;
	@keyframes a {
		to {
			background-position: 0% -200%;
		}
	}
`;

function generateRunnerLabels(noOfRunners: number, noOfNames = 4) {
	return [...Array(noOfNames)].map((_, i) => {
		if (i < noOfRunners) {
			return `Runner ${i + 1}`;
		} else {
			return `Com ${i - noOfRunners + 1}`;
		}
	});
}

const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'They/He', 'They/She', 'Any/All'];

interface Runner {
	id: string;
	name: string;
	pronouns?: string;
	twitch?: string;
	saved: boolean;
	teamId?: string;
}

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

type HeadsetRunner = Headset & {
	runner: Runner;
};

const baseRunner: Runner = { id: '', name: '', saved: true };

const NEW_HEADSETS: HeadsetRunner[] = [
	{ ...HEADSETS[0], runner: { ...baseRunner, id: 'R1' } },
	{ ...HEADSETS[1], runner: { ...baseRunner, id: 'C1' } },
	{ ...HEADSETS[2], runner: { ...baseRunner, id: 'C2' } },
	{ ...HEADSETS[3], runner: { ...baseRunner, id: 'C3' } },
];

export const RTNames: React.FC<Props> = (props: Props) => {
	const [runDataActiveRep] = useReplicant<RunDataActiveRun | undefined>('runDataActiveRun', undefined, {
		namespace: 'nodecg-speedcontrol',
	});
	const [allUsersRep] = useReplicant<User[]>('all-usernames', []);
	const [couchNamesRep] = useReplicant<CouchPerson[]>('couch-names', []);
	const allUsernames = useMemo(() => allUsersRep.map((user) => user.username), [allUsersRep]);
	const numberOfRunners = useMemo(
		() => runDataActiveRep?.teams.reduce((total, team) => total + team.players.length, 0) ?? 0,
		[runDataActiveRep],
	);

	const [headsets, setHeadsets] = useState(NEW_HEADSETS);

	const runnerLabels = generateRunnerLabels(numberOfRunners, headsets.length);

	// Fill runner names when run changes
	useEffect(() => {
		if (runDataActiveRep) {
			const newHeadsets = [...NEW_HEADSETS];

			let headsetIndex = 0;
			runDataActiveRep.teams.forEach((team) => {
				team.players.forEach((player) => {
					if (headsetIndex < newHeadsets.length) {
						newHeadsets[headsetIndex].runner = {
							...baseRunner,
							id: player.id,
							name: player.name,
							pronouns: player.pronouns,
							twitch: player.social.twitch,
							teamId: team.id,
						};
					} else {
						console.log('Not enough headsets. No headset for:', player);
					}

					headsetIndex++;
				});
			});

			couchNamesRep.forEach((person) => {
				if (person.host) return;

				const foundHeadset = newHeadsets.findIndex((headset) => headset.name === person.microphone);
				if (foundHeadset !== -1) {
					newHeadsets[foundHeadset].runner = {
						...baseRunner,
						id: newHeadsets[headsetIndex].name,
						name: person.name,
						pronouns: person.pronouns,
					};
				} else if (headsetIndex < newHeadsets.length) {
					// Else pop them in the next spot
					newHeadsets[headsetIndex].runner = {
						...baseRunner,
						id: newHeadsets[headsetIndex].name,
						name: person.name,
						pronouns: person.pronouns,
					};
				}

				headsetIndex++;
			});

			setHeadsets(newHeadsets);
		}
	}, [runDataActiveRep, couchNamesRep]);

	// Autofill pronouns when user found when typing
	function handleNameSelected(name: string | null, headsetName: string) {
		if (name === null) return;

		// Find the name that was selected
		const foundUser = allUsersRep.find((user) => user.username === name);

		// Set the pronouns as that name
		if (foundUser) {
			setHeadsets(
				headsets.map((headset) => {
					if (headset.name === headsetName) {
						return {
							...headset,
							runner: {
								...headset.runner,
								name: foundUser.username,
								pronouns: foundUser.pronouns,
								twitch: foundUser.twitch,
								saved: false,
							},
						};
					} else {
						return headset;
					}
				}),
			);
		}
	}

	function setRunnerProperty(property: string, newValue: any, headsetName: string) {
		setHeadsets(
			headsets.map((headset) => {
				if (headset.name === headsetName) {
					return {
						...headset,
						runner: {
							...headset.runner,
							saved: false,
							[property]: newValue,
						},
					};
				} else {
					return headset;
				}
			}),
		);
	}

	function saveRunner(headset: HeadsetRunner, index: number) {
		console.log(runDataActiveRep, index, numberOfRunners)
		if (!runDataActiveRep) return;

		// Set save to false
		setRunnerProperty('saved', false, headset.name);

		// Determine if runners or couch needs updating
		if (index < numberOfRunners) {
			// Runner
			// Find team index
			const teamIndex = runDataActiveRep.teams.findIndex((team) => team.id === headset.runner.teamId);
			// Find player index
			const playerIndex = runDataActiveRep.teams[teamIndex].players.findIndex(
				(player) => player.id === headset.runner.id,
			);
			// Update run data
			console.log(playerIndex, headset)
			if (playerIndex >= 0) {
				let newRunData = { ...runDataActiveRep };
				newRunData.teams[teamIndex].players[playerIndex].name = headset.runner.name;
				newRunData.teams[teamIndex].players[playerIndex].pronouns = headset.runner.pronouns;
				newRunData.teams[teamIndex].players[playerIndex].social.twitch = headset.runner.twitch;
				newRunData.teams[teamIndex].players[playerIndex].customData = {
					...newRunData.teams[teamIndex].players[playerIndex].customData,
					microphone: headset.name,
				};

				if (!headset.runner.twitch) {
					delete newRunData.teams[teamIndex].players[playerIndex].social.twitch;
				}

				// Send to update data
				nodecg.sendMessageToBundle('modifyRun', 'nodecg-speedcontrol', { runData: newRunData });

				console.log(newRunData)
			}
		} else {
			// Couch
			nodecg.sendMessage('rename-couch', {
				id: headset.name,
				name: headset.runner.name,
				pronouns: headset.runner.pronouns,
				microphone: headset.name,
			} as CouchPerson);
		}
	}

	return (
		<RTNamesContainer className={props.className} style={props.style}>
			<RunInfo>
				<TechWarning>If any data is wrong please let Tech know</TechWarning>
				<Data>
					<span>Game</span>
					<span>{runDataActiveRep?.game?.replaceAll("\\n", " ") ?? 'UNKNOWN, PLEASE LET TECH KNOW'}</span>
					<span>Category</span>
					<span>{runDataActiveRep?.category?.replaceAll("\\n", " ") ?? 'UNKNOWN, PLEASE LET TECH KNOW'}</span>
					<span>Estimate</span>
					<span>{runDataActiveRep?.estimate ?? 'UNKNOWN, PLEASE LET TECH KNOW'}</span>
					<span>Console</span>
					<span>{runDataActiveRep?.system ?? 'UNKNOWN, PLEASE LET TECH KNOW'}</span>
					<span>Release Year</span>
					<span>{runDataActiveRep?.release ?? 'UNKNOWN, PLEASE LET TECH KNOW'}</span>
				</Data>
			</RunInfo>
			<NameInputs>
				{headsets
					.filter((headset) => headset.name !== 'Host')
					.map((headset, index) => {
						const isRunner = runnerLabels[index].startsWith('R');
						return (
							<NameRow key={headset.name}>
								<HeadsetName
									style={{
										background: headset.colour,
										color: headset.textColour,
									}}>
									{headset.name}
								</HeadsetName>
								<Autocomplete
									style={{
										minWidth: isRunner ? '30vw' : '51vw',
										marginRight: isRunner ? '1vw' : '5vw',
										fontSize: '2rem !important',
									}}
									freeSolo
									options={allUsernames}
									onChange={(_, newVal) => {
										handleNameSelected(newVal, headset.name);
									}}
									inputValue={headset.runner.name}
									onInputChange={(_, newVal) => setRunnerProperty('name', newVal, headset.name)}
									renderInput={(params) => (
										<TextField
											{...params}
											label={`${runnerLabels[index]} Name`}
											InputProps={{ ...params.InputProps, style: { fontSize: '2rem' } }}
										/>
									)}
								/>
								{isRunner && (
									<TextField
										style={{ width: '20vw', marginRight: '5vw', fontSize: '2rem !important' }}
										value={headset.runner.twitch ?? ''}
										onChange={(e) => {
											setRunnerProperty('twitch', e.target.value, headset.name);
										}}
										label={`${runnerLabels[index]} Twitch`}
										InputProps={{ style: { fontSize: '2rem' } }}
									/>
								)}
								<Autocomplete
									style={{ minWidth: '20vw', fontSize: '2rem' }}
									freeSolo
									options={PRONOUN_OPTIONS}
									inputValue={headset.runner.pronouns ?? ''}
									onInputChange={(_, newVal) => setRunnerProperty('pronouns', newVal, headset.name)}
									renderInput={(params) => (
										<TextField
											{...params}
											label={`${runnerLabels[index]} Pronouns`}
											InputProps={{ ...params.InputProps, style: { fontSize: '2rem' } }}
										/>
									)}
								/>
								{!headset.runner.saved && (
									<Save
										onClick={() => {
											saveRunner(headset, index);
										}}>
										Save
									</Save>
								)}
							</NameRow>
						);
					})}
			</NameInputs>
		</RTNamesContainer>
	);
};
