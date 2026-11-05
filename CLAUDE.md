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
    not-found.tsx   # Localized 404 (post-not-found wording under /blog/)
    blog/
      page.tsx          # Blog index (server, static; reads content/blog)
      [slug]/page.tsx   # Blog post (static, dynamicParams = false)
  components/
    Navbar.tsx                  # Fixed top navigation
    Footer.tsx                  # Site footer
    WhatsAppButton.tsx          # Floating WhatsApp contact button
    BlogCard.tsx                # Blog post card (presentational)
    BlogIndex.tsx               # Client: picks language, lists cards / empty state
    LocalizedPost.tsx           # Client: shows the active language version of a post
    BlogNotFound.tsx            # Client: localized not-found
    MarkdownBody.tsx            # Server: react-markdown render (no raw HTML)
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
    blog.ts               # Loads/validates content/blog (build fails on errors)
```

Contenido del blog: `content/blog/<slug>/en.md` y `es.md` (Markdown + frontmatter
`title`, `summary`, `date`, `draft`). Los borradores se excluyen solo cuando
`VERCEL_ENV=production`.

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

## Design skills — precedence
- The constitution (.specify/memory/constitution.md, Principle IV) overrides every design skill.
- Roles: impeccable = critique/audit/polish; emil-design-eng = motion and
  micro-interactions.

## Propietario
**Luis Antonio Jacho Zambrano**  
Senior Full Stack Developer · .NET | Angular | Azure  
Quito, Ecuador · antjazl@gmail.com
