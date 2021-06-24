import React, { useState } from 'react';
import { render } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import { StaffMessage } from '../types/StaffMessages';

import { darkTheme } from './theme';
import { GreenButton, LightTextfield, RedButton } from './elements/styled-ui';
import { Box, Grid, Snackbar, ThemeProvider } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useReplicant } from 'use-nodecg';
import { Close, Check } from '@material-ui/icons';

const StaffMessagesContainer = styled.div``;

const MessageList = styled.div`
	max-height: 300px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const StaffMessages: React.FC = () => {
	const [author, setAuthor] = useState('');
	const [message, setMessage] = useState('');
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [staffMessagesRep] = useReplicant<StaffMessage[], StaffMessage[]>(
		'staff-messages',
		[],
	);

	const sendMessage = () => {
		const msg: StaffMessage = {
			date: new Date(),
			author: author,
			message: message,
		};

		nodecg.sendMessage('staff-sendMessage', msg);
		setAuthor('');
		setMessage('');
		setSnackbarOpen(true);
	};

	const messageMap = staffMessagesRep
		.map((msg) => {
			const date = new Date(msg.date);
			return (
				<Message
					key={date.getTime()}
					message={msg}
					style={{
						margin: msg.fromHost ? '0 32px 0 0' : '0 0 0 32px',
					}}
				/>
			);
		})
		.reverse();

	return (
		<ThemeProvider theme={darkTheme}>
			<MessageList>{messageMap}</MessageList>
			<StaffMessagesContainer>
				<LightTextfield
					onChange={(e) => setAuthor(e.target.value)}
					value={author}
					label="Author"
					fullWidth
				/>
				<LightTextfield
					onChange={(e) => setMessage(e.target.value)}
					value={message}
					label="Message"
					fullWidth
					multiline
					rows={4}
				/>
				<GreenButton
					variant="contained"
					onClick={sendMessage}
					style={{ marginTop: 8, float: 'right' }}>
					Send
				</GreenButton>
				<Snackbar
					open={snackbarOpen}
					autoHideDuration={5000}
					onClose={() => setSnackbarOpen(false)}>
					<Alert
						elevation={6}
						variant="filled"
						onClose={() => setSnackbarOpen(false)}
						severity="success">
						Message sent!
					</Alert>
				</Snackbar>
			</StaffMessagesContainer>
		</ThemeProvider>
	);
};

/* Single Message */
interface MessageProps {
	message: StaffMessage;
	style?: React.CSSProperties;
}

const NewFlash = keyframes`
	from { background-color: #000000; }
	to { background-color: #c8ff00; }
`;

const MessageContainer = styled(Box)`
	margin: 6px 0;
	display: flex;
	justify-content: space-between;
	font-size: 13px;
	padding: 8px;
	border-radius: 7px;
	animation-name: ${NewFlash};
	animation-duration: 0.5s;
	background-color: #4D5E80;
	position: relative;
`;

const DateText = styled.span`
	margin-right: 6px;
	color: #aaa;
`;

const Author = styled.span`
	font-weight: bold;
`;

const DisabledCover = styled.div`
	position: absolute;
	height: 100%;
	width: 100%;
	background: rgba(0, 0, 0, 0.35);
	top: 0px;
	left: 0px;
	border-radius: 7px;
`;

const Message: React.FC<MessageProps> = (props: MessageProps) => {
	const [read, setRead] = useState(false);
	const date = new Date(props.message.date);

	const toggleRead = () => {
		setRead(!read);
	};

	return (
		<MessageContainer boxShadow={2} style={props.style}>
			<Grid direction="column" container>
				<div>
					<DateText>{date.toLocaleTimeString()}</DateText>
					<Author>{props.message.author}</Author>
				</div>
				<span style={{ whiteSpace: 'pre-wrap' }}>
					{props.message.message}
				</span>
			</Grid>
			{read ? (
				<>
					<DisabledCover />
					<RedButton variant="contained" onClick={toggleRead}>
						<Close />
					</RedButton>
				</>
			) : (
				<GreenButton variant="contained" onClick={toggleRead}>
					<Check />
				</GreenButton>
			)}
		</MessageContainer>
	);
};

render(<StaffMessages />, document.getElementById('staff-messages'));
