import React from 'react';
import bugsnag from 'bugsnag-js';
import createPlugin from 'bugsnag-react';

import config from '../../config';

const bugsnagClient = bugsnag({ apiKey: config.bugsnag.key, appVersion: config.version, notifyReleaseStages: ['production'], appType: 'client_desktop' });

export default bugsnagClient.use(createPlugin(React));
