import { localizationData, defaultLanguage, enabledLanguages } from '../../Intl/setup';
import { setDateLanguage } from '../../util/date';

// Export Constants
export const SWITCH_LANGUAGE = 'SWITCH_LANGUAGE';


export function initLanguage(lang = null, user = null, store = null) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            if(!lang) {
                if(store && store.intl && store.intl.isInit) {
                    lang = store.intl.locale;
                } else if(global.navigator && global.navigator.language) {
                    const navigatorLanguage = global.navigator.language.split('-')[0];
                    lang = navigatorLanguage;
                }
                // const initLocale = global.navigator && global.navigator.language || 'en';
            }
            if(enabledLanguages.indexOf(lang) === -1) {
                // console.log('lang not enabled!', lang);
                lang = defaultLanguage;
            }
            dispatch(switchLanguage(lang));
            // console.log('Lang set', lang);
            resolve(lang);
        });
    };
}

export function getEnabledLanguages() {
    return enabledLanguages;
}

export function getCountryFromLanguage(lang) {
    switch(lang) {
        case 'en':
            return 'GB';

        default:
            return lang && lang.toUpperCase();
    }
}

export function getPrefixFromLanguage(lang) {
    switch(lang) {
        case 'fr':
            return '+33';

        case 'it':
            return '+39';

        case 'en':
            return '+44';

        default:
            return '';
    }
}

export function getTranslation(model, field, lang) {
    if(lang !== 'fr' && model.translations) {
        const translation = model.translations.find(translation => translation.lang === lang);
        if(translation && translation[field]) {
            return translation[field];
        }
    }
    return model[field];
}

export function switchLanguage(newLang) {
    console.log(localizationData[newLang])
    if(newLang && localizationData[newLang]) {
        setDateLanguage(newLang);

        return {
            type: SWITCH_LANGUAGE,
            ...localizationData[newLang],
            isInit: true,
        };
    }
    return {
        type: SWITCH_LANGUAGE,
        ...localizationData[defaultLanguage],
    };
}
