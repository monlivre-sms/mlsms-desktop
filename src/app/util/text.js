// import slug from 'slug';
import iconv from 'iconv-lite';
// import copy from 'copy-to-clipboard';

export function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

// export function slugify(string) {
//     return string ? slug(string) : '';
// }

// export function copyToClipboard(text) {
//     return copy(text);
// }

export function textToColor(str) {
    str = `${str}`;
    let hash = 0;
    for(let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for(let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += (`00${value.toString(16)}`).substr(-2);
    }
    return color;
}

// from: https://gist.github.com/kongchen/941a652882d89bb96f87
export function utf8To16(input) {
    const _escape = (s) => {
        function q(c) {
            const e = c.charCodeAt();
            return `%${(e < 16 ? '0' : '')}${e.toString(16).toUpperCase()}`;
        }
        return s.replace(/[\x00-),:-?[-^`{-\xFF]/g, q);
    };
    try {
        return decodeURIComponent(_escape(input));
    } catch (URIError) {
        // include invalid character, cannot convert
        return input;
    }
}


export function encode(text, encodage = 'utf8') {
    if(text == null) {
        return text;
    }
    console.log(text, `to ${encodage}`, iconv.decode(text.trim(), encodage));
    return iconv.decode(text.trim(), encodage);
};


export function canonizePhoneNumber(number, prefix) {
    number = `${number}`.trim();
    number = number.replace(/[^\+0-9]/g, '');
    if(number.substr(0, 2) == '00') {
        number = `+${  number.substr(2)}`;
    }
    if(number.charAt(0) == '+') {
        return number;
    }
    if(number.charAt(0) == '0' && prefix != '+39') {
        number = number.substr(1);
    }
    return `${`${parseFloat(number)}` === number && number.length >= 8 ? prefix : ''}${number}`;
};
