import type { Language } from "@/context/LanguageContext";

type Translation = {
  nav: {
    about:      string;
    experience: string;
    skills:     string;
    projects:   string;
    contact:    string;
    blog:       string;
  };
  hero: {
    title:       string;
    subline:     string;
    who:         string;
    impact:      string;
    availability: string;
    timezone:    string;
    portraitAlt: string;
    cta_work:    string;
    cta_cv:      string;
  };
  about: {
    heading:     string;
    p1:          string;
    p2:          string;
    p3:          string;
    azure_badge: string;
    stat1_label: string;
    stat2_label: string;
    stat3_label: string;
  };
  experience: {
    heading: string;
    present: string;
    logiztik: {
      role:    string;
      period:  string;
      bullets: [string, string];
    };
  };
  skills: {
    heading: string;
    also:    string;
  };
  projects: {
    heading:  string;
    featured: string;
  };
  contact: {
    heading:      string;
    sub:          string;
    button:       string;
    availability: string;
    open_to:      string;
    response:     string;
    timezone:     string;
  };
  blog: {
    title:         string;
    intro:         string;
    empty:         string;
    readingTime:   string;
    back:          string;
    notFoundTitle: string;
    notFoundBody:  string;
    notFoundLink:  string;
    pageNotFoundTitle: string;
    pageNotFoundBody:  string;
    pageNotFoundLink:  string;
    dateLocale:    string;
  };
  a11y: {
    skip:      string;
    menu:      string;
    language:  string;
    linkedin:  string;
    email:     string;
    whatsapp:  string;
  };
  footer: string;
};

