import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router'
import { Link } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Row, Col, Card, CardHeader, CardTitle, Form, FormGroup, Label, InputGroup, InputGroupText, Input, ButtonGroup, Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import config from '../../../config';
import { openExternalLink } from '../../../util/link';

import { checkUserAccountRequest, loginUserRequest, getUser, getToken } from '../UserActions';
import { isValidEmail, isValidPassword } from '../UserHelper';
import { displayErrors } from '../../Error/ErrorActions';

import PageTitle from '../../../components/Content/PageTitle';
import Loader from '../../../components/Loader/Loader';
import withRouter from '../../../components/Router/WithRouter';

class UserLoginPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            email: '',
            password: '',
            step: '',
        };
    }

    componentDidMount() {
        if(this.props.user && this.props.token) {
            this.goToNextStep();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if((!prevProps.user || prevState.token) && (this.props.user && this.props.token) && prevProps.token === this.props.token) {
            this.goToNextStep();
        }
    }

    handleChange = event => {
        const { target } = event;
        const { name } = target;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.setState({
            [name]: value,
        });
    }

    handleSubmit = event => {
        event && event.preventDefault();
        this.setState({
            isLoading: true,
        });
        this.props.dispatch(checkUserAccountRequest(this.state.email)).then(result => {
            if(result && result.ok) {
                if(result.isOldUser) {
                    this.setState({
                        isLoading: false,
                        step: 'verification',
                    });

                } else {
                    this.props.dispatch(loginUserRequest(this.state.email, this.state.password)).then(user => {
                        this.setState({
                            isLoading: false,
                        });
                        if(user) {
                            this.goToNextStep();
                        } else {
                            displayErrors('error', this.props.intl.formatMessage({
                                id: 'userLoginError',
                                defaultMessage: 'Wrong credentials! Please try again...',
                            }));
                        }
                    });
                }
            } else {
                this.setState({
                    isLoading: false,
                });
                displayErrors('error', this.props.intl.formatMessage({ id: 'userAccountExistError', defaultMessage: 'Your email address is not associated to an account!' }));
            }
        });
    }

    goToNextStep() {
        this.props.navigate('/resume');
    }

    render() {
        return (
            <div>
                <PageTitle>
                    <Button color="link" size="sm" tag={Link} to="/" className="float-left pl-3"><FontAwesome name="chevron-left" size="lg" /></Button>
                    <FontAwesome name="user-shield" /> <FormattedMessage id="userLoginTitle" defaultMessage="Login" />
                </PageTitle>
                <Row style={{maxHeight: '480px', overflow: 'auto'}}>
                    <Col xs="12" md={{size: 8, offset: 2}} lg={{size: 6, offset: 3}}>
                        <Form onSubmit={this.handleSubmit}>
                            <FormGroup>
                                <Label for="emailField"><FormattedMessage id="userEmailLabel" defaultMessage="Your email" /></Label>
                                <InputGroup>
                                    <InputGroupText addonType="prepend"><FontAwesome name="at" /></InputGroupText>
                                    <Input type="email" id="emailField" name="email" value={this.state.email} onChange={this.handleChange} invalid={!!this.state.email && !isValidEmail(this.state.email)} valid={isValidEmail(this.state.email)} />
                                </InputGroup>
                            <FormGroup>
                            </FormGroup>
                                <Label for="passwordField"><FormattedMessage id="userPasswordLabel" defaultMessage="Your password" /></Label>
                                <InputGroup>
                                    <InputGroupText addonType="prepend"><FontAwesome name="lock" /></InputGroupText>
                                    <Input type="password" id="passwordField" name="password" value={this.state.password} onChange={this.handleChange} invalid={!!this.state.password && !isValidPassword(this.state.password)} valid={isValidPassword(this.state.password)} />
                                </InputGroup>
                            </FormGroup>
                            {
                                this.state.step === 'verification'
                                ?
                                    <Alert color="info" className="text-center">
                                        <FontAwesome name="info-circle" /> <FormattedMessage id="userRecoverFromOldAppText" defaultMessage="You've been migrated from old app! Check your mailbox to recover your password and activate your new account!" />
                                    </Alert>
                                : null
                            }
                            <FormGroup>
                                <ButtonGroup className="d-flex" size="lg">
                                    <Button color="secondary" onClick={() => openExternalLink(`${config.url}/user/register`)}><FontAwesome name="user-plus" /> <FormattedMessage id="userRegisterButton" defaultMessage="Register" /></Button>
                                    <Button color="primary" size="lg" disabled={this.state.isLoading} onClick={this.handleSubmit}>{this.state.isLoading ? <FontAwesome name="spinner" spin /> : <FontAwesome name="sign-in-alt" />} <FormattedMessage id="userLoginButton" defaultMessage="Login" /></Button>
                                </ButtonGroup>
                            </FormGroup>
                            {process.env.NODE_ENV === 'development' && <Button onClick={event => this.setState({email: 'clement@offaxis.io', password: '123456'}, this.handleSubmit)}>LOG test</Button>}
                        </Form>
                    </Col>
                </Row>
            </div>
        )
    }
}

function mapStateToProps(store, props) {
    return {
        user: getUser(store),
        token: getToken(store),
    }
}

UserLoginPage.propTypes = {
    dispatch: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    user: PropTypes.object,
    token: PropTypes.string,
}

export default connect(mapStateToProps)(withRouter(injectIntl(UserLoginPage)));
