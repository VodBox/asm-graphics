import React, { useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';

import { TickerItemHandles } from '../ticker';

import { TickerItem } from './item';
import { TickerTitle } from './title';

const TickerPrizesContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	height: 64px;
	width: 100%;
	display: flex;
	align-items: center;
	transform: translate(0px, -64px);
`;

const PrizesScroller = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	position: absolute;
	top: -32px;
`;

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

export const TickerPrizes = React.forwardRef<TickerItemHandles, Props>((props: Props, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const prizesRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => ({
		animation: (tl) => {
			// Start
			tl.set(prizesRef.current, { right: '' });
			tl.to(containerRef.current, { y: 0, duration: 1 });

			tl.to(prizesRef.current, { right: 0, ease: "slow(0.999, 0.05, false)", duration: 20 }, '+=5');

			// End
			tl.to(containerRef.current, { y: 64, duration: 1 }, '+=5');
			tl.set(containerRef.current, { y: -64, duration: 1 });

			return tl;
		},
	}));

	return (
		<TickerPrizesContainer ref={containerRef} className={props.className} style={props.style}>
			<TickerTitle style={{ display: 'flex', flexDirection: 'column', zIndex: 2 }}>
				<span>Prizes</span>
				<span style={{ fontWeight: 'lighter', fontSize: 16 }}>AUS Only</span>
			</TickerTitle>
			<div style={{width: '100%', position: 'relative'}}>
				<PrizesScroller ref={prizesRef}>
					<TickerItem title="T.A.B.S Game Code" sub="$10 Donation" />
					<TickerItem title="Knightfall Game Code" sub="$10 Donation" />
					<TickerItem title="Clustertruck" sub="$10 Donation" />
				</PrizesScroller>
			</div>
		</TickerPrizesContainer>
	);
});

TickerPrizes.displayName = 'TickerPrizes';
