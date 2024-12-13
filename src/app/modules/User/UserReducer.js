// Import Actions
import { SET_USER } from './UserActions';

// Initial State
export const initialState = {
    user: null,
    token: null,
};

const UserReducer = (state = initialState, action) => {
    switch(action.type) {

        case SET_USER:
            return {
                ...state,
                user: action.user,
                token: action.token,
            };

        default:
            return state;
    }
};

export default UserReducer;
