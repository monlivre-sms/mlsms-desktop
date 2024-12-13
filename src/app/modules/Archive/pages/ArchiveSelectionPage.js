import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Row, Col, Card, CardHeader, CardTitle, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import { selectArchiveRequest, getArchives } from '../ArchiveActions';
import { displayErrors } from '../../Error/ErrorActions';

import PageTitle from '../../../components/Content/PageTitle';
import ArchiveItem from '../components/view/ArchiveItem';
import ArchiveError from '../components/error/ArchiveError';
import withRouter from '../../../components/Router/WithRouter';

class ArchiveSelectionPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            archiveHover: null,
        };
    }

    handleSelect = archive => {
        this.props.dispatch(selectArchiveRequest(archive)).then(files => {
            if(files) {
                this.props.navigate('/chats');
            } else {
                displayErrors('error', this.props.intl.formatMessage({
                    id: 'chatNotFoundError',
                    defaultMessage: 'There is no conversation in your archive!',
                }));
            }
        })
    }

    render() {
        const { archives } = this.props;
        return (
            <div>
                <PageTitle>
                    <FontAwesome name="cubes" /> <FormattedMessage id="archiveSelectionTitle" defaultMessage="Select an archive" />
                </PageTitle>
                <Row style={{maxHeight: '500px', overflow: 'auto'}}>
                    <Col xs="12" md={{size: 8, offset: 2}} lg={{size: 6, offset: 3}}>
                        {
                            archives && archives.length
                            ? archives.map((archive, index) => <ArchiveItem key={index} archive={archive} onSelect={this.handleSelect} />)
                            : <ArchiveError />
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}

function mapStateToProps(store, props) {
    return {
        archives: getArchives(store),
    }
}

ArchiveSelectionPage.propTypes = {
    dispatch: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    localte: PropTypes.string,
    archives: PropTypes.arrayOf(PropTypes.object),
}

export default connect(mapStateToProps)(withRouter(injectIntl(ArchiveSelectionPage)));
