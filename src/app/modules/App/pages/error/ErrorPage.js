import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container, Row, Col, Card, CardHeader, CardTitle, CardBody, CardImg, CardImgOverlay, Jumbotron, ButtonGroup, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';


function ErrorPage(props) {
    return (
        <Container>
            <Row>
                <Col sm={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }}>
                    <Card className="shadow text-center">
                        <CardHeader>
                            <CardTitle>
                                <FontAwesome name="exclamation-triangle" /> <FormattedMessage id="app404ErrorTitle" defaultMessage="Wrong Way..." />
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <ButtonGroup>
                                <Button to="/" tag={Link} color="primary"><FontAwesome name="chevron-left" /> <FormattedMessage id="back" defaultMessage="Back" /></Button>
                                <Button to={'/profile'} tag={Link} color="info" outline><FontAwesome name="tachometer-alt" /> <FormattedMessage id="userAccountMy" defaultMessage="My account" /></Button>
                            </ButtonGroup>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default injectIntl(ErrorPage);
