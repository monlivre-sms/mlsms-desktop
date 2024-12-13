import callApi from '../../util/apiCaller';

import { sequence } from '../../util/promises';
import { blobToFile, uploadFile } from '../../util/file';

export const MESSAGES_BLOCK_COUNT = 10000;


export function editConversationRequest(conversation) {
    return (dispatch) => {
        return callApi('conversation/edit', 'post', { conversation }).then(result => {
            return result.conversation;
        }).catch(err => {
            return null;
        });
    };
}


export function uploadConversationMessagesFilesRequest(conversation, messagesBlocks, onProgress = (percentile) => {}) {
    const rootPath = `conversations/${conversation._id}/`;
    const percentile = 100 / (messagesBlocks.length);
    return sequence(messagesBlocks, messagesBlock => {
        return new Promise((resolveBlock, rejectBlock) => {
            // const messageFile = blobToFile(new Blob([messagesBlock.content], { type: 'text/csv' }), messagesBlock.filename);
            const messageFile = Buffer.from(messagesBlock.content);
            uploadFile(`${rootPath}${messagesBlock.filename}`, messageFile, 'text/csv').then(result => {
                onProgress(percentile);
                resolveBlock(result);
            }).catch(rejectBlock);
        });
    });
}

export function uploadConversationImagesFilesRequest(conversation, imagesEntries, onProgress = (percentile) => {}) {
    const rootPath = `conversations/${conversation._id}/images/`;
    const percentile = 100 / (imagesEntries.length);
    return sequence(imagesEntries, imageEntry => {
        return new Promise((resolveImage, rejectImage) => {
            const extension = imageEntry.filename.split('.').pop();
            const imageFile = Buffer.from(imageEntry.content, 'base64');
            uploadFile(`${rootPath}${imageEntry.filename}`, imageFile, imageEntry.mime).then(result => {
                onProgress(percentile);
                resolveImage(result);
            }).catch(err => {
                resolveImage(null);
            });
        });
    });
}
