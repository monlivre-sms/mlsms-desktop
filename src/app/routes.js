import React from 'react';
import { Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import App from './modules/App/App';
import HomePage from './modules/App/pages/view/HomePage';

import ArchiveSelectionPage from './modules/Archive/pages/ArchiveSelectionPage';
import ChatSelectionPage from './modules/Chat/pages/ChatSelectionPage';
import ChatResumePage from './modules/Chat/pages/ChatResumePage';
import ChatSuccessPage from './modules/Chat/pages/ChatSuccessPage';

import UserLoginPage from './modules/User/pages/UserLoginPage';

export default function () {
	return (
		<BrowserRouter context={{}}>
			<Routes>
				<Route path="/" element={<App />}>
					<Route
						path="/archives"
						element={<ArchiveSelectionPage />}
					/>
					<Route path="/chats" element={<ChatSelectionPage />} />
					<Route path="/login" element={<UserLoginPage />} />

					<Route path="/resume" element={<ChatResumePage />} />
					<Route path="/success" element={<ChatSuccessPage />} />
					<Route path="/" element={<HomePage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
