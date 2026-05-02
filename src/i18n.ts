import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "tutors": "Find Tutors",
        "login": "Login",
        "signup": "Sign Up",
        "become_tutor": "Become a Tutor",
        "profile": "Profile",
        "messages": "Messages",
        "favorites": "Favorites",
        "logout": "Log out"
      },
      "hero": {
        "title": "Find the Perfect Local Tutor",
        "subtitle": "Connect with expert tutors in your neighborhood for personalized face-to-face learning experiences.",
        "search_placeholder": "What do you want to learn?",
        "search_button": "Search Tutors"
      },
      "features": {
        "verified": "Verified Tutors",
        "verified_desc": "All our tutors undergo background checks and credentials verification.",
        "local": "Local Connections",
        "local_desc": "Find tutors near you for convenient face-to-face learning.",
        "flexible": "Flexible Scheduling",
        "flexible_desc": "Book lessons at times that work best for your schedule.",
        "secure": "Secure Payments",
        "secure_desc": "Pay safely through our platform with a money-back guarantee."
      },
      "tutors": {
        "title": "Find Your Perfect Tutor",
        "search_placeholder": "Search subjects or tutor names...",
        "filters": "Filters",
        "no_results": "No tutors found matching your criteria",
        "no_results_desc": "Try adjusting your filters or search terms."
      }
    }
  },
  tr: {
    translation: {
      "nav": {
        "home": "Ana Sayfa",
        "tutors": "Eğitmen Bul",
        "login": "Giriş Yap",
        "signup": "Kayıt Ol",
        "become_tutor": "Eğitmen Ol",
        "profile": "Profil",
        "messages": "Mesajlar",
        "favorites": "Favoriler",
        "logout": "Çıkış Yap"
      },
      "hero": {
        "title": "Mükemmel Yerel Eğitmeni Bulun",
        "subtitle": "Kişiselleştirilmiş yüz yüze öğrenim deneyimleri için bölgenizdeki uzman eğitmenlerle bağlantı kurun.",
        "search_placeholder": "Ne öğrenmek istiyorsunuz?",
        "search_button": "Eğitmen Ara"
      },
      "features": {
        "verified": "Onaylı Eğitmenler",
        "verified_desc": "Tüm eğitmenlerimiz geçmiş kontrolünden ve belge doğrulamasından geçmektedir.",
        "local": "Yerel Bağlantılar",
        "local_desc": "Yüz yüze kolay öğrenim için yakınınızdaki eğitmenleri bulun.",
        "flexible": "Esnek Planlama",
        "flexible_desc": "Programınıza en uygun saatlerde ders rezervasyonu yapın.",
        "secure": "Güvenli Ödeme",
        "secure_desc": "Platformumuz üzerinden para iade garantili güvenli ödeme yapın."
      },
      "tutors": {
        "title": "Mükemmel Eğitmeninize Ulaşın",
        "search_placeholder": "Konu veya eğitmen adı arayın...",
        "filters": "Filtreler",
        "no_results": "Kriterlerinize uygun eğitmen bulunamadı",
        "no_results_desc": "Filtrelerinizi veya arama terimlerinizi değiştirmeyi deneyin."
      }
    }
  },
  sp: {
    translation: {
      "nav": {
        "home": "Inicio",
        "tutors": "Buscar Tutores",
        "login": "Iniciar Sesión",
        "signup": "Registrarse",
        "become_tutor": "Ser Tutor",
        "profile": "Perfil",
        "messages": "Mensajes",
        "favorites": "Favoritos",
        "logout": "Cerrar Sesión"
      },
      "hero": {
        "title": "Encuentra el Tutor Local Perfecto",
        "subtitle": "Conéctate con tutores expertos en tu vecindario para experiencias de aprendizaje presenciales.",
        "search_placeholder": "¿Qué quieres aprender?",
        "search_button": "Buscar Tutores"
      },
      "features": {
        "verified": "Tutores Verificados",
        "verified_desc": "Todos nuestros tutores pasan por verificación de antecedentes.",
        "local": "Conexiones Locales",
        "local_desc": "Encuentra tutores cerca de ti para un aprendizaje conveniente.",
        "flexible": "Horario Flexible",
        "flexible_desc": "Reserva clases en los horarios que mejor se adapten a ti.",
        "secure": "Pagos Seguros",
        "secure_desc": "Paga de forma segura con nuestra garantía de devolución."
      },
      "tutors": {
        "title": "Encuentra Tu Tutor Perfecto",
        "search_placeholder": "Busca materias o nombres...",
        "filters": "Filtros",
        "no_results": "No se encontraron tutores",
        "no_results_desc": "Intenta ajustar tus filtros o términos de búsqueda."
      }
    }
  },
  it: {
    translation: {
      "nav": {
        "home": "Home",
        "tutors": "Trova Tutor",
        "login": "Accedi",
        "signup": "Iscriviti",
        "become_tutor": "Diventa Tutor",
        "profile": "Profilo",
        "messages": "Messaggi",
        "favorites": "Preferiti",
        "logout": "Esci"
      },
      "hero": {
        "title": "Trova il Tutor Locale Perfetto",
        "subtitle": "Connettiti con tutor esperti nel tuo quartiere per esperienze di apprendimento personalizzate.",
        "search_placeholder": "Cosa vuoi imparare?",
        "search_button": "Cerca Tutor"
      },
      "features": {
        "verified": "Tutor Verificati",
        "verified_desc": "Tutti i nostri tutor sono sottoposti a controlli dei precedenti.",
        "local": "Connessioni Locali",
        "local_desc": "Trova tutor vicino a te per un apprendimento conveniente.",
        "flexible": "Orari Flessibili",
        "flexible_desc": "Prenota lezioni negli orari che preferisci.",
        "secure": "Pagamenti Sicuri",
        "secure_desc": "Paga in modo sicuro attraverso la nostra piattaforma."
      },
      "tutors": {
        "title": "Trova il Tuo Tutor Perfetto",
        "search_placeholder": "Cerca materie o nomi...",
        "filters": "Filtri",
        "no_results": "Nessun tutor trovato",
        "no_results_desc": "Prova a modificare i filtri o i termini di ricerca."
      }
    }
  },
  zh: {
    translation: {
      "nav": {
        "home": "首页",
        "tutors": "寻找家教",
        "login": "登录",
        "signup": "注册",
        "become_tutor": "成为家教",
        "profile": "个人资料",
        "messages": "消息",
        "favorites": "收藏",
        "logout": "退出登录"
      },
      "hero": {
        "title": "找到完美的本地家教",
        "subtitle": "联系您附近社区的专业家教，获取个性化的面对面学习体验。",
        "search_placeholder": "你想学什么？",
        "search_button": "搜索家教"
      },
      "features": {
        "verified": "认证家教",
        "verified_desc": "我们所有的家教都经过背景调查和资质验证。",
        "local": "本地连接",
        "local_desc": "寻找附近的家教，方便面对面学习。",
        "flexible": "灵活安排",
        "flexible_desc": "在最适合您的时间预约课程。",
        "secure": "安全支付",
        "secure_desc": "通过我们的平台安全支付，提供退款保证。"
      },
      "tutors": {
        "title": "找到你的完美家教",
        "search_placeholder": "搜索科目或姓名...",
        "filters": "筛选",
        "no_results": "未找到符合条件的家教",
        "no_results_desc": "请尝试调整您的筛选条件或搜索词。"
      }
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
      escapeValue: false,
    }
  });

export default i18n;