const translations: Record<Language, Translation> = {
  en: {
    nav: {
      about:      "About",
      experience: "Experience",
      skills:     "Skills",
      projects:   "Projects",
      contact:    "Contact",
      blog:       "Blog",
    },
    hero: {
      title:       "Senior .NET & Azure engineer.",
      subline:     "Nine years shipping for US teams. Now building AI agents.",
      who:         "Luis Antonio Jacho Zambrano · Quito, Ecuador",
      impact:      "Reduced release downtime ~60% with CI/CD automation. Architected Azure systems for 30,000+ users.",
      availability: "Open to senior remote roles and consulting",
      timezone:    "Quito, UTC−5 year-round: fully overlapping US Eastern and Central business hours.",
      portraitAlt: "Portrait of Luis Antonio Jacho Zambrano",
      cta_work:    "View My Work",
      cta_cv:      "Download CV",
    },
    about: {
      heading:     "Building scalable systems, leading teams, shipping products.",
      p1:          "I'm a Senior Full Stack Developer based in Quito, Ecuador with 9 years of experience building enterprise-grade web applications.",
      p2:          "At MyWork, I led the full-stack development of a workforce management platform serving 30,000+ active users — owning everything from API architecture and Azure infrastructure to CI/CD pipelines and frontend delivery.",
      p3:          "I specialize in .NET, Angular, and Azure, with a strong focus on system performance, clean architecture, and mentoring engineering teams.",
      azure_badge: "Azure Developer Associate",
      stat1_label: "Years of experience",
      stat2_label: "Users on production",
      stat3_label: "Azure certification",
    },
    experience: {
      heading: "Where I've worked",
      present: "Present",
      logiztik: {
        role:   "Full Stack Developer",
        period: "Oct 2019 – Apr 2020",
        bullets: [
          "Developed Cargo Plus, a logistics platform for shipment tracking and workflow automation using .NET, PostgreSQL and JavaScript.",
          "Built RESTful backend services and integrated third-party logistics APIs, reducing manual data entry for operations teams.",
        ],
      },
    },
    skills: {
      heading: "What I work with",
      also:    "Also experienced with:",
    },
    projects: {
      heading:  "Selected work",
      featured: "Featured",
    },
    contact: {
      heading:      "Let's work together",
      sub:          "Open to senior remote roles and consulting. Let's talk.",
      button:       "Send me an email",
      availability: "Available for work",
      open_to:      "Open to: Senior remote roles · Consulting",
      response:     "Response time: within 24h",
      timezone:     "Timezone: UTC−5 year-round",
    },
    blog: {
      title:         "Blog",
      intro:         "Notes on how I build and ship software.",
      empty:         "No posts published yet.",
      readingTime:   "{n} min read",
      back:          "Back to blog",
      notFoundTitle: "Post not found",
      notFoundBody:  "This post does not exist or is not published.",
      notFoundLink:  "Back to blog",
      pageNotFoundTitle: "Page not found",
      pageNotFoundBody:  "This page does not exist.",
      pageNotFoundLink:  "Back to home",
      dateLocale:    "en-US",
    },
    a11y: {
      skip:     "Skip to main content",
      menu:     "Toggle menu",
      language: "Language",
      linkedin: "LinkedIn",
      email:    "Email",
      whatsapp: "Chat on WhatsApp",
    },
    footer: "Built with Next.js & Tailwind",
  },

  es: {
    nav: {
      about:      "Sobre mí",
      experience: "Experiencia",
      skills:     "Habilidades",
      projects:   "Proyectos",
      contact:    "Contacto",
      blog:       "Blog",
    },
    hero: {
      title:       "Ingeniero senior de .NET y Azure.",
      subline:     "Nueve años desarrollando software para equipos de EE. UU. Ahora, construyendo agentes de IA.",
      who:         "Luis Antonio Jacho Zambrano · Quito, Ecuador",
      impact:      "Reduje ~60 % el tiempo de inactividad en despliegues con CI/CD. Diseñé la arquitectura en Azure de sistemas con más de 30.000 usuarios.",
      availability: "Disponible para puestos remotos senior y consultoría",
      timezone:    "Quito, UTC−5 todo el año: horario laboral compatible con el este y el centro de EE. UU.",
      portraitAlt: "Retrato de Luis Antonio Jacho Zambrano",
      cta_work:    "Ver mi trabajo",
      cta_cv:      "Descargar CV",
    },
    about: {
      heading:     "Construyo sistemas escalables, lidero equipos y entrego productos.",
      p1:          "Soy desarrollador full stack senior en Quito, Ecuador, con 9 años de experiencia construyendo aplicaciones web empresariales.",
      p2:          "En MyWork lideré el desarrollo full stack de una plataforma de gestión de personal con más de 30.000 usuarios activos: desde la arquitectura de las API y la infraestructura en Azure hasta los pipelines de CI/CD y el frontend.",
      p3:          "Me especializo en .NET, Angular y Azure, con un fuerte enfoque en el rendimiento del sistema, arquitectura limpia y mentoría de equipos de ingeniería.",
      azure_badge: "Azure Developer Associate",
      stat1_label: "Años de experiencia",
      stat2_label: "Usuarios en producción",
      stat3_label: "Certificación Azure",
    },
    experience: {
      heading: "Dónde he trabajado",
      present: "Presente",
      logiztik: {
        role:   "Desarrollador Full Stack",
        period: "Oct 2019 – Abr 2020",
        bullets: [
          "Desarrollé Cargo Plus, una plataforma logística para el seguimiento de envíos y la automatización de flujos de trabajo con .NET, PostgreSQL y JavaScript.",
          "Desarrollé servicios backend REST e integré API logísticas de terceros, lo que redujo la carga manual de datos de los equipos de operaciones.",
        ],
      },
    },
    skills: {
      heading: "Con qué trabajo",
      also:    "También he trabajado con:",
    },
    projects: {
      heading:  "Proyectos seleccionados",
      featured: "Destacado",
    },
    contact: {
      heading:      "Trabajemos juntos",
      sub:          "Disponible para puestos remotos senior y consultoría. Hablemos.",
      button:       "Envíame un correo",
      availability: "Disponible para trabajar",
      open_to:      "Abierto a: puestos remotos senior · consultoría",
      response:     "Tiempo de respuesta: menos de 24 h",
      timezone:     "Zona horaria: UTC−5 todo el año",
    },
    blog: {
      title:         "Blog",
      intro:         "Notas sobre cómo construyo y publico software.",
      empty:         "Aún no hay publicaciones.",
      readingTime:   "{n} min de lectura",
      back:          "Volver al blog",
      notFoundTitle: "Publicación no encontrada",
      notFoundBody:  "Esta publicación no existe o no está publicada.",
      notFoundLink:  "Volver al blog",
      pageNotFoundTitle: "Página no encontrada",
      pageNotFoundBody:  "Esta página no existe.",
      pageNotFoundLink:  "Volver al inicio",
      dateLocale:    "es-EC",
    },
    a11y: {
      skip:     "Saltar al contenido principal",
      menu:     "Abrir o cerrar el menú",
      language: "Idioma",
      linkedin: "LinkedIn",
      email:    "Correo electrónico",
      whatsapp: "Escríbeme por WhatsApp",
    },
    footer: "Hecho con Next.js y Tailwind",
  },
};

export default translations;
