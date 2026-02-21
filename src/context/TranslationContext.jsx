import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        // Fallback to local translation dictionary
        if (translations[language] && translations[language][key]) {
            return translations[language][key];
        }
        return key;
    };

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    };

    return (
        <TranslationContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => useContext(TranslationContext);
