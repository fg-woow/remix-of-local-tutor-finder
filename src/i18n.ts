import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "language": "Language",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode",
      "home": "Home",
      "tutors": "Find Tutors",
      "login": "Login",
      "signup": "Sign Up",
      "become_tutor": "Become a Tutor",
      // We will add more translations gradually as needed
    }
  },
  tr: {
    translation: {
      "language": "Dil",
      "dark_mode": "Karanlık Mod",
      "light_mode": "Aydınlık Mod",
      "home": "Ana Sayfa",
      "tutors": "Eğitmen Bul",
      "login": "Giriş Yap",
      "signup": "Kayıt Ol",
      "become_tutor": "Eğitmen Ol",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
