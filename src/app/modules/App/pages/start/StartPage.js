import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Container, Row, Col, Card, CardHeader, CardTitle, CardBody, CardImg, CardImgOverlay, Jumbotron, ButtonGroup, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import config from '../../../../config';

import { checkArchivesRequest } from '../../../Archive/ArchiveActions';
import { getChatsRequest, PHONE_OWNER_ID } from '../../../Chat/ChatActions';

import { getPrefixFromLanguage } from '../../../Intl/IntlActions';
import { displayErrors } from '../../../Error/ErrorActions';

import PageTitle from '../../../../components/Content/PageTitle';
import Loader from '../../../../components/Loader/Loader';

import appIcon from '../../../../assets/images/icon.png';

class StartPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            hasError: false,
            contacts: [],
            messages: [],
            chats: [],
        }

        this.checkArchive = this.checkArchive.bind(this);
    }

    componentDidMount() {
        this.checkArchive();
    }

    getActiveChats() {
        return this.state.chats
            .filter(chat => (chat.participants || []).length > 1)
            .filter(chat => (chat.messages || []).length > 1);
    }

    checkArchive() {
        this.setState({
            isLoading: true,
        });

        checkArchivesRequest().then(archives => {
            if(archives && archives.length) {
                if(archives.length > 1) {
                    this.props.dispatch(setArchiveDBFiles(archives[0])).then(files => {
                        if(files) {
                            push('/chats');
                        } else {
                            displayErrors('error', this.props.intl.formatMessage({
                                id: 'archiveBackupNotFoundError',
                                defaultMessage: 'Your archive could not be found on your computer!',
                            }));
                        }
                    })
                } else {
                    push('/archives');
                }
            } else {
                this.setState({
                    isLoading: false,
                    hasError: true,
                });
                displayErrors('error', this.props.intl.formatMessage({
                    id: 'archiveBackupNotFoundError',
                    defaultMessage: 'Your archive could not be found on your computer!',
                }));
            }
        })


        // Do not use contacts query to get messages BUT...
        // Get all messages with handle.id field (handle => participant, handle.id => phone number or name, retrieve name in contacts list)
        // Create chat object with participants list, messages list
        // Messages "from me" are identicated by m.is_from_me field (0 || 1)
        // Request: SELECT c.ROWID, m.handle_id, h.id, m.text, m.is_from_me FROM chat_message_join cm INNER JOIN chat c ON c.ROWID = cm.chat_id INNER JOIN message m ON m.ROWID = cm.message_id INNER JOIN handle h ON h.ROWID = m.handle_id
        loadBackupData(getPrefixFromLanguage(this.props.currentLocale)).then(results => {
            console.log(results);
            this.setState({
                isLoading: false,
                contacts: results.contacts,
                chats: results.chats,
                // (results.contacts || []).sort((contactA, contactB) => {
                //     const contactNameA = `${contactA.first || contactA.last}`;
                //     const contactNameB = `${contactB.first || contactB.last}`;
                //     if(contactNameB < contactNameA) {
                //         return 1;
                //     } else if(contactNameB > contactNameA) {
                //         return -1;
                //     }
                //     return 0;
                // }),
                messages: results.messages,
            });
        }).catch(err => {
            console.error(err);
            this.setState({
                isLoading: false,
                hasError: true,
            });
            displayErrors('error', this.props.intl.formatMessage({
                id: 'archiveBackupNotFoundError',
                defaultMessage: 'Your archive could not be found on your computer!',
            }));
        })
    }

    render() {
        if(this.state.isLoading) {
            return <Loader />
        }
        const chats = this.getActiveChats();
        return (
            <div className="pt-5 text-center">
            </div>
        );
    }
}

// <FormattedMessage id="appHello" defaultMessage="Hello !" />


// Retrieve data from store as props
function mapStateToProps(store) {
    return {
        currentLocale: store.intl.locale,
    };
}

StartPage.propTypes = {
    intl: PropTypes.object.isRequired,
    currentLocale: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(injectIntl(StartPage));
