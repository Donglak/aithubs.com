import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");

  const changeLanguage = (lng: "en" | "vi") => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-900">
      <span className="sr-only">{t("language.switchLabel")}</span>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          i18n.language.startsWith("en")
            ? "bg-primary-600 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("vi")}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          i18n.language.startsWith("vi")
            ? "bg-primary-600 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        VI
      </button>
    </div>
  );
}
