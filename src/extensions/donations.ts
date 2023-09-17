import * as nodecgApiContext from "./nodecg-api-context";
import _ from "underscore";

import { donationsRep, manualDonationsRep, manualDonationTotalRep } from "./replicants";

const nodecg = nodecgApiContext.get();

nodecg.listenFor("donations:toggleRead", (id) => {
	const donationIndex = donationsRep.value.findIndex((donation) => donation.id === id);

	const newObj = _.clone(donationsRep.value[donationIndex]);
	newObj.read = !newObj.read;

	donationsRep.value[donationIndex] = newObj;
});

nodecg.listenFor("manual-donations:toggleRead", (id) => {
	const donationIndex = manualDonationsRep.value.findIndex((donation) => donation.id === id);

	const newObj = _.clone(manualDonationsRep.value[donationIndex]);
	newObj.read = !newObj.read;

	manualDonationsRep.value[donationIndex] = newObj;
});

nodecg.listenFor("manual-donations:new", (dono) => {
	const newObj = _.clone(manualDonationsRep.value);
	newObj.push(dono);

	manualDonationsRep.value = newObj;
	manualDonationTotalRep.value! += dono.amount;
});

nodecg.listenFor("manual-donations:remove", (id) => {
	const donationIndex = manualDonationsRep.value.findIndex((donation) => donation.id === id);

	manualDonationTotalRep.value! -= manualDonationsRep.value[donationIndex].amount;

	const newObj = _.clone(manualDonationsRep.value);
	newObj.splice(donationIndex, 1);

	manualDonationsRep.value = newObj;
});
