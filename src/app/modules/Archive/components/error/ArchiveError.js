import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Alert } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import electronIs from 'electron-is';

import config from '../../../../config';
import { openExternalLink } from '../../../../util/link';

export default function ArchiveError(props) {
    return (
        <Fragment>
            <Alert color="danger" className="text-center">
                <FontAwesome name="exclamation-triangle" /> <FormattedMessage id="archiveMissingError" defaultMessage="We didn't find any archive in your computer! Please contact us to check your installation." />
                <br />
                <Button color="danger" outline onClick={() => openExternalLink(`${config.website || config.url}/contact`)}><FontAwesome name="envelope" /> <FormattedMessage id="contactButton" defaultMessage="Contact us" /></Button>
            </Alert>
            {
                electronIs.macOS()
                ?
                    <p className="pt-3" style={{fontSize: '1rem'}}>
                        <FontAwesome name="info-circle" size="lg" /> <FormattedMessage id="archiveHelpMacText" defaultMessage="If you are on Mac, did you realize the necessary manipulation so that the software can read your backup? Go to System Preferences> Security and Privacy> Full Disk Access and add the MySitLive app by unlocking the padlock on the bottom left." />
                    </p>
                : null
            }
        </Fragment>
    )
}
