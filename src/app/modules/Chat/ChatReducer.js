// Import Actions
import { SET_CHATS, SET_CHAT_SELECTION } from './ChatActions';

// Initial State
export const initialState = {
    data: [],
    selection: null,
};

const ChatReducer = (state = initialState, action) => {
    switch(action.type) {

        case SET_CHATS:
            return {
                ...state,
                data: action.chats,
            };

        case SET_CHAT_SELECTION:
            return {
                ...state,
                selection: action.chat,
            };

        default:
            return state;
    }
};

export default ChatReducer;
