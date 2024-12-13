import configDev from './config/config.dev';
import configStaging from './config/config.staging';
import configProd from './config/config.production';

import packageInfo from '../../package.json';

console.log(process.env);
let selectedConfig = configDev;

switch(process.env.ENV_CONFIG || process.env.NODE_ENV) {
    case 'development':
        selectedConfig = configDev;
        break;

    case 'staging':
        selectedConfig = configStaging;
        break;

    case 'production':
        selectedConfig = configProd;
        break;
}

export default {
    version: packageInfo.version,
    ...selectedConfig,
};
