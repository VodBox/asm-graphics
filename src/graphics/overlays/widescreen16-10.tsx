import React from 'react';
import styled from 'styled-components';

import { OverlayProps } from '../../types/OverlayProps';

import { IWideStyling, WideInfo } from '../elements/info-box/wide';
import { SponsorsBox } from '../elements/sponsors';
import { Facecam } from '../elements/facecam';
import { OrangeStripe } from '../elements/orange-stripe';
import { Couch } from '../elements/couch';

const WidescreenContainer = styled.div`
	height: 1016px;
	width: 1920px;
`;

const Sidebar = styled.div`
	position: absolute;
	top: 143px;
	height: 873px;
	width: 523px;
	border-right: 1px solid var(--asm-orange);

	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	overflow: hidden;
`;

const SponsorsBoxS = styled(SponsorsBox)`
	width: 100%;
	background: var(--main-col);
	flex-grow: 1;
`;

const SidebarBG = styled.div`
	background: var(--main-col);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 458px;
	padding-top: 14px;
`;

const SponsorsStyled = {
	height: 250,
	width: 400,
};

const TwitterSize = {
	height: 248,
	width: 438,
	marginTop: -36,
};

const customWideStyling: IWideStyling = {
	mainStyle: {
		height: 142,
	},
};

export const Widescreen1610: React.FC<OverlayProps> = (props) => {
	return (
		<WidescreenContainer>
			<WideInfo timer={props.timer} runData={props.runData} style={customWideStyling} />

			<Sidebar>
				<Facecam
					height={401}
					teams={props.runData?.teams}
					noCam={props.preview ? props.noCam.preview : props.noCam.current}
				/>
				<SidebarBG>
					<Couch couch={props.preview ? props.couchInformation.preview : props.couchInformation.current} />
					<SponsorsBoxS sponsorStyle={SponsorsStyled} tweetStyle={TwitterSize} />

					<OrangeStripe side="bottom" style={{ width: '100%' }} />
				</SidebarBG>
			</Sidebar>
		</WidescreenContainer>
	);
};
