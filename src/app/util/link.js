import {shell} from 'electron';


export function openExternalLink(link) {
	console.log('Go to ', link);
    shell.openExternal(link);
}
