import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('pjm_lang') || 'id';
    });

    useEffect(() => {
        localStorage.setItem('pjm_lang', language);
    }, [language]);

    /**
     * Translates a given key path into the current active language string.
     * Supports replacements like {count}, {storeName}, {year}, etc.
     * 
     * @param {string} key - e.g. "header.notifications" or "footer.copyright"
     * @param {object} replacements - optional object containing replacement values
     * @returns {string} translated text
     */
    const t = (key, replacements = {}) => {
        const keys = key.split('.');
        let translationObj = translations[language];
        
        for (const k of keys) {
            if (translationObj && translationObj[k] !== undefined) {
                translationObj = translationObj[k];
            } else {
                // Fallback to 'id' if key doesn't exist in current language
                let fallbackObj = translations['id'];
                for (const fk of keys) {
                    if (fallbackObj && fallbackObj[fk] !== undefined) {
                        fallbackObj = fallbackObj[fk];
                    } else {
                        fallbackObj = null;
                        break;
                    }
                }
                return fallbackObj !== null ? fallbackObj : key;
            }
        }

        if (typeof translationObj === 'string') {
            let result = translationObj;
            Object.keys(replacements).forEach((placeholder) => {
                result = result.replace(`{${placeholder}}`, replacements[placeholder]);
            });
            return result;
        }

        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
