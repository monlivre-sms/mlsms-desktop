import React from 'react';
import PropTypes from 'prop-types';

import FR from '../../assets/images/flags/FR.png'
import GB from '../../assets/images/flags/GB.png'
import IT from '../../assets/images/flags/IT.png'

export default function Flag({ country }) {
    function getCountryFileName() {
        if(country.includes('_')) {
            return country.toLowerCase();
        }
        return country.toUpperCase();
    }

    function getImgPath() {
        switch(getCountryFileName()) {

            case 'FR':
                return FR;

            case 'GB':
                return GB;

            case 'IT':
                return IT;

            default:
                return '';
        }
    }

    const flagImgPath = getImgPath();
    return flagImgPath ? <img src={flagImgPath} alt={`flag ${country}`} title={country} /> : <span>{country}</span>;
}

Flag.propTypes = {
    country: PropTypes.string.isRequired,
};
