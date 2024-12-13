import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getTranslation } from '../../IntlActions';

function Translate(props) {
    return <span>{getTranslation(props.model, props.field, props.locale)}</span>;
}

function mapStateToProps(store, props) {
    return {
        locale: store.intl.locale,
    };
}

Translate.propTypes = {
    model: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(Translate);
