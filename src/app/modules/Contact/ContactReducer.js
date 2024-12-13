// Import Actions
import { SET_CONTACTS } from './ContactActions';

// Initial State
export const initialState = {
    data: [],
};

const ContactReducer = (state = initialState, action) => {
    switch(action.type) {

        case SET_CONTACTS:
            return {
                ...state,
                data: action.contacts,
            };

        default:
            return state;
    }
};

export default ContactReducer;
