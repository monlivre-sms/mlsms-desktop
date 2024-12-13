// Import Actions
import { ADD_ERROR, REMOVE_ERROR } from './ErrorActions';

// Initial State
export const initialState = {
    data: [],
};

const ErrorReducer = (state = initialState, action) => {
    switch(action.type) {

        case ADD_ERROR:
            return {
                ...state,
                data: [
                    ...state.data,
                    action.error,
                ],
            };

        case REMOVE_ERROR:
            return {
                ...state,
                data: state.data.filter(error => error.message !== action.error),
            };

        default:
            return state;
    }
};

export default ErrorReducer;
