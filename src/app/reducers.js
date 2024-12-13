// @flow
import { combineReducers } from 'redux';

import intl from './modules/Intl/IntlReducer';
import app from './modules/App/AppReducer';
import error from './modules/Error/ErrorReducer';

import user from './modules/User/UserReducer';
import archives from './modules/Archive/ArchiveReducer';
import chats from './modules/Chat/ChatReducer';
import contacts from './modules/Contact/ContactReducer';

export default combineReducers({
	app,
	archives,
	chats,
	contacts,
	error,
	intl,
	user,
});
