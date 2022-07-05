import React from 'react';
import { createRoot } from 'react-dom/client';
import { useReplicant } from 'use-nodecg';

import { RunDataArray, RunDataActiveRun } from '../types/RunData';

import { Goal, War } from '../types/Incentives';
import { Ticker } from './elements/ticker';

export const TickerOverlay: React.FC = () => {
	const [runDataArrayRep] = useReplicant<RunDataArray, []>('runDataArray', [], { namespace: 'nodecg-speedcontrol' });
	const [runDataActiveRep] = useReplicant<RunDataActiveRun, undefined>('runDataActiveRun', undefined, {
		namespace: 'nodecg-speedcontrol',
	});
	const [incentivesRep] = useReplicant<(Goal | War)[], (Goal | War)[]>('incentives', []);
	const [donationRep] = useReplicant<number, number>('donationTotal', 0);

	return (
		<Ticker
			donationAmount={donationRep}
			runDataActive={runDataActiveRep}
			runDataArray={runDataArrayRep}
			incentives={incentivesRep}
			tickerOrder={[]}
		/>
	);
};

createRoot(document.getElementById('root')!).render(<TickerOverlay />);
