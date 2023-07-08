import React from 'react';
import { createRoot } from 'react-dom/client';
import { useReplicant } from 'use-nodecg';

import { RunDataArray, RunDataActiveRun } from '@asm-graphics/types/RunData';

import { Goal, War } from '@asm-graphics/types/Incentives';
import { Ticker } from './elements/ticker';

export const TickerOverlay: React.FC = () => {
	const [runDataArrayRep] = useReplicant<RunDataArray>('runDataArray', [], { namespace: 'nodecg-speedcontrol' });
	const [runDataActiveRep] = useReplicant<RunDataActiveRun | undefined>('runDataActiveRun', undefined, {
		namespace: 'nodecg-speedcontrol',
	});
	const [incentivesRep] = useReplicant<(Goal | War)[]>('incentives', []);
	const [donationRep] = useReplicant<number>('donationTotal', 0);
	const [manualDonationRep] = useReplicant<number>('manual-donation-total', 0);
	const [asmmRep] = useReplicant<number>('asmm:totalKM', 0);

	return (
		<Ticker
			donationAmount={donationRep + manualDonationRep}
			runDataActive={runDataActiveRep}
			runDataArray={runDataArrayRep}
			incentives={incentivesRep}
			asmm={asmmRep}
			tickerOrder={[
				{ type: 'cta' },
				{ type: 'nextruns' },
				{ type: 'goals' },
				{ type: 'wars' },
				{ type: 'asmm' },
				{ type: 'prizes' },
				{ type: 'milestone' },
			]}
		/>
	);
};

createRoot(document.getElementById('root')!).render(<TickerOverlay />);
