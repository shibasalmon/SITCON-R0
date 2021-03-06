import React, { Component } from 'react'

export class TG_BOT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            items: [],
            latestUpdateId: null,
            token: process.env.TG_BOT_TOKEN ? process.env.TG_BOT_TOKEN : null,
            inputToken: ""
        };

        this.tokenInputOnChange = this.tokenInputOnChange.bind(this);
        this.saveToken = this.saveToken.bind(this);
        this.clearSavedMsg = this.clearSavedMsg.bind(this);
        this.saveMessage = this.saveMessage.bind(this);
    }

    componentDidMount() {
        this.setState({
            items: localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages')) : this.state.items,
            token: sessionStorage.getItem('bot_token')
        });

        this.retriveMessage();
        setInterval(() => {
            this.retriveMessage();
        }, 5000);
    }

    retriveMessage() {
        if (this.state.token === null) return;
        fetch('https://api.telegram.org/bot' + this.state.token + '/getUpdates?offset=' + (this.state.latestUpdateId + 1))
            .then(res => res.json())
            .then((result) => {
                if (result.ok && result.result) {
                    console.log(result);

                    let storaged = localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages')) : [];
                    let newItems = [...storaged, ...result.result];

                    this.setState({
                        latestUpdateId: result.result.length > 0 ? [...result.result].pop().update_id : null,
                        error: null
                    });

                    this.saveMessage(newItems);
                } else {
                    this.setState({
                        error: { message: result.error_code + ': ' + result.description }
                    });
                }
            },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    msgTable() {
        const { items } = this.state;
        return (
            <table style={{ margin: "0 auto" }}>
                <thead>
                    <tr>
                        <td><h5>Message Id</h5></td>
                        <td style={{ padding: "0 20px" }}><h5>Message</h5></td>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, key) => (
                        <tr key={key}>
                            <td>
                                {item.message.message_id}
                            </td>
                            <td style={{ padding: "0 20px" }}>
                                {item.message.text ? item.message.text : (item.message.sticker ? item.message.sticker.emoji : <strong>Non Text or sticker</strong>)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );

    }

    tokenInputOnChange(e) {
        this.setState({
            inputToken: e.target.value
        });
    }

    saveToken() {
        sessionStorage.setItem('bot_token', this.state.inputToken);
        console.log('new token saved');
        this.setState({
            token: this.state.inputToken
        });
    }

    saveMessage(msgArray) {
        localStorage.setItem('messages', JSON.stringify(msgArray));
        this.setState({
            items: msgArray
        });
    }

    clearSavedMsg() {
        this.saveMessage([]);
    }

    render() {
        return (
            <div>
                Token: <input onChange={this.tokenInputOnChange} value={this.state.inputToken} />
                <button onClick={this.saveToken} style={{ marginLeft: "10px" }}>Save Token</button>
                <button onClick={this.clearSavedMsg} style={{ marginLeft: "10px" }}>Clear Message</button>

                {this.state.error ? <div style={{ marginBottom: "10px" }}>Error: {this.state.error.message}</div> : null}
                {this.msgTable()}
            </div>
        );
    }
}

export default TG_BOT
