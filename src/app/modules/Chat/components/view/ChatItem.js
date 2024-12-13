import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Row, Col, Card, CardHeader, CardTitle, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

class ChatItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isHover: false,
        };
    }

    handleSelect = () => {
        if(this.props.chat && this.props.onSelect) {
            this.props.onSelect(this.props.chat);
        }
    }

    render() {
        const { chat } = this.props;
        return (
            <Card className="mb-1 p-2 text-center" style={{position: 'relative'}} onClick={() => console.log(chat)} onMouseOver={() => this.setState({isHover: true})} onMouseLeave={() => this.setState({isHover: false})}>
                <CardTitle className="mb-3">
                    <h3>
                        {chat.participants
                            // .filter(participantNumber => participantNumber !== PHONE_OWNER_ID)
                            .slice(0, 3)
                            // .map(participant => (this.props.contacts || []).find(contact => contact.participantNumber === participant.number) || {first: participant.number})
                            .map((participant, index) =>
                                <small key={index}>{index !== 0 && ' & '}{participant.name}</small>
                            )
                        }
                    </h3>
                </CardTitle>
                <small><em><FormattedMessage id="chatParticipants" defaultMessage="{count} participant(s)" values={{ count: chat.participants.length + 1 }} /></em></small>

                <strong className="mt-4 text-primary"><FormattedMessage id="chatMessagesCount" defaultMessage="{count} message(s)" values={{count: chat.messages.length}} /></strong>

                {this.props.onSelect && this.state.isHover && <Button color="primary" style={{position: 'absolute', top: 'calc(50% - 30px)', right: '5px'}} onClick={this.handleSelect}><FontAwesome name="chevron-right" className="py-3" /></Button>}
            </Card>
        )
    }
}

ChatItem.propTypes = {
    chat: PropTypes.object.isRequired,
    contacts: PropTypes.arrayOf(PropTypes.object),
    onSelect: PropTypes.func,
}

export default ChatItem;
