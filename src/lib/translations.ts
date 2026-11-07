import type { Language } from "@/context/LanguageContext";

type ProjectText = { title: string; description: string };
type Six<T>  = [T, T, T, T, T, T];
type Five<T> = [T, T, T, T, T];
type Three<T> = [T, T, T];
type Two<T>  = [T, T];

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
    // Tuple types: the number of bullets must be the same in both languages (build fails otherwise).
    mywork: {
      role:     string;
      location: string;
      bullets:  Six<string>;
    };
    iess: {
      role:    string;
      bullets: Two<string>;
    };
  };
  skills: {
    heading: string;
    also:    string;
    groups: {
      backend:   { name: string; items: Six<string> };
      frontend:  { name: string; items: Three<string> };
      cloud:     { name: string; items: Five<string> };
      databases: { name: string; items: Two<string> };
      tools:     { name: string; items: Three<string> };
    };
    secondary: Five<string>;
  };
  projects: {
    heading:  string;
    featured: string;
    items:    Three<ProjectText>;
  };
  contact: {
    heading:         string;
    sub:             string;
    button:          string;
    availability:    string;
    open_to:         string;
    response:        string;
    timezone:        string;
    location:        string;
    whatsappMessage: string;
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
  meta: {
    home: string;
    blog: string;
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
      mywork: {
        role:     "Senior Full Stack Consultant",
        location: "Quito, Ecuador (Remote)",
        bullets: [
          "Led architectural decisions for workforce management platform (.NET + Angular + Azure), 30,000+ active users",
          "Designed REST APIs and Azure Functions using the isolated worker model",
          "Implemented Azure autoscaling policies, eliminating peak-load performance issues",
          "CI/CD pipelines with deployment slot swapping, cutting release downtime ~60%",
          "Optimized SQL Server schemas for a high-traffic multi-tenant system",
          "Mentored a 4-person dev team through code reviews and pair programming",
        ],
      },
      iess: {
        role: ".NET Developer",
        bullets: [
          "AS400 and legacy system integrations with .NET Framework",
          "Government-scale backend development and maintenance",
        ],
      },
    },
    skills: {
      heading: "What I work with",
      also:    "Also experienced with:",
      groups: {
        backend:   { name: "Backend",        items: ["C#", ".NET Core", ".NET Framework", "REST APIs", "Microservices", "Azure Functions"] },
        frontend:  { name: "Frontend",       items: ["Angular", "TypeScript", "JavaScript"] },
        cloud:     { name: "Cloud & DevOps", items: ["Microsoft Azure", "Azure DevOps", "Docker", "CI/CD", "App Services"] },
        databases: { name: "Databases",      items: ["SQL Server", "PostgreSQL"] },
        tools:     { name: "Tools & Methods", items: ["Git", "Agile/Scrum", "Layered Architecture"] },
      },
      secondary: ["React", "Node.js", "MongoDB", "MySQL", "Power BI"],
    },
    projects: {
      heading:  "Selected work",
      featured: "Featured",
      items: [
        {
          title:       "MyWork — Workforce Management Platform",
          description: "Enterprise platform managing daily operations for 30,000+ field workers. Built with .NET, Angular, and Azure from the ground up.",
        },
        {
          title:       "Azure Functions Migration",
          description: "Migrated a monolithic .NET Framework app to isolated Azure Functions model with zero downtime deployment.",
        },
        {
          title:       "Dynamic Forms Engine",
          description: "Built a configurable form engine allowing non-technical teams to create operational workflows — DVIR inspections, checklists, and field reports.",
        },
      ],
    },
    contact: {
      heading:      "Let's work together",
      sub:          "Open to senior remote roles and consulting. Let's talk.",
      button:       "Send me an email",
      availability: "Available for work",
      open_to:      "Open to: Senior remote roles · Consulting",
      response:     "Response time: within 24h",
      timezone:     "Timezone: UTC−5 year-round",
      location:        "Quito, Ecuador (UTC−5)",
      whatsappMessage: "Hi Luis! I saw your portfolio and I'd like to talk.",
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
    // Browser tab titles. EN equals the static metadata in layout.tsx and blog/page.tsx; the page
    // metadata itself stays English (accepted Principle VI deviation, owner 2026-11-06).
    meta: {
      home: "Luis Jacho Zambrano — Senior Full Stack Developer",
      blog: "Blog — Luis Jacho Zambrano",
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
      mywork: {
        role:     "Consultor full stack senior",
        location: "Quito, Ecuador (remoto)",
        bullets: [
          "Lideré las decisiones de arquitectura de una plataforma de gestión de personal (.NET + Angular + Azure) con más de 30.000 usuarios activos",
          "Diseñé API REST y Azure Functions con el modelo de trabajo aislado",
          "Implementé políticas de escalado automático en Azure que eliminaron los problemas de rendimiento en los picos de carga",
          "Pipelines de CI/CD con intercambio de ranuras de despliegue, que redujeron ~60 % el tiempo de inactividad en los despliegues",
          "Optimicé esquemas de SQL Server para un sistema multiinquilino de alto tráfico",
          "Mentoricé a un equipo de desarrollo de 4 personas mediante revisiones de código y programación en pareja",
        ],
      },
      iess: {
        role: "Desarrollador .NET",
        bullets: [
          "Integraciones con AS400 y sistemas heredados mediante .NET Framework",
          "Desarrollo y mantenimiento de backend a escala gubernamental",
        ],
      },
    },
    skills: {
      heading: "Con qué trabajo",
      also:    "También he trabajado con:",
      groups: {
        backend:   { name: "Backend",        items: ["C#", ".NET Core", ".NET Framework", "API REST", "Microservicios", "Azure Functions"] },
        frontend:  { name: "Frontend",       items: ["Angular", "TypeScript", "JavaScript"] },
        cloud:     { name: "Nube y DevOps",  items: ["Microsoft Azure", "Azure DevOps", "Docker", "CI/CD", "App Services"] },
        databases: { name: "Bases de datos", items: ["SQL Server", "PostgreSQL"] },
        tools:     { name: "Herramientas y métodos", items: ["Git", "Ágil/Scrum", "Arquitectura en capas"] },
      },
      secondary: ["React", "Node.js", "MongoDB", "MySQL", "Power BI"],
    },
    projects: {
      heading:  "Proyectos seleccionados",
      featured: "Destacado",
      items: [
        {
          title:       "MyWork — Plataforma de gestión de personal",
          description: "Plataforma empresarial que gestiona las operaciones diarias de más de 30.000 trabajadores de campo. Construida desde cero con .NET, Angular y Azure.",
        },
        {
          title:       "Migración a Azure Functions",
          description: "Migración de una aplicación monolítica de .NET Framework al modelo de trabajo aislado de Azure Functions, con despliegue sin tiempo de inactividad.",
        },
        {
          title:       "Motor de formularios dinámicos",
          description: "Construí un motor de formularios configurable que permite a equipos no técnicos crear flujos de trabajo operativos: inspecciones DVIR, listas de verificación e informes de campo.",
        },
      ],
    },
    contact: {
      heading:      "Trabajemos juntos",
      sub:          "Disponible para puestos remotos senior y consultoría. Hablemos.",
      button:       "Envíame un correo",
      availability: "Disponible para trabajar",
      open_to:      "Abierto a: puestos remotos senior · consultoría",
      response:     "Tiempo de respuesta: menos de 24 h",
      timezone:     "Zona horaria: UTC−5 todo el año",
      location:        "Quito, Ecuador (UTC−5)",
      whatsappMessage: "Hola Luis! Vi tu portafolio y me gustaría conversar.",
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
    meta: {
      home: "Luis Jacho Zambrano — Desarrollador full stack senior",
      blog: "Blog — Luis Jacho Zambrano",
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
