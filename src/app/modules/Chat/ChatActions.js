import { sequence } from '../../util/promises';

import callApi from '../../util/apiCaller';
import { getDb } from '../../util/sqllitedb';
import { canonizePhoneNumber } from '../../util/text';

import { convertDateFromIphone } from './ChatHelper';
import { getPrefixFromLanguage } from '../Intl/IntlActions';

// Actions
export const SET_CHAT_SELECTION = 'SET_CHAT_SELECTION';
export const SET_CHATS = 'SET_CHATS';


// CONSTANTS
const REQUEST_GET_CHATS = `
    SELECT
        c.ROWID as chatId,
        h.id as participantNumber,
        m.text,
		m.attributedBody as legend,
		m.associated_message_type as reactionType,
        a.filename as attachment,
        m.date,
        m.is_from_me as isFromMe
    FROM chat_message_join cm
    INNER JOIN chat c ON c.ROWID = cm.chat_id
    INNER JOIN message m ON m.ROWID = cm.message_id
    INNER JOIN handle h ON h.ROWID = m.handle_id
    LEFT JOIN message_attachment_join ma ON ma.message_id = m.ROWID
    LEFT JOIN attachment a ON ma.attachment_id = a.ROWID
`;

const REQUEST_GET_OLD_MESSAGES_BY_NUMBER = `
    SELECT
        c.ROWID as chatId,
        h.id as participantNumber,
        m.text,
        a.filename as attachment,
        m.date,
        m.is_from_me as isFromMe
    FROM chat c
    INNER JOIN chat_handle_join chj ON c.ROWID = chj.chat_id
    INNER JOIN handle h ON h.ROWID = chj.handle_id
    INNER JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
    INNER JOIN message m ON m.ROWID = cmj.message_id
    LEFT JOIN message_attachment_join ma ON ma.message_id = m.ROWID
    LEFT JOIN attachment a ON ma.attachment_id = a.ROWID
    WHERE m.handle_id = 0 AND c.chat_identifier =
`;

export const PHONE_OWNER_ID = '***me***';


// REQUESTS
export function getChatsRequest(messagesDbFile, locale) {
    return dispatch => {
        return getDb(messagesDbFile).then(db => {
			// console.log('DB', db);
            return db.all(REQUEST_GET_CHATS).then(results => {
                const chats = [];
                results.forEach(result => {
                    let chatEdit = chats.find(chat => chat.id === result.chatId);
                    if(!chatEdit) {
                        const chatMessages = results
                            .filter(result2 => result2.chatId === result.chatId)
                            .filter(result2 => result2.text || result2.attachment)
							.filter(message => !message.reactionType)
                            .map(formatMessage);
                        const participants = [];
                        chatMessages.forEach(message => {
                            const number = message.participant && canonizePhoneNumber(message.participant, getPrefixFromLanguage(locale));
                            if(number && !participants.find(participant => participant === number)) {
                                participants.push(number);
                            }
                        });
                        chats.push({
                            id: result.chatId,
                            messages: chatMessages,
                            participants,
                        });
                    }
                });


                let mergedChats = [];
                chats
                .filter(chat => chat.participants && chat.participants.length > 0)
                .forEach(chat => {
                    const existingChat = mergedChats.find(mergedChat => mergedChat.participants.length === chat.participants.length && mergedChat.participants.every(mergedChatParticipant => chat.participants.find(chatParticipant => chatParticipant === mergedChatParticipant)));
                    if(existingChat) {
                        mergedChats = mergedChats.filter(mergedChat => mergedChat.id !== existingChat.id);
                        mergedChats.push({
                            ...existingChat,
                            messages: existingChat.messages.concat(chat.messages),
                        });
                    } else {
                        mergedChats.push(chat);
                    }
                });


                // Fix for old Iphone messages
                return sequence([...mergedChats], chat => {
                    return new Promise((resolve, reject) => {
                        const number = ((chat.messages||[]).find(message => !message.isFromMe) ||{}).participant || null;
                        if(number) {
                            return db.all(`${REQUEST_GET_OLD_MESSAGES_BY_NUMBER} '${number}'`).then(results => {
                                const oldMessages = results.map(formatMessage).filter(oldMessage => !chat.messages.find(message => (message.text === oldMessage.text || message.attachment === oldMessage.attachment) && message.date === oldMessage.date && message.isFromMe === oldMessage.isFromMe));
                                // console.log(`Old messages found for number ${number}: ${oldMessages.length}`);
                                resolve({
                                    ...chat,
                                    messages: chat.messages.concat(oldMessages),
                                })
                            }).catch(err => {
                                console.error(err);
                                resolve(chat);
                            })
                        }
                        resolve(chat);
                    })
                }).then(mergedChats => {

                    mergedChats = mergedChats.filter(chat => chat.messages && chat.messages.length > 1).sort((chatA, chatB) => chatB.messages.length - chatA.messages.length);
                    console.log('Chats found in DB', mergedChats.length, `${chats.length - mergedChats.length} merged chats`);

                    console.log(mergedChats);
                    // dispatch(setChats(mergedChats));
                    return mergedChats;
                });
            });
        });
    }
}

export function formatMessage(message) {
    return {
        participant: !message.isFromMe && message.participantNumber ,
        text: message.text || getMessageAttachmentLegend(message) || '',
        attachment: message.attachment || null,
        date: convertDateFromIphone(message.date),
        isFromMe: message.isFromMe,
    };
}

function getMessageAttachmentLegend(message) {
	if(message && message.legend) {
		// console.log(typeof message.legend, message.legend);
		// const blob = message.legend.buffer;
		// console.log(typeof blob, blob, blob.toString());
		// console.log(String.fromCharCode.apply(String, message.legend));
		// new Blob(message.legend, {type: 'application/octet-stream'}).text(console.log);


		let text = Buffer.from(message.legend)?.toString('ascii') || '';

		// console.log('source legend', text);
		// console.log(text.split(/\\u(.{4})/gi), text?.toString('ascii').split(' '));
		// 'ascii'
		console.log('base', [text]);
		text = text.substring(text.indexOf('o?<') + 3); // .replace(/\u00(.{2})/gi, '|');
		console.log('after o?<', [text]);

		text = text.substring(0, text.search(/NS\w/));
		console.log('before NS...', [text]);

		text = text.lastIndexOf('iI') ? text.substring(0, text.lastIndexOf('iI')) : text;
		console.log('before iI', [text]);

		text = text.split(' ').filter(part => !['NSValue', 'NSAttrbuted', 'NSMutable', 'NSKey'].some(objectKey => part.includes(objectKey))).join(' ');
		// text = text.substring(text.indexOf('+V') + 3, text.indexOf('NSDictionary') - 13);

		console.log('Final legend', [text]);
		return text;
	}
	return null;
}

// GETTERS
export function getChats(store) {
    return store.chats.data;
}

export function getSelectedChat(store) {
    return store.chats.selection;
}


// DISPATCHERS
export function setChats(chats) {
    return {
        type: SET_CHATS,
        chats,
    }
}

export function setChatSelection(chat) {
    return {
        type: SET_CHAT_SELECTION,
        chat,
    }
}
