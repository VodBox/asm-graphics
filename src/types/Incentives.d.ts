interface BaseIncentive {
	game: string;
	incentive: string;
	notes: string;
	active: boolean;
	index: number;
}

export interface Goal extends BaseIncentive {
	goal: number;
	total: number;
	type: "Goal";
}

export interface War extends BaseIncentive {
	options: {
		name: string;
		total: number;
	}[];
	type: "War";
}
