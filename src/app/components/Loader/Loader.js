import React from 'react';
import FontAwesome from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';

import config from '../../config';

import appIcon from '../../assets/images/icon.png';

export default function Loader() {
	return (
		<div
			className="loader-wrapper"
			style={{
				maxWidth: '200px',
				minHeight: '50px',
				textAlign: 'center',
				padding: '50px',
			}}
		>
			<img
				src={appIcon}
				alt={config.application.name}
				style={{ maxWidth: '200px', maxHeight: '80px' }}
			/>
			<div>
				<FormattedMessage id="appLoading" defaultMessage="Loading..." />
				<br />
				<FontAwesome name="spinner" spin size="lg" />
			</div>
		</div>
	);
}
