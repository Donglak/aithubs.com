import React from "react";
import { LanguageProvider } from "./LanguageProvider";
import useLanguage from "./useLanguage";
import languages from "./languages.json";

const Website = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const content = languages.find((l) => l.lang === language).translation;

  return (
    <div>
      <h1>{content.header}</h1>
      <p>{content.about}</p>
      <button onClick={() => handleLanguageChange("en")}>
        English
      </button>
      <button onClick={() => handleLanguageChange("vi")}>
        Vietnamese
      </button>
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <Website />
    </LanguageProvider>
  );
};

export default App;
