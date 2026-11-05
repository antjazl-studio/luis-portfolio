# Mi Portfolio Profesional

## Stack Tecnológico
- Framework: Next.js 14 (App Router)
- Lenguaje: TypeScript
- Estilos: Tailwind CSS
- Animaciones: Framer Motion

## Convenciones
- Componentes funcionales solamente
- Exportaciones nombradas
- Responsive design mobile-first
- "use client" solo en componentes interactivos; pages y layouts son server components
- Todo string visible existe en EN y ES vía LanguageContext (sin librerías i18n)

## Secciones del Portfolio
- Hero / Presentación
- Sobre mí
- Proyectos
- Skills
- Contacto

## Estructura de componentes
```
src/
  app/
    layout.tsx      # Root layout, metadata, fonts
    page.tsx        # Entry point — composes all sections
    globals.css     # CSS variables (dark theme), Tailwind base
    blog/
      page.tsx          # Blog index (Dev.to via rss2json)
      [slug]/page.tsx   # Blog post
  components/
    Navbar.tsx                  # Fixed top navigation
    Footer.tsx                  # Site footer
    WhatsAppButton.tsx          # Floating WhatsApp contact button
    BlogCard.tsx                # Blog post card
    sections/
      Hero.tsx        # Full-screen intro + CV download (public/Luis_Jacho_Resume.pdf)
      About.tsx       # Bio / summary
      Experience.tsx  # Work history
      Skills.tsx      # Tech stack grid
      Projects.tsx    # Featured projects
      Contact.tsx     # Contact form / links
  context/
    LanguageContext.tsx   # EN/ES language state (React Context)
  hooks/
    useLanguage.ts
  lib/
    translations.ts       # All EN/ES strings
```

Reglas de gobierno completas en `.specify/memory/constitution.md`.

## Tema (CSS variables en globals.css)
| Variable        | Valor     | Uso                        |
|-----------------|-----------|----------------------------|
| --background    | #0d1117   | Fondo principal            |
| --foreground    | #e6edf3   | Texto principal            |
| --accent        | #0078d4   | Azure blue, solo links y focus rings (CTAs neutrales) |
| --accent-hover  | #106ebe   | Hover state del accent     |
| --surface       | #161b22   | Cards, paneles             |
| --surface-2     | #21262d   | Hover de surface           |
| --muted         | #8b949e   | Texto secundario           |
| --border        | #30363d   | Bordes y divisores         |

## Propietario
**Luis Antonio Jacho Zambrano**  
Senior Full Stack Developer · .NET | Angular | Azure  
Quito, Ecuador · antjazl@gmail.com
