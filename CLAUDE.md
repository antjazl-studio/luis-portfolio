# Mi Portfolio Profesional

## Stack Tecnológico
- Framework: Next.js 16 (App Router), React 19, Node 24
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
    useStablePathname.ts      # Hydration-safe pathname (neutral on the prerendered 404 shell until hydrated)
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
| --background    | #050505   | Fondo principal (Ink Black) |
| --foreground    | #FFFFFF   | Texto principal (Paper White) |
| --accent        | #548CFF   | Cornflower Blue, solo links y focus rings (CTAs neutrales) |
| --accent-hover  | #7DA8FF   | Hover state del accent     |
| --surface       | #0E0E10   | Paneles                    |
| --surface-2     | #18181B   | Hover de surface           |
| --muted         | #A1A1AA   | Texto secundario           |
| --border        | #27272A   | Divisores decorativos      |
| --border-strong | #71717A   | Contorno de controles interactivos |
| --focus-ring    | #548CFF   | Anillo de foco de teclado  |
| --status-available | #34D399 | Punto de estado de disponibilidad (estático, solo junto a texto) |

Referencia detallada de tokens, contrastes WCAG y tipografía: `DESIGN.md` (debe mantenerse
consistente con la constitución; si hay conflicto, gana la constitución). `PRODUCT.md` y
`DESIGN.md` están subordinados a la constitución.

## Design skills — precedence
- The constitution (.specify/memory/constitution.md, Principle IV) overrides every design skill.
- Roles: impeccable = critique/audit/polish; emil-design-eng = motion and
  micro-interactions.

## Propietario
**Luis Antonio Jacho Zambrano**  
Senior Full Stack Developer · .NET | Angular | Azure  
Quito, Ecuador · antjazl@gmail.com
