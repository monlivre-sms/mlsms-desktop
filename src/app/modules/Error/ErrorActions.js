import Alert from 'react-s-alert';

import { confirmAlert } from 'react-confirm-alert'; // Import

import config from '../../config';


export const ADD_ERROR = 'ADD_ERROR';
export const REMOVE_ERROR = 'REMOVE_ERROR';


// Set in App.js
// const position = 'top-right';
// const effect = 'flip';
// const timeout = 3000;


export function displayErrors(type, message) {
    // console.log(type, message);
    // return {
    //     type: TRIGGER_ERROR,
    //     error: {
    //         type: type,
    //         message: message
    //     }
    // }
    message = message.message || message;
    if(message && typeof message === 'string') {
        switch(type) {
            case 'error':
                Alert.error(message);
                break;

            case 'warning':
                Alert.warning(message);
                break;

            case 'info':
                Alert.info(message);
                break;

            case 'success':
                Alert.success(message);
                break;


            default:
                alert(`${type} : ${message}`);
        }
    } else {
        if(message !== 'Unauthorized') {
            console.error(message);
        } else {
            // console.log(message);
        }
    }
}

export function confirmAction(title, message = '', confirm = () => {}, cancel = () => {}) {
    confirmAlert({
        title: title || 'Are you sure ?',          // Title dialog
        message: message || 'Please confirm your action :',      // Message dialog
        buttons: [
            {
                label: 'Cancel',
                onClick: cancel,
            },
            {
                label: 'Confirm',
                onClick: confirm,
            },
        ],
    });
}


export function sendNotification(message) {
    if(message) {
        const myNotification = new Notification(config.application.name, {
            body: message,
        });
    }
}

export function addError(error, type = 'error') {
    return {
        type: ADD_ERROR,
        error: {
            message: error,
            type,
        },
    };
}

export function removeError(error) {
    return {
        type: REMOVE_ERROR,
        error,
    };
}
