import React, { Component } from 'react';

import packageInfo from '../../../../../../package.json';

import config from '../../../../config';

export function Footer() {
    return (
        <div className="footer">
            <p>&copy; {new Date().getFullYear()} &middot; {config.application.name} {(process.env.ENV_CONFIG || process.env.NODE_ENV) !== 'production' && ` (${process.env.ENV_CONFIG || process.env.NODE_ENV})`} - {packageInfo.version}</p>
        </div>
    );
}
export default Footer;
