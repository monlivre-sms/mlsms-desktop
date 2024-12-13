import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Row, Col, Card, CardHeader, CardTitle, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import PageTitle from '../../../components/Content/PageTitle';

function ChatSuccessPage(props) {

    return (
        <div>
            <PageTitle>
                <FontAwesome name="thumbs-up" /> <FormattedMessage id="chatSuccessTitle" defaultMessage="Well done!" />
            </PageTitle>
            <Row style={{maxHeight: '480px', overflow: 'auto'}}>
                <Col xs="12" md={{size: 8, offset: 2}} lg={{size: 6, offset: 3}}>
                    <Alert color="success" className="text-center">
                        <FormattedMessage id="appSuccessText" defaultMessage="Congratulations!" />
                    </Alert>
                    <Button color="primary" size="sm" block tag={Link} to="/"><FontAwesome name="sync-alt" /> <FormattedMessage id="restartButton" defaultMessage="Restart" /></Button>
                </Col>
            </Row>
        </div>
    );
}


ChatSuccessPage.propTypes = {}

export default ChatSuccessPage;
