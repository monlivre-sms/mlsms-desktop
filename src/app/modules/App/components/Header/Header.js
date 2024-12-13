import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import {} from 'reactstrap';

import config from '../../../../config';

import { initPersistedData, initApp } from '../../AppActions';
import {
	initLanguage,
	getCountryFromLanguage,
} from '../../../Intl/IntlActions';
import { displayErrors, removeError } from '../../../Error/ErrorActions';

import { enabledLanguages } from '../../../../Intl/setup';

import withRouter from '../../../../components/Router/WithRouter';
import Flag from '../../../../components/Flag/Flag';

import appIcon from '../../../../assets/images/icon.png';

class Header extends Component {
	componentDidMount() {
		this.props.dispatch(initPersistedData());
		this.switchLanguage(null);

		this.props.dispatch(initApp());
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.location !== prevProps.location) {
			window.scrollTo(0, 0);
		}

		// Redirect app if triggered by other component
		if (prevProps.appRedirect !== this.props.appRedirect) {
			this.props.navigate(this.props.appRedirect);
		}

		// Display or remove errors
		if (prevProps.errors.length !== this.props.errors.length) {
			this.props.errors.forEach((error) => {
				if (error && error.type && error.message) {
					displayErrors(
						error.type,
						this.props.intl.messages[`alert${error.message}`] ||
							error.message,
					);
				}
				this.props.dispatch(removeError(error.message));
			});
		}
	}

	switchLanguage = (lang) => {
		console.log('new lang', lang);
		this.props.dispatch(initLanguage(lang)).then((lang) => {});
	};

	renderLanguages() {
		return enabledLanguages
			.filter((locale) => locale !== this.props.currentLocale)
			.map((lang) => (
				<Link
					key={lang}
					to="#"
					onClick={(event) => {
						event.preventDefault();
						this.switchLanguage(lang);
					}}
					className={
						lang === this.props.currentLocale ? 'selected' : ''
					}
					className="p-2"
				>
					<Flag country={getCountryFromLanguage(lang)} />
				</Link>
			));
	}

	render() {
		return (
			<div className="header d-flex align-items-center bg-gradient-light border-bottom">
				<Link to="/" className="siteTitle">
					<img
						src={appIcon}
						alt={`${config.name} Live`}
						style={{ maxWidth: '200px', maxHeight: '80px' }}
					/>{' '}
					{process.env.API_ENV ? process.env.API_ENV : ''}
				</Link>
				<div className="ml-auto">{this.renderLanguages()}</div>
			</div>
		);
	}
}
// <FormattedMessage id="accountMy" defaultMessage="My account" /> ({`${this.props.user.firstName} ${this.props.user.lastName}`})

function mapStateToProps(store, props) {
	return {
		currentLocale: store.intl.locale,
		errors: store.error.data,
		appRedirect: store.app.redirect,
	};
}

Header.propTypes = {
	dispatch: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	intl: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
	errors: PropTypes.array.isRequired,
	appRedirect: PropTypes.string,
};

export default connect(mapStateToProps)(withRouter(injectIntl(Header)));
