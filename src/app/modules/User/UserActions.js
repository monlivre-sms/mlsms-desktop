import jwt from 'jsonwebtoken';

import callApi from '../../util/apiCaller';
import storage from '../../util/storage';

import { addError } from '../Error/ErrorActions';

// Actions
export const SET_USER = 'SET_USER';


export function checkUserAccountRequest(email) {
    return (dispatch) => {
        return callApi('user/accountexists', 'post', { user: { email } }).then(result => {
            return result;
        }).catch(err => {
            console.error(err);
            return null;
        });
    };
}

export function loginUserRequest(email, password) {
    return dispatch => {
        return callApi('user/login', 'post', {email, password}).then(result => {
            if(result.token) {
                result.user && dispatch(setUser(result.user, result.token));
                storage && storage.setItem('jwtToken', result.token);
                return result.user;
            }
            return null;
        }).catch(err => {
            console.error(err);
            dispatch(addError(err));
            return null;
        })
    }
}

export function registerUserRequest(userData) {
    return dispatch => {
        return callApi('user/register', 'post', {user: userData}).then(result => {
            if(result.token) {
                result.user && dispatch(setUser(result.user, result.token));
                storage && storage.setItem('jwtToken', result.token);
                return result.user;
            }
            return null;
        }).catch(err => {
            console.error(err);
            dispatch(addError(err));
            return null;
        })
    }
}

// GETTERS
export function getUser(store) {
    return store.user.user;
}

export function getToken(store) {
    return store.user.token;
}

// DISPATCHERS
export function setUser(user, token) {
    return {
        type: SET_USER,
        user,
        token,
    };
}
