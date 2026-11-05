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
    badge:    string;
    subtitle: string;
    impact:   string;
    bio:      string;
    cta_work: string;
    cta_cv:   string;
  };
  about: {
    label:       string;
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
    label:   string;
    heading: string;
    present: string;
  };
  skills: {
    label:   string;
    heading: string;
    also:    string;
  };
  projects: {
    label:    string;
    heading:  string;
    featured: string;
  };
  contact: {
    label:        string;
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
      badge:    "Available for freelance projects",
      subtitle: "Senior Full Stack Developer",
      impact:   "Reduced release downtime ~60% with CI/CD automation · Architected Azure systems for 30,000+ users.",
      bio:      "8+ years building enterprise platforms at scale. Led development of a workforce management platform serving 30,000+ active users.",
      cta_work: "View My Work",
      cta_cv:   "Download CV",
    },
    about: {
      label:       "About me",
      heading:     "Building scalable systems, leading teams, shipping products.",
      p1:          "I'm a Senior Full Stack Developer based in Quito, Ecuador with 8+ years of experience building enterprise-grade web applications.",
      p2:          "At MyWork, I led the full-stack development of a workforce management platform serving 30,000+ active users — owning everything from API architecture and Azure infrastructure to CI/CD pipelines and frontend delivery.",
      p3:          "I specialize in .NET, Angular, and Azure, with a strong focus on system performance, clean architecture, and mentoring engineering teams.",
      azure_badge: "Azure Developer Associate",
      stat1_label: "Years of experience",
      stat2_label: "Users on production",
      stat3_label: "Azure certification",
    },
    experience: {
      label:   "Experience",
      heading: "Where I've worked",
      present: "Present",
    },
    skills: {
      label:   "Skills",
      heading: "What I work with",
      also:    "Also experienced with:",
    },
    projects: {
      label:    "Projects",
      heading:  "Selected work",
      featured: "Featured",
    },
    contact: {
      label:        "Contact",
      heading:      "Let's work together",
      sub:          "I'm currently available for freelance projects and full-time remote positions. Let's talk.",
      button:       "Send me an email",
      availability: "Available for work",
      open_to:      "Open to: Freelance · Consulting",
      response:     "Response time: within 24h",
      timezone:     "Timezone: GMT-5 (flexible)",
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
      badge:    "Disponible para proyectos freelance",
      subtitle: "Desarrollador Full Stack Senior",
      impact:   "Reduje el downtime en releases ~60% con CI/CD · Arquitecté sistemas Azure para 30,000+ usuarios.",
      bio:      "Más de 8 años construyendo plataformas empresariales a escala. Lideré el desarrollo de una plataforma de gestión de personal con más de 30,000 usuarios activos.",
      cta_work: "Ver mi trabajo",
      cta_cv:   "Descargar CV",
    },
    about: {
      label:       "Sobre mí",
      heading:     "Construyendo sistemas escalables, liderando equipos, entregando productos.",
      p1:          "Soy un Desarrollador Full Stack Senior con sede en Quito, Ecuador, con más de 8 años de experiencia construyendo aplicaciones web empresariales.",
      p2:          "En MyWork, lideré el desarrollo full-stack de una plataforma de gestión de personal con más de 30,000 usuarios activos — a cargo de todo, desde la arquitectura de APIs e infraestructura en Azure hasta pipelines de CI/CD y entrega frontend.",
      p3:          "Me especializo en .NET, Angular y Azure, con un fuerte enfoque en el rendimiento del sistema, arquitectura limpia y mentoría de equipos de ingeniería.",
      azure_badge: "Azure Developer Associate",
      stat1_label: "Años de experiencia",
      stat2_label: "Usuarios en producción",
      stat3_label: "Certificación Azure",
    },
    experience: {
      label:   "Experiencia",
      heading: "Dónde he trabajado",
      present: "Presente",
    },
    skills: {
      label:   "Habilidades",
      heading: "Con qué trabajo",
      also:    "También con experiencia en:",
    },
    projects: {
      label:    "Proyectos",
      heading:  "Trabajo seleccionado",
      featured: "Destacado",
    },
    contact: {
      label:        "Contacto",
      heading:      "Trabajemos juntos",
      sub:          "Actualmente estoy disponible para proyectos freelance y posiciones remotas a tiempo completo. Hablemos.",
      button:       "Envíame un correo",
      availability: "Disponible para trabajar",
      open_to:      "Abierto a: Freelance · Consultoría",
      response:     "Tiempo de respuesta: dentro de 24h",
      timezone:     "Zona horaria: GMT-5 (flexible)",
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
    footer: "Construido con Next.js & Tailwind",
  },
};

export default translations;
