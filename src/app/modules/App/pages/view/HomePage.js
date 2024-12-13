import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import config from '../../../../config';
import { sequence } from '../../../../util/promises';
import { openExternalLink } from '../../../../util/link';

import { checkArchivesRequest, selectArchiveRequest, setArchives, setArchiveDBFiles } from '../../../Archive/ArchiveActions';
import { setChats } from '../../../Chat/ChatActions';
import { setContacts } from '../../../Contact/ContactActions';
import { displayErrors } from '../../../Error/ErrorActions'

import Loader from '../../../../components/Loader/Loader';
import ArchiveError from '../../../Archive/components/error/ArchiveError';

import appIcon from '../../../../assets/images/icon.png';
import withRouter from '../../../../components/Router/WithRouter';

class HomePage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            hasError: false,
        };

        this.checkArchive = this.checkArchive.bind(this);
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
        });
        this.resetData().then(() => {
            this.checkArchive();
        })
    }

    getActiveChats() {
        return this.state.chats
            .filter(chat => (chat.participants || []).length > 1)
            .filter(chat => (chat.messages || []).length > 1);
    }

    resetData() {
        return sequence(
            [
                () => setArchives([]),
                () => setArchiveDBFiles(null),
                () => setChats([]),
                () => setContacts([]),
            ],
            fn => Promise.resolve(this.props.dispatch(fn))
        );
    }

    checkArchive() {
        this.setState({
            isLoading: true,
        });

        this.props.dispatch(checkArchivesRequest()).then(archives => {
            if(archives && archives.length) {
                this.setState({
                    isLoading: false,
                });
                if(archives.length === 1) {
                    this.props.dispatch(selectArchiveRequest(archives[0])).then(files => {
                        if(files) {
                            this.props.navigate('/chats');
                        } else {
                            displayErrors('error', this.props.intl.formatMessage({
                                id: 'archiveBackupNotFoundError',
                                defaultMessage: 'Your archive could not be found on your computer!',
                            }));
                        }
                    })
                } else {
                    console.log('Redirect to /archives');
                	this.props.navigate('/archives');
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
    }

    render() {
        return (
            <div className="pt-5 text-center">
                <img src={appIcon} alt={config.application.name} style={{maxWidth: '300px', maxHeight: '100px'}} />
                <h1 className="display-3">{config.application.name}</h1>
                <hr className="my-2" />
                {
                    this.state.isLoading
                    ? <Loader />
                    :
                        this.state.hasError
                        ? <ArchiveError />
                        : <Button color="primary" size="lg" onClick={this.checkArchive}><FormattedMessage id="appStart" defaultMessage="Start" /> <FontAwesome name="chevron-right" /></Button>
                }
            </div>
        );
    }
}

function mapStateToProps(store) {
    return {};
}

HomePage.propTypes = {
    intl: PropTypes.object.isRequired,
	navigate: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(withRouter(injectIntl(HomePage)));
