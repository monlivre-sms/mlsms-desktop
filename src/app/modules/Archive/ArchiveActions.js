import fs from 'fs';

import { getPlatformDirectories, copyFile, getDBFiles } from './ArchiveHelper';
import { addError } from '../Error/ErrorActions';

// ACTIONS
export const SET_ARCHIVES = 'SET_ARCHIVES';
export const SET_ARCHIVE_SELECTION = 'SET_ARCHIVE_SELECTION';
export const SET_DB_FILES = 'SET_DB_FILES';

const ARCHIVE_MIN_ID_LENGTH = 20;

export function checkArchivesRequest() {
    return dispatch => {
        return getPlatformDirectories().then((directories) => {
            const archives = [];
            directories
                .filter(directory => !directory.includes('DS_Store') && fs.existsSync(directory))
                .forEach(directory => {
                    (fs.readdirSync(directory) || [])
                        .filter(device => !device.includes('DS_Store') && device.length >= ARCHIVE_MIN_ID_LENGTH)
                        .forEach(device => {
                            console.log(device);
                            const isItunesArchive = !!(fs.readdirSync(`${directory}/${device}`) || []).filter(file => file.includes('Info.plist') || file.includes('31') || file.includes('3d')).length;
                            isItunesArchive && archives.push({
                                path: `${directory}${device}`,
                                date: fs.statSync(`${directory}${device}`)?.mtime?.getTime() || '',
                            })
                        });
                });

            console.log('archives', archives);
            dispatch(setArchives(archives));
            return archives;

        }).catch(err => {
			console.error(err);
            // dispatch(addError(err));
            return null;
        });
    }
}

export function selectArchiveRequest(archive) {
    return dispatch => {
        const files = getDBFiles(archive.path);
		console.log('selectArchiveRequest: files', files);
        return Promise.all([
            copyFile(files.sources.infos, files.destination.infos),
            copyFile(files.sources.messages, files.destination.messages),
            copyFile(files.sources.contacts, files.destination.contacts),
        ]).then(() => {
			console.log('Copy finished');
            dispatch(setArchiveSelection(archive));
            dispatch(setArchiveDBFiles(files));
            return files;
        }).catch((err) => {
            console.error(err);
            dispatch(addError(err));
            return null;
        });
    }
}

// GETTERS
export function getArchives(store) {
    return store.archives.data;
}

export function getSelectedArchive(store) {
    return store.archives.selection;
}

export function getDestinationFiles(store) {
    return (store.archives.dbFiles || {}).destination || null;
}


// DISPATCHERS
export function setArchives(archives) {
    return {
        type: SET_ARCHIVES,
        archives,
    }
}

export function setArchiveSelection(archive) {
    return {
        type: SET_ARCHIVE_SELECTION,
        archive,
    }
}

export function setArchiveDBFiles(files) {
    return {
        type: SET_DB_FILES,
        files,
    }
}
