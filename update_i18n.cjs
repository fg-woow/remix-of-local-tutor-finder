const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
  en: {
    nav: { map_view: 'Map View', dashboard: 'Dashboard', my_profile: 'My Profile' },
    hero: { tagline: 'Face-to-face learning made easy', free_browse: 'Free to browse' },
    how_it_works: {
      title: 'How Learnnear works',
      subtitle: 'Finding the right tutor has never been easier. Just three simple steps.',
      step1_title: 'Browse Tutors', step1_desc: 'Search by subject and location to find qualified tutors in your area.',
      step2_title: 'View Profiles', step2_desc: 'Check ratings, reviews, experience, and teaching style before you decide.',
      step3_title: 'Start Learning', step3_desc: 'Contact your chosen tutor and schedule your first face-to-face lesson.'
    },
    featured: { title: 'Featured Tutors', subtitle: 'Highly rated instructors ready to help you succeed', view_all: 'View all tutors' },
    cta: { title: 'Ready to start learning?', subtitle: 'Join thousands of students who found their perfect tutor on Learnnear. Start your learning journey today.', find_tutor: 'Find a Tutor', become_tutor: 'Become a Tutor' },
    footer: { platform: 'Platform', find_tutors: 'Find Tutors', map_view: 'Map View', about_us: 'About Us', contact: 'Contact', for_tutors: 'For Tutors', become_tutor: 'Become a Tutor', tutor_resources: 'Tutor Resources', success_stories: 'Success Stories', legal: 'Legal', privacy_policy: 'Privacy Policy', terms_of_service: 'Terms of Service', rights_reserved: 'All rights reserved.' }
  },
  tr: {
    nav: { map_view: 'Harita Görünümü', dashboard: 'Kontrol Paneli', my_profile: 'Profilim' },
    hero: { tagline: 'Yüz yüze öğrenim artık çok kolay', free_browse: 'Göz atmak ücretsiz' },
    how_it_works: {
      title: 'Learnnear Nasıl Çalışır',
      subtitle: 'Doğru eğitmeni bulmak hiç bu kadar kolay olmamıştı. Sadece üç basit adım.',
      step1_title: 'Eğitmenleri İncele', step1_desc: 'Bölgenizdeki uzman eğitmenleri bulmak için konuya ve konuma göre arama yapın.',
      step2_title: 'Profilleri Gör', step2_desc: 'Karar vermeden önce derecelendirmeleri, yorumları ve öğretim tarzını kontrol edin.',
      step3_title: 'Öğrenmeye Başla', step3_desc: 'Seçtiğiniz eğitmenle iletişime geçin ve ilk yüz yüze dersinizi planlayın.'
    },
    featured: { title: 'Öne Çıkan Eğitmenler', subtitle: 'Başarılı olmanıza yardımcı olmaya hazır yüksek puanlı eğitmenler', view_all: 'Tüm Eğitmenleri Gör' },
    cta: { title: 'Öğrenmeye hazır mısınız?', subtitle: "Learnnear'da mükemmel eğitmenini bulan binlerce öğrenciye katılın. Öğrenme yolculuğunuza bugün başlayın.", find_tutor: 'Eğitmen Bul', become_tutor: 'Eğitmen Ol' },
    footer: { platform: 'Platform', find_tutors: 'Eğitmen Bul', map_view: 'Harita Görünümü', about_us: 'Hakkımızda', contact: 'İletişim', for_tutors: 'Eğitmenler İçin', become_tutor: 'Eğitmen Ol', tutor_resources: 'Eğitmen Kaynakları', success_stories: 'Başarı Hikayeleri', legal: 'Yasal', privacy_policy: 'Gizlilik Politikası', terms_of_service: 'Hizmet Şartları', rights_reserved: 'Tüm hakları saklıdır.' }
  },
  sp: {
    nav: { map_view: 'Vista del Mapa', dashboard: 'Panel', my_profile: 'Mi Perfil' },
    hero: { tagline: 'Aprendizaje presencial hecho fácil', free_browse: 'Navegación gratuita' },
    how_it_works: {
      title: 'Cómo funciona Learnnear',
      subtitle: 'Encontrar el tutor adecuado nunca ha sido tan fácil. Sólo tres simples pasos.',
      step1_title: 'Buscar Tutores', step1_desc: 'Busca por materia y ubicación para encontrar tutores calificados en tu área.',
      step2_title: 'Ver Perfiles', step2_desc: 'Consulta calificaciones, reseñas, experiencia y estilo de enseñanza antes de decidir.',
      step3_title: 'Empezar a Aprender', step3_desc: 'Contacta a tu tutor elegido y programa tu primera lección presencial.'
    },
    featured: { title: 'Tutores Destacados', subtitle: 'Instructores altamente calificados listos para ayudarte a tener éxito', view_all: 'Ver todos los tutores' },
    cta: { title: '¿Listo para empezar a aprender?', subtitle: 'Únete a miles de estudiantes que encontraron a su tutor perfecto en Learnnear. Comienza tu viaje de aprendizaje hoy.', find_tutor: 'Encontrar un Tutor', become_tutor: 'Ser un Tutor' },
    footer: { platform: 'Plataforma', find_tutors: 'Buscar Tutores', map_view: 'Vista del Mapa', about_us: 'Sobre Nosotros', contact: 'Contacto', for_tutors: 'Para Tutores', become_tutor: 'Ser Tutor', tutor_resources: 'Recursos para Tutores', success_stories: 'Historias de Éxito', legal: 'Legal', privacy_policy: 'Política de Privacidad', terms_of_service: 'Términos de Servicio', rights_reserved: 'Todos los derechos reservados.' }
  },
  it: {
    nav: { map_view: 'Mappa', dashboard: 'Pannello', my_profile: 'Mio Profilo' },
    hero: { tagline: 'Apprendimento in presenza reso facile', free_browse: 'Navigazione gratuita' },
    how_it_works: {
      title: 'Come funziona Learnnear',
      subtitle: 'Trovare il tutor giusto non è mai stato così facile. Solo tre semplici passi.',
      step1_title: 'Cerca Tutor', step1_desc: 'Cerca per materia e luogo per trovare tutor qualificati nella tua zona.',
      step2_title: 'Vedi Profili', step2_desc: 'Controlla valutazioni, recensioni, esperienza e stile di insegnamento.',
      step3_title: 'Inizia a Imparare', step3_desc: 'Contatta il tuo tutor scelto e programma la tua prima lezione.'
    },
    featured: { title: 'Tutor in Evidenza', subtitle: 'Insegnanti molto apprezzati pronti ad aiutarti', view_all: 'Vedi tutti i tutor' },
    cta: { title: 'Pronto per iniziare?', subtitle: 'Unisciti a migliaia di studenti che hanno trovato il loro tutor perfetto.', find_tutor: 'Trova un Tutor', become_tutor: 'Diventa Tutor' },
    footer: { platform: 'Piattaforma', find_tutors: 'Trova Tutor', map_view: 'Mappa', about_us: 'Chi Siamo', contact: 'Contatti', for_tutors: 'Per Tutor', become_tutor: 'Diventa Tutor', tutor_resources: 'Risorse per Tutor', success_stories: 'Storie di Successo', legal: 'Legale', privacy_policy: 'Privacy Policy', terms_of_service: 'Termini di Servizio', rights_reserved: 'Tutti i diritti riservati.' }
  }
};

