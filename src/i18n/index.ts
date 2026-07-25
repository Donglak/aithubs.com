import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "../locales/en/common.json";
import enChatbot from "../locales/en/chatbot.json";
import enNavigation from "../locales/en/navigation.json";
import enHome from "../locales/en/home.json";
import enProduct from "../locales/en/product.json";

import viCommon from "../locales/vi/common.json";
import viChatbot from "../locales/vi/chatbot.json";
import viNavigation from "../locales/vi/navigation.json";
import viHome from "../locales/vi/home.json";
import viProduct from "../locales/vi/product.json";

const resources = {
  en: {
    common: enCommon,
    chatbot: enChatbot,
    navigation: enNavigation,
    home: enHome,
    product: enProduct,
  },
  vi: {
    common: viCommon,
    chatbot: viChatbot,
    navigation: viNavigation,
    home: viHome,
    product: viProduct,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "vi"],
    ns: ["common", "chatbot", "navigation", "home", "product"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "aithubs_language",
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.resolvedLanguage || "en";

export default i18n;
