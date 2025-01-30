import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

//Import all translation files
import english from "@ly_translations/root/translation.json";
import french from "@ly_translations/fr/translation.json";

//---Using translation
 const resources = {
     en: {
         translation: english,
     },

     fr: {
         translation: french,
     },
 }


i18next
.use(LanguageDetector)
.use(initReactI18next)
.init({
  resources,
  detection: { order: ["path", "navigator"] },
  fallbackLng: "en",
});

export default i18next;