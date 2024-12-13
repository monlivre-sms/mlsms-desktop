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
	FormGroup,
	Label,
	Input,
	Button,
	Alert,
	Progress,
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import Zip from 'node-zip';

import config from '../../../config';

import { dateFormat } from '../../../util/date';
import { openExternalLink } from '../../../util/link';

import {
	editConversationRequest,
	uploadConversationMessagesFilesRequest,
	uploadConversationImagesFilesRequest,
	MESSAGES_BLOCK_COUNT,
} from '../../Conversation/ConversationActions';
import { getSelectedArchive } from '../../Archive/ArchiveActions';
import {
	getSelectedChat /* getArchiveUploadUrlRequest, uploadArchiveRequest */,
} from '../ChatActions';
import {
	transformMessagesToCsv,
	getAttachments,
	getArchiveFilePath,
} from '../ChatHelper';
import { getContacts } from '../../Contact/ContactActions';
import { getUser, getToken } from '../../User/UserActions';
import { displayErrors } from '../../Error/ErrorActions';

import PageTitle from '../../../components/Content/PageTitle';
import Loader from '../../../components/Loader/Loader';
import ChatItem from '../components/view/ChatItem';
import withRouter from '../../../components/Router/WithRouter';

class ChatResumePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			isCgvChecked: false,
			progress: 0,
		};

		this.handleProgress = this.handleProgress.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleError = this.handleError.bind(this);
	}

	handleProgress(percentile, progressSlicePercent = 100) {
		const newPercentile = (percentile * progressSlicePercent) / 100;
		const newProgress = (this.state.progress || 0) + newPercentile;
		this.setState({
			progress: newProgress,
		});
	}

	handleSubmit() {
		this.setState({
			isLoading: true,
		});
		const { chat, user, contacts } = this.props;
		const profileName = `${user.firstName || ''} ${user.lastName || ''}`; // participantsContacts[0].name;
		const participantsContacts = [{ name: decodeURIComponent(encodeURIComponent(profileName)), displayName: profileName }].concat(
			chat.participants.map((participant) => {
				const contact = contacts.find(contact => contact.participantNumber === participant?.number || participant);
				return {
					...contact,
					participantNumber: contact ? contact.participantNumber : participant,
					name: decodeURIComponent(encodeURIComponent(`${contact.first || ''} ${contact.last || ''}`)),
					displayName: `${contact.first || ''} ${contact.last || ''}`,
				};
			}),
		);
		const messages = (chat.messages || []).sort(
			(messageA, messageB) => messageA.date - messageB.date,
		);

		const progressStep = 25;

		console.log(user, chat, messages, profileName, participantsContacts);
		this.handleProgress(1);

		const includeImages = true; // For dev purpose
		// 1. Retrieve images files
		(includeImages
			? getAttachments(
					messages,
					(this.props.archive || '').path,
					(percentile) =>
						this.handleProgress(percentile, progressStep),
				)
			: Promise.resolve([])
		).then((messagesWithAttachmentFile) => {
			const imagesEntries = messagesWithAttachmentFile.map(message => message.file);

			const validMessages = (messages || []).filter(
				(message) =>
					!message.attachment ||
					messagesWithAttachmentFile.find(
						(messageWithAttachment) =>
							messageWithAttachment.attachment ===
							message.attachment,
					),
			);

			console.log(
				`${validMessages.length} valid messages to include in conversation (${messages.length - validMessages.length} message(s) not valid)`,
			);

			// 2. Split messages in blocks
			const messagesBlocks = [];
			const iteration = Math.floor(
				validMessages.length / MESSAGES_BLOCK_COUNT,
			);
			const percentile = 100 / (iteration + 1);

			for (let i = 0; i <= iteration; i++) {
				console.log(
					`Messages block process: ${i + 1}/${iteration + 1}`,
				);
				const messagesBlock = validMessages.splice(
					0,
					MESSAGES_BLOCK_COUNT,
				);

				this.handleProgress(percentile, progressStep);

				if (messagesBlock[0]) {
					messagesBlocks.push({
						sort: i,
						filename: `messages_${i + 1}.csv`,
						content: transformMessagesToCsv(
							messagesBlock,
							profileName,
							participantsContacts,
						),
						messages: messagesBlock,
						start: new Date(messagesBlock[0].date),
						end: new Date(
							(
								messagesBlock[messagesBlock.length - 1] ||
								messagesBlock[0]
							).date,
						),
					});
				}
			}

			// 3. Save conversation with API
			const conversationData = {
				user: user._id,
				language: this.props.intl.locale,
				participants: participantsContacts.map((participant, index) => {
					return {
						name: participant.name,
						displayName: participant.name,
						position:
							participant.name === profileName || index % 2 === 0
								? 'right'
								: 'left',
						sort: participant.name === profileName ? 0 : index + 1,
					};
				}),
				messagesBlocks: messagesBlocks.map((messageBlock) => {
					return {
						filename: messageBlock.filename,
						start: messageBlock.start,
						end: messageBlock.end,
						count: messageBlock.messages.length,
					};
				}),
				imagesCount: imagesEntries.length,
				options: {
					withImages: !!imagesEntries,
					types: ['ios'],
				},
			};
			console.log(conversationData);

			this.props
				.dispatch(editConversationRequest(conversationData))
				.then((conversation) => {
					// 3. Upload messages files to S3
					uploadConversationMessagesFilesRequest(
						conversation,
						messagesBlocks,
						(percentile) =>
							this.handleProgress(percentile, progressStep),
					)
						.then((results) => {
							console.log(
								'uploadConversationMessagesFilesRequest results',
								results,
							);

							// 4. Upload images files to S3
							uploadConversationImagesFilesRequest(
								conversation,
								imagesEntries,
								(percentile) =>
									this.handleProgress(
										percentile,
										progressStep,
									),
							)
								.then((results) => {
									console.log(
										'uploadConversationImagesFilesRequest results',
										results,
									);
									this.props.navigate('/success');

									// 5. Redirect to web app
									conversation._id &&
										this.props.token &&
										openExternalLink(
											`${config.url}/conversation/${conversation._id}/start?language=${this.props.intl.locale}&access_token=${this.props.token}`,
										);
								})
								.catch(this.handleError);
						})
						.catch(this.handleError);
				});
		});
	}

	handleError(err) {
		this.setState({
			isLoading: false,
		});
		console.error(err);
		displayErrors(
			'error',
			this.props.intl.formatMessage({
				id: 'conversationArchiveError',
				defaultMessage:
					'We can not read your archive file! Please contact us to solve the problem...',
			}),
		);
	}

	render() {
		const { chat, contacts } = this.props;
		if (chat) {
			return (
				<div>
					<PageTitle>
						<Button
							color="link"
							size="sm"
							tag={Link}
							to="/chats"
							className="float-left pl-3"
						>
							<FontAwesome name="chevron-left" size="lg" />
						</Button>
						<FontAwesome name="check" />{' '}
						<FormattedMessage
							id="chatResumeTitle"
							defaultMessage="Resume"
						/>
					</PageTitle>
					<Row style={{ maxHeight: '480px', overflow: 'auto' }}>
						<Col
							xs="12"
							md={{ size: 8, offset: 2 }}
							lg={{ size: 6, offset: 3 }}
						>
							<ChatItem chat={chat} contacts={contacts} />
							<hr />
							{this.state.isLoading ? (
								<Progress value={this.state.progress}>
									{Math.round(this.state.progress * 10) / 10}%
								</Progress>
							) : (
								<>
									<FormGroup check>
										<Label check>
											<Input
												type="checkbox"
												checked={
													this.state.isCgvChecked
												}
												onChange={(event) =>
													this.setState({
														isCgvChecked:
															event.target
																.checked,
													})
												}
											/>{' '}
											<FormattedMessage
												id="cgvConfirmLabel"
												defaultMessage="I read and accept sales conditions"
											/>
										</Label>{' '}
										-
										<Button
											color="link"
											size="sm"
											onClick={() =>
												openExternalLink(
													'https://shop.monlivresms.com/fr/content/3-conditions-generales-de-ventes',
												)
											}
										>
											<FormattedMessage
												id="cgvLink"
												defaultMessage="Read the sales conditions"
											/>
										</Button>
									</FormGroup>

									<Button
										color="primary"
										size="lg"
										block
										disabled={!this.state.isCgvChecked}
										onClick={this.handleSubmit}
										className="mt-3"
									>
										<FontAwesome name="check" />{' '}
										<FormattedMessage
											id="valid"
											defaultMessage="Valid"
										/>
									</Button>
								</>
							)}
						</Col>
					</Row>
				</div>
			);
		}
		return null;
	}
}

function mapStateToProps(store, props) {
	return {
		archive: getSelectedArchive(store),
		chat: getSelectedChat(store),
		contacts: getContacts(store),
		user: getUser(store),
		token: getToken(store),
	};
}

ChatResumePage.propTypes = {
	dispatch: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	intl: PropTypes.object.isRequired,
	archive: PropTypes.object,
	chat: PropTypes.object,
};

export default connect(mapStateToProps)(withRouter(injectIntl(ChatResumePage)));
