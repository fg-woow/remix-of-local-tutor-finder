import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  "en": {
    "translation": {
      "nav": {
        "home": "Home",
        "tutors": "Find Tutors",
        "login": "Login",
        "signup": "Sign Up",
        "become_tutor": "Become a Tutor",
        "profile": "Profile",
        "messages": "Messages",
        "favorites": "Favorites",
        "logout": "Log out",
        "map_view": "Map View",
        "dashboard": "Dashboard",
        "my_profile": "My Profile"
      },
      "hero": {
        "title": "Find the Perfect Local Tutor",
        "subtitle": "Connect with expert tutors in your neighborhood for personalized face-to-face learning experiences.",
        "search_placeholder": "What do you want to learn?",
        "search_button": "Search Tutors",
        "tagline": "Face-to-face learning made easy",
        "free_browse": "Free to browse"
      },
      "how_it_works": {
        "title": "How Learnnear works",
        "subtitle": "Finding the right tutor has never been easier. Just three simple steps.",
        "step1_title": "Browse Tutors",
        "step1_desc": "Search by subject and location to find qualified tutors in your area.",
        "step2_title": "View Profiles",
        "step2_desc": "Check ratings, reviews, experience, and teaching style before you decide.",
        "step3_title": "Start Learning",
        "step3_desc": "Contact your chosen tutor and schedule your first face-to-face lesson."
      },
      "featured": {
        "title": "Featured Tutors",
        "subtitle": "Highly rated instructors ready to help you succeed",
        "view_all": "View all tutors"
      },
      "cta": {
        "title": "Ready to start learning?",
        "subtitle": "Join thousands of students who found their perfect tutor on Learnnear. Start your learning journey today.",
        "find_tutor": "Find a Tutor",
        "become_tutor": "Become a Tutor"
      },
      "footer": {
        "platform": "Platform",
        "find_tutors": "Find Tutors",
        "map_view": "Map View",
        "about_us": "About Us",
        "contact": "Contact",
        "for_tutors": "For Tutors",
        "become_tutor": "Become a Tutor",
        "tutor_resources": "Tutor Resources",
        "success_stories": "Success Stories",
        "legal": "Legal",
        "privacy_policy": "Privacy Policy",
        "terms_of_service": "Terms of Service",
        "rights_reserved": "All rights reserved."
      },
      "signup": {
        "title": "Create an Account",
        "subtitle": "Join our community of learners and educators",
        "student_role": "Student",
        "student_desc": "I want to find a tutor and learn",
        "tutor_role": "Tutor",
        "tutor_desc": "I want to teach and earn money",
        "parent_role": "Parent",
        "parent_desc": "I want to find tutors for my children",
        "full_name": "Full Name",
        "email": "Email Address",
        "password": "Password",
        "create_account": "Create Account",
        "already_have_account": "Already have an account?",
        "login": "Sign in"
      },
      "map": {
        "title": "Map View",
        "subtitle": "Find tutors in your local area",
        "find_tutors_area": "Tutors near you",
        "search_location": "Search location..."
      },
      "dashboard": {
        "title": "Parent Dashboard",
        "welcome": "Welcome back",
        "my_students": "My Students",
        "upcoming_lessons": "Upcoming Lessons",
        "find_tutors": "Find Tutors",
        "no_lessons": "No upcoming lessons scheduled."
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
  "tr": {
    "translation": {
      "nav": {
        "home": "Ana Sayfa",
        "tutors": "Eğitmen Bul",
        "login": "Giriş Yap",
        "signup": "Kayıt Ol",
        "become_tutor": "Eğitmen Ol",
        "profile": "Profil",
        "messages": "Mesajlar",
        "favorites": "Favoriler",
        "logout": "Çıkış Yap",
        "map_view": "Harita Görünümü",
        "dashboard": "Kontrol Paneli",
        "my_profile": "Profilim"
      },
      "hero": {
        "title": "Mükemmel Yerel Eğitmeni Bulun",
        "subtitle": "Kişiselleştirilmiş yüz yüze öğrenim deneyimleri için bölgenizdeki uzman eğitmenlerle bağlantı kurun.",
        "search_placeholder": "Ne öğrenmek istiyorsunuz?",
        "search_button": "Eğitmen Ara",
        "tagline": "Yüz yüze öğrenim artık çok kolay",
        "free_browse": "Göz atmak ücretsiz"
      },
      "how_it_works": {
        "title": "Learnnear Nasıl Çalışır",
        "subtitle": "Doğru eğitmeni bulmak hiç bu kadar kolay olmamıştı. Sadece üç basit adım.",
        "step1_title": "Eğitmenleri İncele",
        "step1_desc": "Bölgenizdeki uzman eğitmenleri bulmak için konuya ve konuma göre arama yapın.",
        "step2_title": "Profilleri Gör",
        "step2_desc": "Karar vermeden önce derecelendirmeleri, yorumları ve öğretim tarzını kontrol edin.",
        "step3_title": "Öğrenmeye Başla",
        "step3_desc": "Seçtiğiniz eğitmenle iletişime geçin ve ilk yüz yüze dersinizi planlayın."
      },
      "featured": {
        "title": "Öne Çıkan Eğitmenler",
        "subtitle": "Başarılı olmanıza yardımcı olmaya hazır yüksek puanlı eğitmenler",
        "view_all": "Tüm Eğitmenleri Gör"
      },
      "cta": {
        "title": "Öğrenmeye hazır mısınız?",
        "subtitle": "Learnnear'da mükemmel eğitmenini bulan binlerce öğrenciye katılın. Öğrenme yolculuğunuza bugün başlayın.",
        "find_tutor": "Eğitmen Bul",
        "become_tutor": "Eğitmen Ol"
      },
      "footer": {
        "platform": "Platform",
        "find_tutors": "Eğitmen Bul",
        "map_view": "Harita Görünümü",
        "about_us": "Hakkımızda",
        "contact": "İletişim",
        "for_tutors": "Eğitmenler İçin",
        "become_tutor": "Eğitmen Ol",
        "tutor_resources": "Eğitmen Kaynakları",
        "success_stories": "Başarı Hikayeleri",
        "legal": "Yasal",
        "privacy_policy": "Gizlilik Politikası",
        "terms_of_service": "Hizmet Şartları",
        "rights_reserved": "Tüm hakları saklıdır."
      },
      "signup": {
        "title": "Hesap Oluştur",
        "subtitle": "Öğrenenler ve eğiticiler topluluğumuza katılın",
        "student_role": "Öğrenci",
        "student_desc": "Bir eğitmen bulmak ve öğrenmek istiyorum",
        "tutor_role": "Eğitmen",
        "tutor_desc": "Ders vermek ve para kazanmak istiyorum",
        "parent_role": "Veli",
        "parent_desc": "Çocuklarım için eğitmen bulmak istiyorum",
        "full_name": "Ad Soyad",
        "email": "E-posta Adresi",
        "password": "Şifre",
        "create_account": "Hesap Oluştur",
        "already_have_account": "Zaten hesabınız var mı?",
        "login": "Giriş yapın"
      },
      "map": {
        "title": "Harita Görünümü",
        "subtitle": "Bölgenizdeki eğitmenleri bulun",
        "find_tutors_area": "Yakınınızdaki Eğitmenler",
        "search_location": "Konum ara..."
      },
      "dashboard": {
        "title": "Veli Kontrol Paneli",
        "welcome": "Tekrar hoş geldiniz",
        "my_students": "Öğrencilerim",
        "upcoming_lessons": "Yaklaşan Dersler",
        "find_tutors": "Eğitmen Bul",
        "no_lessons": "Planlanmış ders bulunmuyor."
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
  "sp": {
    "translation": {
      "nav": {
        "home": "Inicio",
        "tutors": "Buscar Tutores",
        "login": "Iniciar Sesión",
        "signup": "Registrarse",
        "become_tutor": "Ser Tutor",
        "profile": "Perfil",
        "messages": "Mensajes",
        "favorites": "Favoritos",
        "logout": "Cerrar Sesión",
        "map_view": "Vista del Mapa",
        "dashboard": "Panel",
        "my_profile": "Mi Perfil"
      },
      "hero": {
        "title": "Encuentra el Tutor Local Perfecto",
        "subtitle": "Conéctate con tutores expertos en tu vecindario para experiencias de aprendizaje presenciales.",
        "search_placeholder": "¿Qué quieres aprender?",
        "search_button": "Buscar Tutores",
        "tagline": "Aprendizaje presencial hecho fácil",
        "free_browse": "Navegación gratuita"
      },
      "how_it_works": {
        "title": "Cómo funciona Learnnear",
        "subtitle": "Encontrar el tutor adecuado nunca ha sido tan fácil. Sólo tres simples pasos.",
        "step1_title": "Buscar Tutores",
        "step1_desc": "Busca por materia y ubicación para encontrar tutores calificados en tu área.",
        "step2_title": "Ver Perfiles",
        "step2_desc": "Consulta calificaciones, reseñas, experiencia y estilo de enseñanza antes de decidir.",
        "step3_title": "Empezar a Aprender",
        "step3_desc": "Contacta a tu tutor elegido y programa tu primera lección presencial."
      },
      "featured": {
        "title": "Tutores Destacados",
        "subtitle": "Instructores altamente calificados listos para ayudarte a tener éxito",
        "view_all": "Ver todos los tutores"
      },
      "cta": {
        "title": "¿Listo para empezar a aprender?",
        "subtitle": "Únete a miles de estudiantes que encontraron a su tutor perfecto en Learnnear. Comienza tu viaje de aprendizaje hoy.",
        "find_tutor": "Encontrar un Tutor",
        "become_tutor": "Ser un Tutor"
      },
      "footer": {
        "platform": "Plataforma",
        "find_tutors": "Buscar Tutores",
        "map_view": "Vista del Mapa",
        "about_us": "Sobre Nosotros",
        "contact": "Contacto",
        "for_tutors": "Para Tutores",
        "become_tutor": "Ser Tutor",
        "tutor_resources": "Recursos para Tutores",
        "success_stories": "Historias de Éxito",
        "legal": "Legal",
        "privacy_policy": "Política de Privacidad",
        "terms_of_service": "Términos de Servicio",
        "rights_reserved": "Todos los derechos reservados."
      },
      "signup": {
        "title": "Crear una Cuenta",
        "subtitle": "Únete a nuestra comunidad de estudiantes y educadores",
        "student_role": "Estudiante",
        "student_desc": "Quiero encontrar un tutor y aprender",
        "tutor_role": "Tutor",
        "tutor_desc": "Quiero enseñar y ganar dinero",
        "parent_role": "Padre",
        "parent_desc": "Quiero encontrar tutores para mis hijos",
        "full_name": "Nombre Completo",
        "email": "Correo Electrónico",
        "password": "Contraseña",
        "create_account": "Crear Cuenta",
        "already_have_account": "¿Ya tienes una cuenta?",
        "login": "Iniciar sesión"
      },
      "map": {
        "title": "Vista del Mapa",
        "subtitle": "Encuentra tutores en tu área local",
        "find_tutors_area": "Tutores cerca de ti",
        "search_location": "Buscar ubicación..."
      },
      "dashboard": {
        "title": "Panel de Padres",
        "welcome": "Bienvenido de nuevo",
        "my_students": "Mis Estudiantes",
        "upcoming_lessons": "Próximas Lecciones",
        "find_tutors": "Buscar Tutores",
        "no_lessons": "No hay lecciones programadas."
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
  "it": {
    "translation": {
      "nav": {
        "home": "Home",
        "tutors": "Trova Tutor",
        "login": "Accedi",
        "signup": "Iscriviti",
        "become_tutor": "Diventa Tutor",
        "profile": "Profilo",
        "messages": "Messaggi",
        "favorites": "Preferiti",
        "logout": "Esci",
        "map_view": "Mappa",
        "dashboard": "Pannello",
        "my_profile": "Mio Profilo"
      },
      "hero": {
        "title": "Trova il Tutor Locale Perfetto",
        "subtitle": "Connettiti con tutor esperti nel tuo quartiere per esperienze di apprendimento personalizzate.",
        "search_placeholder": "Cosa vuoi imparare?",
        "search_button": "Cerca Tutor",
        "tagline": "Apprendimento in presenza reso facile",
        "free_browse": "Navigazione gratuita"
      },
      "how_it_works": {
        "title": "Come funziona Learnnear",
        "subtitle": "Trovare il tutor giusto non è mai stato così facile. Solo tre semplici passi.",
        "step1_title": "Cerca Tutor",
        "step1_desc": "Cerca per materia e luogo per trovare tutor qualificati nella tua zona.",
        "step2_title": "Vedi Profili",
        "step2_desc": "Controlla valutazioni, recensioni, esperienza e stile di insegnamento.",
        "step3_title": "Inizia a Imparare",
        "step3_desc": "Contatta il tuo tutor scelto e programma la tua prima lezione."
      },
      "featured": {
        "title": "Tutor in Evidenza",
        "subtitle": "Insegnanti molto apprezzati pronti ad aiutarti",
        "view_all": "Vedi tutti i tutor"
      },
      "cta": {
        "title": "Pronto per iniziare?",
        "subtitle": "Unisciti a migliaia di studenti che hanno trovato il loro tutor perfetto.",
        "find_tutor": "Trova un Tutor",
        "become_tutor": "Diventa Tutor"
      },
      "footer": {
        "platform": "Piattaforma",
        "find_tutors": "Trova Tutor",
        "map_view": "Mappa",
        "about_us": "Chi Siamo",
        "contact": "Contatti",
        "for_tutors": "Per Tutor",
        "become_tutor": "Diventa Tutor",
        "tutor_resources": "Risorse per Tutor",
        "success_stories": "Storie di Successo",
        "legal": "Legale",
        "privacy_policy": "Privacy Policy",
        "terms_of_service": "Termini di Servizio",
        "rights_reserved": "Tutti i diritti riservati."
      },
      "signup": {
        "title": "Crea un Account",
        "subtitle": "Unisciti alla nostra comunità",
        "student_role": "Studente",
        "student_desc": "Voglio trovare un tutor e imparare",
        "tutor_role": "Tutor",
        "tutor_desc": "Voglio insegnare e guadagnare",
        "parent_role": "Genitore",
        "parent_desc": "Voglio trovare tutor per i miei figli",
        "full_name": "Nome Completo",
        "email": "Indirizzo Email",
        "password": "Password",
        "create_account": "Crea Account",
        "already_have_account": "Hai già un account?",
        "login": "Accedi"
      },
      "map": {
        "title": "Mappa",
        "subtitle": "Trova tutor nella tua zona",
        "find_tutors_area": "Tutor vicino a te",
        "search_location": "Cerca località..."
      },
      "dashboard": {
        "title": "Pannello Genitori",
        "welcome": "Bentornato",
        "my_students": "I Miei Studenti",
        "upcoming_lessons": "Prossime Lezioni",
        "find_tutors": "Trova Tutor",
        "no_lessons": "Nessuna lezione programmata."
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
