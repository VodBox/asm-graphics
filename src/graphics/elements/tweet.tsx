import React from 'react';
import styled from 'styled-components';
import _ from 'underscore';
// @ts-ignore
import Twemoji from 'react-twemoji';

import { Tweet as ITweet } from '../../types/Twitter';

const TweetContainer = styled.div`
	position: absolute;
	color: white;
	margin: 15px;
	border-top: 1px solid white;
	border-right: 1px solid white;
	border-left: 1px solid white;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	height: 100%;
	font-family: Noto Sans;
`;

const Text = styled.div`
	padding: 20px;
	padding-bottom: 13px;
	text-align: center;

	& .emoji {
		height: 1em;
		width: 1em;
		margin: 0 0.05em 0 0.1em;
		vertical-align: -0.1em;
	}
`;

const Username = styled.span`
	font-weight: bold;
	font-size: 16px;
	margin: 0 10px;
`;

const BottomBorderCont = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: -9px;
	position: absolute;
	bottom: 0;
	width: 100%;
`;

const BottomBorder = styled.div`
	height: 1px;
	background: white;
	min-width: 15px;
`;

interface Props {
	tweet: ITweet | undefined;
	style?: React.CSSProperties;
	className?: string;
}

export const Tweet: React.FC<Props> = (props: Props) => {

	
	if (typeof props.tweet === 'undefined') {
		return <></>;
	}
	
	const dangerBold = () => {
		if (props.tweet) {
			const tweetText = props.tweet.data.text.replace('#ASM2021', '<b>#ASM2021</b>');
	
			return {__html: _.unescape(tweetText)};
		}

		return {__html: ''};
	};

	return (
		<TweetContainer className={props.className} style={props.style}>
			<Twemoji noWrapper={true}>
				<Text dangerouslySetInnerHTML={dangerBold()}></Text>
			</Twemoji>
			<BottomBorderCont>
				<BottomBorder style={{ flexGrow: 1 }} />
				<Username>@{props.tweet.includes.users[0].username}</Username>
				<BottomBorder />
			</BottomBorderCont>
		</TweetContainer>
	);
};
