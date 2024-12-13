// Import Actions
import { SET_ARCHIVES, SET_ARCHIVE_SELECTION, SET_DB_FILES } from './ArchiveActions';

// Initial State
export const initialState = {
    data: [],
    selection: {},
    dbFiles: {},
};

const ArchiveReducer = (state = initialState, action) => {
    switch(action.type) {

        case SET_ARCHIVES:
            return {
                ...state,
                data: action.archives,
            };

        case SET_ARCHIVE_SELECTION:
            return {
                ...state,
                selection: action.archive,
            };

        case SET_DB_FILES:
            return {
                ...state,
                dbFiles: action.files,
            };

        default:
            return state;
    }
};

export default ArchiveReducer;
