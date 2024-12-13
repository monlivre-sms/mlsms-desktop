import callApi from '../../util/apiCaller';
import { sequenceCall } from '../../util/promises';

// import packageInfo from '../../../../package.json';

// import { isLoggedIn } from '../User/UserActions';
import { addError } from '../Error/ErrorActions';

// Export Constants
export const SET_REDIRECT = 'SET_REDIRECT';
export const REDIRECT = 'REDIRECT';
export const SET_MOUNTED = 'SET_MOUNTED';
export const INIT_PERSISTED_DATA = 'INIT_PERSISTED_DATA';
export const VERSION_CHECK = 'VERSION_CHECK';
export const SET_IS_ONLINE = 'SET_IS_ONLINE';

// Export Request Actions
export function initApp() {
    return (dispatch) => {
        dispatch(setMounted());
    };
}

export function checkVersionRequest() {
    // return (dispatch) => callApi('app/desktop/version').then(res => {
    //     if(res.version) {
    //         dispatch(setVersionCheck(res.version === version));
    //     }
    //     return res.version;
    // }).catch(error => {
    //     dispatch(addError(error));
    // });
}

// Export Actions

export function setRedirect(redirect = '') {
    // console.log('setRedirect', redirect);
    return {
        type: SET_REDIRECT,
        redirect,
    };
}

export function redirect() {
    return {
        type: REDIRECT,
    };
}

export function setMounted() {
    return {
        type: SET_MOUNTED,
    };
}

export function initPersistedData() {
    return {
        type: INIT_PERSISTED_DATA,
    };
}

export function setVersionCheck(isUpToDate) {
    return {
        type: VERSION_CHECK,
        isUpToDate,
    };
}
