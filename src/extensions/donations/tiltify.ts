import * as nodecgApiContext from '../nodecg-api-context';

import { Donation } from '../../types/Donations';

const nodecg = nodecgApiContext.get();
const donationTotalRep = nodecg.Replicant<number>('donationTotal');
const donationsListRep = nodecg.Replicant<Donation[]>('donations');

// nodecg-tiltify replicants
interface TiltifyDonation {
	id: number;
	amount: number;
	name: string;
	comment: string;
	completedAt: number;
};

const tiltifyTotalRep = nodecg.Replicant<number>('total', 'nodecg-tiltify');
const tiltifyDonationsRep = nodecg.Replicant<TiltifyDonation[]>('alldonations', 'nodecg-tiltify');


tiltifyTotalRep.on('change', newVal => {
	donationTotalRep.value = newVal;
});

tiltifyDonationsRep.on('change', newVal => {
	if (!newVal) return;
	const mutableDonations: Donation[] = [];
	newVal.forEach(donation => {
		if (!donationsListRep.value?.find(donate => donate.id === donation.id)) {
			mutableDonations.push({
				amount: donation.amount,
				currencySymbol: '$',
				id: donation.id.toString(),
				name: donation.name,
				time: donation.completedAt,
				read: false,
				desc: donation.comment ?? ''
			});
		}
	});

	donationsListRep.value = mutableDonations.filter((item, pos, self) => {
		return self.findIndex(selfItem => item.id === selfItem.id) == pos;
	})
});
