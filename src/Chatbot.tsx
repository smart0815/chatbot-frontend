import React from "react";
import { Launcher } from 'react-chat-window'
import io, { Socket } from 'socket.io-client';

var connectionOptions = {
	"force new connection": true,
	"transports": ["websocket"]
};

interface Props {
}

interface State {
	messageList?: string[];
	socket?: Socket;
	room?: string;
}

interface Message {
	author: string;
	type: string;
	data: { text: string }
}

class ChatBot extends React.Component<Props, State> {
	constructor(props: Props | Readonly<Props>) {
		super(props);

		this.state = {
			messageList: [],
			socket: io("http://localhost:3000", connectionOptions),
			room: "user",
		}
	}

	componentWillMount() {
		this._sendMessage("Hi there, I am Aida, an AI bot created by Artflow");
	}

	componentDidMount() {
		this.state.socket?.connect();
		this.state.socket?.emit('join', this.state.room);
		this.state.socket?.on("send-msg-response", async (msg: string) => {
			//@ts-ignore
			this.state.messageList.pop();
			await this.setState({
				messageList: [...this.state.messageList ?? []]
			})

			this._sendMessage(msg);
		})

		this.state.socket?.on("img", async (msg: string) => {
			await this.setState({
				messageList: [...this.state.messageList ?? []]
			})
			const blob = new Blob([msg])

			this._sendMessage(<img src={window.URL.createObjectURL(blob)} alt="Boy in a jacket" width="100" height="100" />);
		})

		this.state.socket?.on("loading", async (msg: string) => {
			await this.setState({
				//@ts-ignore
				messageList: [...this.state.messageList]
			})
			const blob = new Blob([msg])

			this._sendMessage(<img src={window.URL.createObjectURL(blob)} alt="Boy in a jacket" width="30" height="30" />);
		})
	}

	async _onMessageWasSent(message: Message) {
		await this.setState({
			//@ts-ignore
			messageList: [...this.state.messageList, message]
		})
		
		this._sendMessage("••••");
		await this.state.socket?.emit('new-msg', { msg: message.data.text, room: this.state.room })
	}

	_sendMessage(text: any) {
		if (text) {
			this.setState({
				//@ts-ignore
				messageList: [...this.state.messageList, {
					author: 'them',
					type: 'text',
					data: { text }
				},]
			})
		}
	}

	render() {

		return (
			<div id="chatbox" className="chatbox">
				<Launcher
					agentProfile={{
						teamName: 'Chatbot',
						imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png'
					}}
					onMessageWasSent={this._onMessageWasSent.bind(this)}
					messageList={this.state.messageList}
					showEmoji
				/>
			</div>
		);
	}
}

export default ChatBot;