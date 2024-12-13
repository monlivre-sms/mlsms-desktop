const sqlite = require('sqlite');
const os = require('os');
const fs = require('fs');
const {ncp} = require('ncp');
const path = require('path');
const lineReader = require('line-reader');
const iconv = require('iconv-lite');

/* global mls */

let _backupCopied = false;

const DB_REQUESTS = {
    'countMessages': "SELECT COUNT(m.handle_id) AS cpt, h.id AS value FROM message m INNER JOIN handle h ON m.handle_id = h.ROWID GROUP BY handle_id ORDER BY cpt DESC",
    'getMessages': "SELECT m.ROWID AS mid, m.`text` AS `text`, m.`date` AS `date`, m.is_from_me AS is_from_me, h.id AS value, a.filename AS filename FROM message m LEFT JOIN handle h ON m.handle_id = h.ROWID LEFT JOIN message_attachment_join ma ON ma.message_id = m.ROWID LEFT JOIN attachment a ON ma.attachment_id = a.ROWID",
    'getMessagesFix': "SELECT m.ROWID AS mid, m.`text` AS `text`, m.`date` AS `date`, m.is_from_me AS is_from_me, h.id AS value, a.filename AS filename, m.handle_id FROM chat c INNER JOIN chat_handle_join chj ON c.ROWID = chj.chat_id INNER JOIN handle h ON h.ROWID = chj.handle_id INNER JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id INNER JOIN message m ON m.ROWID = cmj.message_id LEFT JOIN message_attachment_join ma ON ma.message_id = m.ROWID LEFT JOIN attachment a ON ma.attachment_id = a.ROWID WHERE m.handle_id = 0 AND c.chat_identifier = ",
    'getContacts': "SELECT p.First AS first, p.Last AS last, v.value AS value FROM ABPerson p INNER JOIN ABMultiValue v ON p.ROWID = v.record_id WHERE v.property = 3 AND NOT (p.First == '' AND p.Last == '') GROUP BY v.value ORDER BY v.value ASC",
    'getChats' : "SELECT c.ROWID as chatId, h.id as participantNumber, m.text, a.filename as filename, m.date, m.is_from_me as isFromMe FROM chat_message_join cm INNER JOIN chat c ON c.ROWID = cm.chat_id INNER JOIN message m ON m.ROWID = cm.message_id INNER JOIN handle h ON h.ROWID = m.handle_id LEFT JOIN message_attachment_join ma ON ma.message_id = m.ROWID LEFT JOIN attachment a ON ma.attachment_id = a.ROWID",
};

export const PHONE_OWNER_ID = '***me***';

// FIX Get messages before 31 October 2018
// Messages are joined by table chat, chat_message_join, handle, chat_handle_join
// Use 'getMessagesFix' with chat_identifier equal to phone number (handle.id as value)

/**
* Checks whether we are having an ios10backup or not
* @param directory
*/
function isIos10Backup(directory) {

    function hasLengthOfTwo(a) {
        return a.length === 2;
    }

    return fs
    .readdirSync(directory)
    .filter(hasLengthOfTwo).length > 0;
}

/**
* Adds a two-letter prefix path in front of the file if its an ios10 backup or later
* @param isIos10Backup
* @param fileName
* @returns {string}
*/
function prefixedFileName(isIos10Backup, fileName) {
    return isIos10Backup === true ? path.join(fileName.substr(0, 2), fileName) : fileName;
}

function formatSMS(text) {
    if(text == null) {
        return text;
    }
    return iconv.decode(text.trim(), 'utf8');
};


function canonizePhoneNumber(number, prefix) {
    number = number.trim();
    number = number.replace(/[^\+0-9]/g, '');
    if(number.substr(0, 2) == '00')
    number = `+${  number.substr(2)}`;
    if(number.charAt(0) == '+') return number;
    if(number.charAt(0) == '0' && prefix != '+39')
    number = number.substr(1);
    return prefix + number;
};

function getUserHome() {
    let userHome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    if(userHome === '\\') {
        userHome = path.resolve("");
        return userHome.substr(0, userHome.indexOf("AppData"));
    }
    return userHome;
};

function copyFile(source, target) {
    return new Promise((resolve, reject) =>  {
        if(fs.existsSync(target)) {
            fs.unlinkSync(target);
        }
        ncp(source, target, (err) => {
            if(err) {
                console.log(err);
                reject(err);
            } else {
                resolve();
            }

        });
    })
}

export function getPlatformDirectories() {
    console.log('getPlatformDirectories');
    const platform = os.platform();
    console.log(platform);
    let directories = [];

    switch(platform) {
        case 'darwin':
            directories = [
                `${getUserHome()  }/Library/Application Support/MobileSync/Backup/`,
            ];
            break;

        case 'winxp':
        case 'win32':
        case 'win64':
            directories = [
                `${getUserHome()  }\\Apple\\MobileSync\\Backup\\`,
                `${getUserHome()  }\\Apple Computer\\MobileSync\\Backup\\`,
                `${getUserHome()  }\\Application Data\\Apple Computer\\MobileSync\\Backup\\`,
                `${getUserHome()  }\\AppData\\Roaming\\Apple Computer\\MobileSync\\Backup\\`,
            ];
            break;

        case 'linux':
            directories = [
                `${getUserHome()  }/Apple Computer/MobileSync/Backup/`,
            ];
            break;

        default:
            return Promise.reject(new Error(`OS inconnu : ${  platform}`));
    }
    console.log(directories);
    return Promise.resolve(directories);
}

