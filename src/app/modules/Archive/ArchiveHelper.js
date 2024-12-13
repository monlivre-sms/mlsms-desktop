import os from 'os';
import fs from 'fs';
import path from 'path';
import ncp from 'ncp';


function getUserHome() {
    let userHome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    if(userHome === '\\') {
        userHome =path.resolve("");
        return userHome.substr(0, userHome.indexOf("AppData"));
    }
    return userHome;
};

export function getPlatformDirectories() {
    const platform = os.platform();
    console.log('Platform', platform);
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
    console.log('Platform directories', directories);
    return Promise.resolve(directories);
}

/**
* Checks whether we are having an ios10backup or not
* @param directory
*/
export function isIos10Backup(directory) {

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
export function prefixedFileName(isIos10Backup, fileName) {
    return isIos10Backup === true ? path.join(fileName.substr(0, 2), fileName) : fileName;
}

export function getDBFiles(directory) {
    console.log('Directory selected:', directory);
    return {
        sources: {
            'messages': path.join(directory, prefixedFileName(isIos10Backup(directory), '3d0d7e5fb2ce288813306e4d4636395e047a3d28')),
            'contacts': path.join(directory, prefixedFileName(isIos10Backup(directory), '31bb7ba8914766d4ba40d6dfb6113c8b614be442')),
            'infos': path.join(directory, 'Info.plist'),
        },
        destination: {
            'messages': path.join(os.tmpdir(), 'messages.sqlite'),
            'contacts': path.join(os.tmpdir(), 'contacts.sqlite'),
            'infos': path.join(os.tmpdir(), 'Info.plist'),
        },
    }
}

export function copyFile(source, target) {
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
