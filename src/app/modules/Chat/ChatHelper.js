import os from 'os';
import fs from 'fs';
// import csvGenerate from 'csv-generate';
import exif from 'exif-js';
import sha1 from 'sha1';
import slugify from 'slugify';

import { prefixedFileName, isIos10Backup } from '../Archive/ArchiveHelper';
import { sequence } from '../../util/promises';

console.log(os);
const TIMESTAMP_2001 = 978303600 + 60 * 60;
const TEMPORARY_DIRECTORY = `${os.tmpdir()}/`;
const CONVERSATION_ZIP_FILENAME = 'conversation.zip';
const CONVERSATION_CSV_FILENAME = 'export.csv';

// Helpers

export function convertDateFromIphone(iPhoneTimeStamp) {
    if(Object.prototype.toString.call(iPhoneTimeStamp) === '[object Date]') {
        return iPhoneTimeStamp;
    }
    let date = new Date((parseInt(iPhoneTimeStamp) + TIMESTAMP_2001) * 1000);
    if(isNaN(date.getTime())) {  // d.valueOf() could also work
        date = new Date(((parseInt(iPhoneTimeStamp) / 1000000000) + TIMESTAMP_2001) * 1000);
    }
    return date;
}

function formatDate(date) {
    if(Object.prototype.toString.call(date) === '[object Date]') {
        var withZero = function(val) {
            return `${val <= 9 ? '0' : ''}${val}`;
        };
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        var h = date.getHours();
        var min = date.getMinutes();
        var s = date.getSeconds();
        return '' + y + '-' + withZero(m) + '-' + withZero(d) + ' ' + withZero(h) + ':' + withZero(min) + ':' + withZero(s);
    }
    return formatDate(new Date(date));
};

// Some attachments can have same name, so we add prefix path to name
function getAttachmentFinalName(attachment) {
    attachment = `${attachment || ''}`;
    if(attachment) {
        const attachmentPathParts = attachment.split('/');
        let attachmentFileName = attachmentPathParts.pop();
        const attachmentPathId = attachmentPathParts.pop();
        const attachmentFileNameParts = attachmentFileName.split('.');
        const attachmentFileExt = attachmentFileNameParts.pop();
        attachmentFileName = attachmentFileNameParts.join('_');

        return slugify(`${attachmentPathId}-${attachmentFileName}.${attachmentFileExt}`).toLowerCase();
    }
}

export function getArchiveFilePath() {
    return `${TEMPORARY_DIRECTORY}${CONVERSATION_ZIP_FILENAME}`;
}

export function transformMessagesToCsv(messages, myName, otherContacts) {
    const delimiter = ';';
    console.log('names', myName, otherContacts);

    return messages.map(message => {
        const text = message.text ? decodeURIComponent(encodeURIComponent(message.text)) : '';
        // message.attachment && console.log(`'${text}'`, text || '---');
        const senderContact = otherContacts.find(contact => message.participant === contact.participantNumber) || {};
        const senderContactName = decodeURIComponent(encodeURIComponent(senderContact ? senderContact.name : ''));
        return [
            formatDate(message.date),
            message.isFromMe ? myName : senderContactName,
            message.isFromMe ? senderContactName : myName,
            text ? encodeURIComponent(text) : '',
            message.isFromMe ? 'true' : 'false',
            getAttachmentFinalName(message.attachment) || '',
        ].join(delimiter);
    }).join('\n');
}

export function getAttachments(messages, directory, onProgress = (percentile) => {}) {
    console.log(messages, directory);
    const messagesWithAttachment = messages.filter(message => message.attachment);
    const percentile = 100 / messagesWithAttachment.length;
    return sequence(messagesWithAttachment.map(message => {
                return {
                    ...message,
                    newAttachment: message.attachment.replace(/^(\/var\/mobile\/|~\/)/, 'MediaDomain-'),
                };
            })
            .filter(message => message.attachment.match(/\.(jpg|jpeg|png)$/i))
        , message => {
            return new Promise((resolve, reject) => {
                const name = getAttachmentFinalName(message.newAttachment);
                const ext = name.split('.').pop();
                const mime = `image/${ext === 'png' ? 'png' : 'jpg'}`;
                const path = `${directory}/${prefixedFileName(isIos10Backup(directory), sha1(message.newAttachment))}`
                console.log(message.newAttachment, name, ext, mime, path);
                resizeAttachment(path, mime).then(attachmentContent => {
                    onProgress(percentile);
                    resolve({
                        ...message,
                        file: {
                            filename: name,
                            content: attachmentContent,
                            mime,
                        },
                    });
                }).catch(err => {
                    console.error(err);
                    onProgress(percentile);
                    resolve({
                        ...message,
                        file: null,
                    });
                });
            });
        }
    ).then(results => {
        const messagesWithExistingFile = results.filter(message => message.file);
        console.log(`${results.length - messagesWithExistingFile.length} files not found! (found: ${messagesWithExistingFile.length} / total: ${results.length})`);
        return messagesWithExistingFile;
    });
}


/**
 * Include attachments
 * For compatibility reason, use base64 for fs.readFile *and* zip.file
 * Update 20150324 (memory leak > 160/170 photos)
 * Need to create only one canvas & one img,
 * and pass to function, with a clearRect at the end
**/
function resizeAttachment(path, mime) {
    // console.log('Read attachment file', path, mime);

    return new Promise((resolve, reject) => {
        if(fs.existsSync(path)) {
            var img = new Image();
            var canvas = document.createElement('canvas');

            var out;
            var size = 300;
            var ctx = canvas.getContext('2d');
            var imgData = fs.readFileSync(path);
            var portrait;
            var width;
            var height
            var exifData;
            var rotate;

            var imgBuffer = Buffer.from(imgData);
            var imgArrayBuffer = imgBuffer.buffer.slice(imgBuffer.byteOffset, imgBuffer.byteOffset + imgBuffer.byteLength);
            var imgB64 = imgBuffer.toString('base64');

            /// Let's read EXIF from picture (thanks iOS...)
            exifData = exif.readFromBinaryFile(imgArrayBuffer);
            rotate = exifData ? exifData.Orientation : 1;
            // console.log('Orientation is', rotate);

            /// Calculate best fit
            img.src = 'data:' + mime + ';base64,' + imgB64;
            img.onload = function() {
                portrait = img.width < img.height;
                width = portrait ? img.width * size / img.height : size;
                height = portrait ? size : img.height * size / img.width;

                // console.log('Image width:', width, 'Image height:', height);
                /// Now rotate if necessary
                //  ^1, >8, v3, <6
                if(rotate == 8 || rotate == 6) {
                    canvas.width = height;
                    canvas.height = width;
                    ctx.translate(height / 2, width / 2);
                    ctx.rotate((rotate == 6 ? 1 : -1) * Math.PI / 2);
                } else {
                    canvas.width = width;
                    canvas.height = height;
                    ctx.translate(width / 2, height / 2);
                    if(rotate == 3) ctx.rotate(Math.PI);
                }

                ctx.drawImage(img, -width / 2, -height / 2, width, height);

                out = canvas.toDataURL('image/jpg', 0.8).split(',')[1]; //.replace(`data:image/jpg;base64,`, '');
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // console.log('Attachment resized', path);
                resolve(out);

            }
            img.onerror = function(e) {
                console.error(e);
                reject('error on loading canvas');
            }
            img.onabort = function(e) {
                console.error(e);
                reject('abort on loading canvas');
            }
        } else {
            reject('file does not exist');
        }
    });

};