export function getBackupDirectory() {

    return Promise.resolve()
    .then(() => getPlatformDirectories())
    .then((directories) => {

        for(let i = 0; i < directories.length; i++) {
            const directory = directories[i];
            if(directory.indexOf('DS_Store') < 0) {
                if(fs.existsSync(directory)) {
                    return Promise.resolve(directory);
                }
            }
        }

        return Promise.reject(new Error('Le chemin de l\'archive est incorrect ou iTunes n\'est pas installé'));
    })
    .then((directory) => {
        console.log('Directory found', directory);

        let devices = fs.readdirSync(directory);

        devices.sort((a, b) => {
            if(a.length < 40) {
                return 1; // Si ce n'est pas un dossier de sauvegarde on le place à la fin
            }
            return fs.statSync(directory + b).mtime.getTime() - fs.statSync(directory + a).mtime.getTime();
        });

        devices.forEach(deviceRootDir => {
            if(deviceRootDir.indexOf('DS_Store') < 0) {
                // console.log('Device root directory :', `${directory}${deviceRootDir}`)
                const deviceDirs = fs.readdirSync(directory + deviceRootDir);

                deviceDirs.forEach(dir => {
                    // console.log('Device files/dir :', dir)
                })
            }
        });

        devices = devices.filter(device => device.indexOf('DS_Store') < 0);

        if(!devices || devices.length === 0) {
            return Promise.reject(new Error('Aucune sauvegarde n\'a été trouvée'));
        }

        console.log(`Search messages in ${directory}${devices[0]}`);
        return Promise.resolve(directory + devices[0]);
    });
}

export function getBackupFiles() {
    return getBackupDirectory()
    .then((directory) => {
        console.log('Directory selected', directory);
        return {
            'messages': path.join(directory, prefixedFileName(isIos10Backup(directory), '3d0d7e5fb2ce288813306e4d4636395e047a3d28')),
            'contacts': path.join(directory, prefixedFileName(isIos10Backup(directory), '31bb7ba8914766d4ba40d6dfb6113c8b614be442')),
            'infos': path.join(directory, 'Info.plist'),
            'messages_dest': path.join(os.tmpdir(), 'messages.sqlite'),
            'contacts_dest': path.join(os.tmpdir(), 'contacts.sqlite'),
            'infos_dest': path.join(os.tmpdir(), 'Info.plist'),
        }
    });

}

export function initBackupCopy(files) {
    return Promise.all([
        copyFile(files.infos, files.infos_dest),
        copyFile(files.messages, files.messages_dest),
        copyFile(files.contacts, files.contacts_dest),
    ])
    .then(() => {
        _backupCopied = true
        return files;
    })
    .catch((err) => {
        console.error(err);
        return Promise.reject(new Error('Une erreur est survenue, nous ne pouvons traiter votre sauvegarde'))
    });

}

export function getPhoneNumber(infosFile, prefix) {
    return new Promise((resolve, reject) => {

        let found = false;
        let phoneNumber = '';
        lineReader.eachLine(infosFile, (line) => {
            if(found) {
                phoneNumber = line;
                // return false;
            }

            if(line.trim() === '<key>Phone Number</key>') {
                found = true;
            }
            // return Promise.resolve();
        });
        console.log('phoneNumber', phoneNumber);
        resolve(canonizePhoneNumber(phoneNumber, prefix));
        // if(phoneNumber !== '') {
        //     resolve(canonizePhoneNumber(phoneNumber, prefix));
        // } else {
        //     reject(new Error('Phone number not found'));
        // }
    })
}

const READ_DB_ERROR = 'Nous ne pouvons pas lire cette sauvegarde, elle est chiffrée ou corrompue.';

/**
* Retrieve attachment IDs along messages data
*
* Table: message_attachment_join
*     - message_id    > message.ROWID
*     - attachment_id > attachment.ROWID
*
* @sa https://github.com/t413/SMS-Tools/blob/master/smstools/ios6.py
* @sa https://www.safaribooksonline.com/library/view/hacking-and-securing/9781449325213/ch04s02.html
* @sa http://linuxsleuthing.blogspot.fr/2012/10/whos-texting-ios6-smsdb.html
* @sa http://apple.stackexchange.com/questions/77432/location-of-message-attachments-in-ios-6-backup
* */
export function getMessages(messagesFile) {

    return openDbFile(messagesFile)
    .then(db => queryMessages(db));
}

function queryMessages(db) {
    return new Promise((resolve, reject) => {
        console.log(DB_REQUESTS.getMessages);
        db.all(DB_REQUESTS.getMessages).then(results => {
            console.log('Messages found id DB', results.length);
            const messages = [];

            for(let i = 0; i < results.length; i++) {
                results[i].text = formatSMS(results[i].text);
                if(results[i].text != null && results[i].text.length > 0) {
                    messages.push(results[i]);
                }
            }

            resolve(messages);
        }).catch(err => {
            console.error(err);
            reject(READ_DB_ERROR);
        });
    })
}

