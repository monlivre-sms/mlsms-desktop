import React, { Fragment } from 'react';
import ReactDOMClient, { createRoot } from 'react-dom/client';
// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from '../app/containers/Root';
import { configureStore } from '../app/store/configureStore';

import '../app/app.global.css';

const store = configureStore();

const AppContainer = Fragment; // process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const container = document.getElementById('root');

ReactDOMClient.hydrateRoot(container, <Root key={Math.random()} store={store} />);

if(module.hot) {
    module.hot.accept('../app/containers/Root', () => {
        // eslint-disable-next-line global-require
        const NextRoot = require('../app/containers/Root').default;
        ReactDOMClient.hydrateRoot(container, <NextRoot key={Math.random()} store={store} />);
    });
}
