// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Routes from '../routes';

import IntlWrapper from '../modules/Intl/IntlWrapper';

export default function Root({store}) {
  return (
		<Provider store={store}>
			<IntlWrapper>
				<Routes />
			</IntlWrapper>
		</Provider>
  );
}