export function getContacts(contactsFile, prefix) {

    return openDbFile(contactsFile)
    .then((db) => queryContacts(db, prefix));

}

function queryContacts(db, prefix) {
    return new Promise((resolve, reject) => {

        db.all(DB_REQUESTS.getContacts).then(results => {
            console.log('Contacts found in DB', results.length);
            const contacts = [];

            for(let i = 0; i < results.length; i += 1) {
                const contact = results[i];
                contact.first = formatSMS(contact.first);
                contact.last = formatSMS(contact.last);
                contact.count = 0;
                contact.value = canonizePhoneNumber(contact.value, prefix);
                contacts.push(contact);
            }
            resolve(contacts);
        }).catch(err => {
            console.error(err);
            reject(READ_DB_ERROR);
        });
    })
}

export function getChats(messagesFile, prefix) {

    return openDbFile(messagesFile)
    .then((db) => queryChats(db, prefix));

}

function queryChats(db, prefix) {
    return new Promise((resolve, reject) => {

        db.all(DB_REQUESTS.getChats).then(results => {
            console.log('chat request results', results);
            const chats = [];
            results.forEach(result => {
                let chatEdit = chats.find(chat => chat.id === result.chatId);
                if(!chatEdit) {
                    const chatMessages = results
                        .filter(result2 => result2.chatId === result.chatId)
                        .filter(result2 => result2.text)
                        .map(message => {
                            return {
                                participant: message.isFromMe ? PHONE_OWNER_ID : message.participantNumber ,
                                text: message.text,
                                filename: message.filename,
                                date: message.date,
                            };
                        });
                    const participants = [];
                    chatMessages.forEach(message => {
                        if(!participants.find(participant => participant === message.participant)) {
                            participants.push(message.participant);
                        }
                    })
                    chatEdit = {
                        id: result.chatId,
                        messages: chatMessages,
                        participants,
                    }
                    chats.push(chatEdit);
                }
            });
            let mergedChats = [];
            chats.forEach(chat => {
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
            })
            console.log('Chats found in DB', mergedChats.length, `${chats.length - mergedChats.length} merged chats`);
            resolve(mergedChats);
        }).catch(err => {
            console.error(err);
            reject(READ_DB_ERROR);
        });
    })
}

function openDbFile(dbFile) {
    return sqlite.open(dbFile, {Promise});
    // return new Promise((resolve, reject) => {
    //     Sql.open(dbFile, {}, (err, db) => {
    //         if (err) {
    //             reject(READ_DB_ERROR);
    //         } else {
    //             resolve(db);
    //         }
    //     })
    // });
}

export function loadBackupData(prefix) {

    return getBackupFiles()
    .then((files) => {
        console.log(files);
        if(!_backupCopied) {
            return initBackupCopy(files);
        }
            return files;

    })
    .then((files) =>

        // retrieve phoneNumber, contacts and messages
         Promise.all([
            getPhoneNumber(files.infos_dest, prefix),
            getContacts(files.contacts_dest, prefix),
            getMessages(files.messages_dest),
            getChats(files.messages_dest),
        ])
    )
    .then(result => {
        const phoneNumber = result[0];
        const contacts = result[1];
        const messages = result[2];
        const chats = result[3];

        console.log('Load backup data results', phoneNumber, contacts, messages);

        for(let i = 0; i < contacts.length; ++i) {
            contacts[i].count = 0;
            for(let ii = 0; ii < messages.length; ++ii) {
                const found = messages[ii].value === contacts[i].value;
                if(found) {
                    contacts[i].count++;
                }
            }
        }

        const sortedContacts = contacts
            .filter(c => c.count > 0)
            .sort((a, b) => b.count - a.count);

        const sortedChats = chats
            .filter(chat => chat.messages.length > 0)
            .sort((a, b) => b.messages.length - a.messages.length);

        return {
            phoneNumber,
            contacts: sortedContacts,
            messages,
            chats: sortedChats,
        }
    }).catch(err => {
        console.error(err);
    });
}

function getMessagesFromChatId(chatId) {
    return new Promise((resolve, reject) => {
        getBackupFiles().then(files => {
            openDbFile(files.messages_dest).then(db => {
                // queryMessagesFix(db, chatId);
                // console.log('DB request', `${DB_REQUESTS.getMessagesFix}'${chatId}'`);
                db.all(`${DB_REQUESTS.getMessagesFix}'${chatId}'`).then(results => {
                    console.log('Messages from chat id', results)
                    const messages = [];

                    for(let i = 0; i < results.length; i++) {
                        results[i].text = formatSMS(results[i].text);
                        if(results[i].text != null && results[i].text.length > 0) {
                            messages.push(results[i]);
                        }
                    }
                    // console.log('Messages from getMessagesFix', messages);
                    resolve(messages);
                }).catch(err => {
                    console.error(err);
                    reject(READ_DB_ERROR);
                });
            })
        })
    })
}
