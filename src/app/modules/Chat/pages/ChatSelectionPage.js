import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import {
	Row,
	Col,
	Card,
	CardHeader,
	CardTitle,
	Button,
	Alert,
	Input,
	InputGroup,
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';


import config from '../../../config';

import { dateFormat } from '../../../util/date';

import { getChatsRequest, getChats, setChatSelection } from '../ChatActions';
import { getContactsRequest, getContacts } from '../../Contact/ContactActions';
import { getDestinationFiles } from '../../Archive/ArchiveActions';
import { displayErrors } from '../../Error/ErrorActions';

import PageTitle from '../../../components/Content/PageTitle';
import Loader from '../../../components/Loader/Loader';
import ChatItem from '../components/view/ChatItem';
import withRouter from '../../../components/Router/WithRouter';

class ChatSelectionPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			currentPage: 1,
			chats: [],
			search: '',
		};

		this.chatsPerPage = 10;
	}

	componentDidMount() {
		this.initChats();
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevProps.destinationFiles && this.props.destinationFiles) {
			this.initChats();
		}
	}

	getFilteredChats() {
		return [...(this.state.chats || [])]
			.filter(chat => !this.state.search || chat.participants.some(participant => participant?.name?.toLowerCase().includes(this.state.search.toLowerCase())));
	}

	handleSelect = (chat) => {
		this.props.dispatch(setChatSelection(chat));
		this.props.navigate('/login');
	};

	initChats() {
		if (
			this.props.destinationFiles &&
			this.props.destinationFiles.messages &&
			this.props.destinationFiles.contacts
		) {
			this.setState({
				isLoading: true,
			});
			console.log('Destination files', this.props.destinationFiles);
			this.props.dispatch(getChatsRequest(this.props.destinationFiles.messages, this.props.intl.locale)).then(chats => {
					this.props.dispatch(getContactsRequest(this.props.destinationFiles.contacts,this.props.intl.locale)).then(contacts => {
						console.log(chats, contacts);
						this.setState({
							isLoading: false,
							chats: chats.map(chat => ({
								...chat,
								participants: chat.participants.map(number => {
									const contact = (this.props.contacts || []).find(contact => contact.participantNumber === number);
									return {
										number,
										name: contact ? `${contact.first} ${contact.last}` : number
									}
								})
							})),
							contacts
						});
					}).catch(console.err);
				}).catch(console.err);
		} else {
			console.error(new Error('ChatDestinationFilesNotSet'));
		}
	}

	render() {
		const chats = this.getFilteredChats();
		return (
			<div>
				{this.state.isLoading ? (
					<Loader />
				) : (
					<Fragment>
						<PageTitle>
							<Button
								color="link"
								size="sm"
								tag={Link}
								to="/"
								className="float-left pl-3"
							>
								<FontAwesome name="chevron-left" size="lg" />
							</Button>
							<FontAwesome name="comments" />{' '}
							<FormattedMessage
								id="chatSelectionTitle"
								defaultMessage="Select a chat"
							/>
						</PageTitle>
						<Row>
							<Col
								xs="12"
								md={{ size: 8, offset: 2 }}
								lg={{ size: 6, offset: 3 }}
							>
								{
									this.state.chats.length > 0
									? (
										<Fragment>
											<InputGroup>
												<Input size="lg" name="s" value={this.state.search} placeholder={this.props.intl.formatMessage({ id: 'chatSearchInputPlaceholder', defaultMessage: 'Search for a contact' })} onChange={event => this.setState({search: event.target.value })} />
												{this.state.search && <Button onClick={() => this.setState({ search: '' })}><FontAwesome name="close" /></Button>}
											</InputGroup>
											<div style={{ maxHeight: `${chats.length * 100}px`, minHeight: '200px', overflow: 'auto' }}>
												{chats.slice(0, this.chatsPerPage * this.state.currentPage).map((chat, index) => (
													<ChatItem
														key={index}
														chat={chat}
														contacts={this.props.contacts}
														onSelect={this.handleSelect}
													/>
												))}
											</div>
										</Fragment>
									) : (
										<Alert color="warning" className="text-center">
											<FontAwesome name="frown" />{' '}
											<FormattedMessage
												id="chatMissingError"
												defaultMessage="You have no conversation in your archive..."
											/>
											<br />
											<Button
												color="warning"
												outline
												tag={Link}
												to="/"
											>
												<FontAwesome name="chevron-left" />{' '}
												<FormattedMessage
													id="back"
													defaultMessage="Back"
												/>
											</Button>
										</Alert>
									)
								}

								{chats.length > this.chatsPerPage * this.state.currentPage && (
									<Button
										color="primary"
										block
										size="sm"
										onClick={() =>
											this.setState({
												currentPage:
													this.state.currentPage + 1,
											})
										}
									>
										<FontAwesome name="plus" />{' '}
										<FormattedMessage
											id="chatViewMoreButton"
											defaultMessage="View more chats..."
										/>
									</Button>
								)}
							</Col>
						</Row>
					</Fragment>
				)}
			</div>
		);
	}
}

function mapStateToProps(store, props) {
	return {
		destinationFiles: getDestinationFiles(store),
		chats: getChats(store),
		contacts: getContacts(store),
	};
}

ChatSelectionPage.propTypes = {
	dispatch: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	intl: PropTypes.object.isRequired,
	destinationFiles: PropTypes.object,
	chats: PropTypes.arrayOf(PropTypes.object),
	contacts: PropTypes.arrayOf(PropTypes.object),
};

export default connect(mapStateToProps)(
	withRouter(injectIntl(ChatSelectionPage)),
);
