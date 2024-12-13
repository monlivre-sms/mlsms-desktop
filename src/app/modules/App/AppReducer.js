import { push } from 'react-router-redux';

// Import Actions
import { SET_REDIRECT, REDIRECT, SET_MOUNTED, VERSION_CHECK } from './AppActions';


// Initial State
export const initialState = {
    redirect: '',
    isMounted: false,
    isUpToDate: true,
};

const AppReducer = (state = initialState, action) => {
    switch(action.type) {

        case SET_REDIRECT:
            return {
                ...state,
                redirect: action.redirect,
            };

        case REDIRECT:
            // state.redirect && push(state.redirect);
            return state;

        case SET_MOUNTED:
            return {
                ...state,
                isMounted: true,
            };

        case VERSION_CHECK:
            return {
                ...state,
                isUpToDate: action.isUpToDate,
            }

        default:
            return state;
    }
};


// Export Reducer
export default AppReducer;
