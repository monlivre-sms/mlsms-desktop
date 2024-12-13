import { configureStore as reduxConfitureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers';

export function configureStore(initialState = {}) {
	const store = reduxConfitureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				thunk: true,
				immutableCheck: false,
				serializableCheck: false,
			}),
		preloadedState: initialState,
		enhancers: (getDefaultEnhancers) => getDefaultEnhancers(),
	});

	if (process.env.NODE_ENV !== 'production' && module.hot) {
		module.hot.accept('../reducers', () =>
			store.replaceReducer(rootReducer),
		);
	}
	return store;
}

export default {};
