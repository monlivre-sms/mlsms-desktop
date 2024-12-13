
import { getPrefixFromLanguage } from '../Intl/IntlActions';

import { getDb } from '../../util/sqllitedb';
import { encode, canonizePhoneNumber } from '../../util/text';

// Actions
export const SET_CONTACTS = 'SET_CONTACTS';

// CONSTANTS
export const REQUEST_GET_CONTACTS = "SELECT p.First AS first, p.Last AS last, v.value AS number FROM ABPerson p INNER JOIN ABMultiValue v ON p.ROWID = v.record_id WHERE v.property = 3 AND NOT (p.First == '' AND p.Last == '') GROUP BY v.value ORDER BY v.value ASC";

export function getContactsRequest(contactsDbFile, locale) {
    return dispatch => {
        return getDb(contactsDbFile).then(db => {
            return db.all(REQUEST_GET_CONTACTS).then(results => {
                const contacts = results.map(result => {
                    return {
                        first: result.first, // encode(result.first),
                        last: result.last, // encode(result.last),
                        participantNumber: canonizePhoneNumber(result.number, getPrefixFromLanguage(locale)),
                    }
                })
                dispatch(setContacts(contacts))
                return contacts;
            })
        });
    }
}


// GETTERS
export function getContacts(store) {
    return store.contacts.data;
}

// DISPATCHERS
export function setContacts(contacts) {
    return {
        type: SET_CONTACTS,
        contacts,
    }
}