for (const lang of ['en', 'tr', 'sp', 'it']) {
  const t = additions[lang];
  code = code.replace(new RegExp('("' + lang + '":.*?"nav":\\s*{)([\\s\\S]*?)(},)'), 
    (match, p1, p2, p3) => p1 + p2 + ', "map_view": "' + t.nav.map_view + '", "dashboard": "' + t.nav.dashboard + '", "my_profile": "' + t.nav.my_profile + '"' + p3
  );
  code = code.replace(new RegExp('("' + lang + '":.*?"hero":\\s*{)([\\s\\S]*?)(},)'), 
    (match, p1, p2, p3) => p1 + p2 + ', "tagline": "' + t.hero.tagline + '", "free_browse": "' + t.hero.free_browse + '"' + p3
  );
  
  const newSections = `
      "how_it_works": ${JSON.stringify(t.how_it_works, null, 8).replace(/}$/, '      }')},
      "featured": ${JSON.stringify(t.featured, null, 8).replace(/}$/, '      }')},
      "cta": ${JSON.stringify(t.cta, null, 8).replace(/}$/, '      }')},
      "footer": ${JSON.stringify(t.footer, null, 8).replace(/}$/, '      }')},`;
      
  code = code.replace(new RegExp('("' + lang + '":.*?"hero":\\s*{[\\s\\S]*?},)'), 
    (match, p1) => p1 + newSections
  );
}

fs.writeFileSync('src/i18n.ts', code);
