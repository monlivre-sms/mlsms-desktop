// import fetch from 'isomorphic-fetch'; // Do not work with cors
import config from '../config';
import storage from './storage';

// export const API_URL = (typeof window === 'undefined' || process.env.NODE_ENV === 'test')
//     ? process.env.BASE_URL || (`http://localhost:${process.env.PORT || config.port}/api`)
//     :
//         process.env.API_ENV === 'production' || process.env.NODE_ENV === 'production'
//         ? config.url + '/api'
//         : config.url + ':' + config.port + '/api'
// ;

// export const API_URL = config.api + '/api';
export const API_URL = config.api || `${config.url}/api`;

export default function callApi(endpoint, method = 'get', body, headersContent = {}, isExternal = false) {
    const headers = new Headers({
        'Content-Type' : 'application/json',
        ...headersContent,
    });

    if(!isExternal && storage && storage.getItem('jwtToken')) {
        // headers.Authorization = 'Bearer ' + storage.getItem('jwtToken');
        headers.append('Authorization', `Bearer ${storage.getItem('jwtToken')}`);
    }

    console.log(`REQUEST : ${isExternal ? endpoint : `${API_URL}/${endpoint}`}`, method, body);

    return new Promise((resolve, reject) => {
        try {
            fetch(isExternal ? endpoint : `${API_URL}/${endpoint}`, {
                headers,
                method,
                body: isExternal ? body : JSON.stringify(body),
            })
            .then(response => response.json()
                .then(json => ({ json, response }))
                .catch((error) => {
                    reject(response.statusText || 'JsonParseError');
                }))
            .then(({ json, response }) => {
                // console.log('API Json Response', json);
                if(!response.ok) {
                    // return reject(json.message);
                    return reject(json);
                }
                return json;
            })
            .then(
                response => resolve(response),
                error => reject(error)
            )
            .catch(error => {
                console.error(error);
                reject('FetchApiError');
            });
        } catch (e) {
            console.error('FetchApiError', e);
            reject('FetchApiError');
        }
    });
}
