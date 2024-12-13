import fetch from 'isomorphic-fetch';
// import request from 'request';

import callApi, { callExternalApi } from './apiCaller';
import { uploadFile as s3UploadFile, getFile as s3GetFile, streamFile, listFiles, deleteFile as s3DeleteFile } from './aws/s3';


export function getFileUrl(filename, userId = null, method = 'get') {
    return callApi('file/geturl', 'post', { filename, userId, method }).then(result => {
        return result.url;
    });
}

export function getFileContent(filename, userId = null) {
    return getFileUrl(filename, userId).then(url => {
        if(url) {
            return fetch(url, {
                method: 'GET',
            })
            .then(response => {
                return response;
            });
        }
        return Promise.reject('noFileError');
    }).catch(error => {
        console.error('getFileContent', error);
    });
}


export function uploadFile(filename, data, contentType = '', userId = null) {
    return new Promise((resolve, reject) => {
        return getFileUrl(filename, userId, 'put').then(url => {
            if(url) {
              fetch(
                url,
                {
                    headers: new Headers({
                        'Content-Type': contentType,
                    }),
                    method: 'PUT',
                    body: data,
                }).then(response => {
                  resolve(true);
                }).catch(err => {
                  console.error('UploadFile:::Error on sending to S3', err);
                  return reject(err);
                })
            } else {
                reject('noUploadUrl');
            }
        }).catch(error => {
            console.error('UploadFile:::Error getting presigned url', error);
            reject(error);
        });
    });
}


export function getFiles(path) {
    return new Promise((resolve, reject) => {
    });
}


export function blobToFile(blob, fileName) {
    // A Blob() is almost a File() - it's just missing the two properties below which we will add
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    return blob;
}

export function getBlobContent(blob) {
    console.log(blob.type, blob);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // This fires after the blob has been read/loaded.
        reader.addEventListener('loadend', (e) => {
            return resolve(e.srcElement.result);
        });
        // Start reading the blob as text.
        reader.readAsText(blob);
    });
}
