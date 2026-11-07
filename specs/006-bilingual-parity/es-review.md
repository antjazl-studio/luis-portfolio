# Spanish copy for the owner's review (feature 006)

**Status: reviewed and approved by the owner on 2026-11-06** (spec Owner Decision 11). Generated from `src/lib/translations.ts` against `upstream/master`. The Spanish below is the approved text, including the owner's five corrections.

- English strings changed: **0**. Spanish strings already on `master` changed: **1** (the Logiztik role, by the owner's decision).
- New strings: **51** (25 to review, 25 identical and language-neutral, 1 moved into the table: the WhatsApp message, whose Spanish wording was set by the owner's review).

## Decided by the owner (PR #9, 2026-11-06)

1. **Logiztik role (existing string, changed on the owner's decision):** "Desarrollador Full Stack" became "Desarrollador full stack".
2. **About statistic:** ES "+30 mil" (EN stays "30k+"); it now comes from the translation table.
3. **IESS entry:** kept as is (supports the "nine years" claim); no change.

## Owner review: done (2026-11-06)

Everything in this sheet is approved as written, except these five corrections, which are applied:

1. MyWork bullet 4: "ranuras de implementación" (instead of "ranuras de despliegue").
2. MyWork bullet 6: "Fui mentor de un equipo de desarrollo de 4 personas mediante revisiones de código y programación en pareja".
3. IESS bullet 2: "Desarrollo y mantenimiento de sistemas backend a escala gubernamental".
4. Skill label "Agile/Scrum" stays in English in Spanish (added to the language-neutral list).
5. Spanish WhatsApp message: "¡Hola, Luis! Vi tu portafolio y me gustaría conversar.".

The Contact location line was moved into the table with its text unchanged.

## About

| Key | English (unchanged) | Spanish (draft) |
|-----|---------------------|-----------------|
| `about.stat2_value` | 30k+ | +30 mil |

## Experience

| Key | English (unchanged) | Spanish (draft) |
|-----|---------------------|-----------------|
| `experience.mywork.role` | Senior Full Stack Consultant | Consultor full stack senior |
| `experience.mywork.location` | Quito, Ecuador (Remote) | Quito, Ecuador (remoto) |
| `experience.mywork.bullets[0]` | Led architectural decisions for workforce management platform (.NET + Angular + Azure), 30,000+ active users | Lideré las decisiones de arquitectura de una plataforma de gestión de personal (.NET + Angular + Azure) con más de 30.000 usuarios activos |
| `experience.mywork.bullets[1]` | Designed REST APIs and Azure Functions using the isolated worker model | Diseñé API REST y Azure Functions con el modelo de trabajo aislado |
| `experience.mywork.bullets[2]` | Implemented Azure autoscaling policies, eliminating peak-load performance issues | Implementé políticas de escalado automático en Azure que eliminaron los problemas de rendimiento en los picos de carga |
| `experience.mywork.bullets[3]` | CI/CD pipelines with deployment slot swapping, cutting release downtime ~60% | Pipelines de CI/CD con intercambio de ranuras de implementación, que redujeron ~60 % el tiempo de inactividad en los despliegues |
| `experience.mywork.bullets[4]` | Optimized SQL Server schemas for a high-traffic multi-tenant system | Optimicé esquemas de SQL Server para un sistema multiinquilino de alto tráfico |
| `experience.mywork.bullets[5]` | Mentored a 4-person dev team through code reviews and pair programming | Fui mentor de un equipo de desarrollo de 4 personas mediante revisiones de código y programación en pareja |
| `experience.iess.role` | .NET Developer | Desarrollador .NET |
| `experience.iess.bullets[0]` | AS400 and legacy system integrations with .NET Framework | Integraciones con AS400 y sistemas heredados mediante .NET Framework |
| `experience.iess.bullets[1]` | Government-scale backend development and maintenance | Desarrollo y mantenimiento de sistemas backend a escala gubernamental |

## Projects

| Key | English (unchanged) | Spanish (draft) |
|-----|---------------------|-----------------|
| `projects.items[0].title` | MyWork — Workforce Management Platform | MyWork — Plataforma de gestión de personal |
| `projects.items[0].description` | Enterprise platform managing daily operations for 30,000+ field workers. Built with .NET, Angular, and Azure from the ground up. | Plataforma empresarial que gestiona las operaciones diarias de más de 30.000 trabajadores de campo. Construida desde cero con .NET, Angular y Azure. |
| `projects.items[1].title` | Azure Functions Migration | Migración a Azure Functions |
| `projects.items[1].description` | Migrated a monolithic .NET Framework app to isolated Azure Functions model with zero downtime deployment. | Migración de una aplicación monolítica de .NET Framework al modelo de trabajo aislado de Azure Functions, con despliegue sin tiempo de inactividad. |
| `projects.items[2].title` | Dynamic Forms Engine | Motor de formularios dinámicos |
| `projects.items[2].description` | Built a configurable form engine allowing non-technical teams to create operational workflows — DVIR inspections, checklists, and field reports. | Construí un motor de formularios configurable que permite a equipos no técnicos crear flujos de trabajo operativos: inspecciones DVIR, listas de verificación e informes de campo. |

## Skills

| Key | English (unchanged) | Spanish (draft) |
|-----|---------------------|-----------------|
| `skills.groups.backend.items[3]` | REST APIs | API REST |
| `skills.groups.backend.items[4]` | Microservices | Microservicios |
| `skills.groups.cloud.name` | Cloud & DevOps | Nube y DevOps |
| `skills.groups.databases.name` | Databases | Bases de datos |
| `skills.groups.tools.name` | Tools & Methods | Herramientas y métodos |
| `skills.groups.tools.items[2]` | Layered Architecture | Arquitectura en capas |

## Tab titles

| Key | English (unchanged) | Spanish (draft) |
|-----|---------------------|-----------------|
| `meta.home` | Luis Jacho Zambrano — Senior Full Stack Developer | Luis Jacho Zambrano — Desarrollador full stack senior |

## Moved into the table (approved)

| Key | Text |
|-----|------|
| `contact.whatsappMessage` (EN) | Hi Luis! I saw your portfolio and I'd like to talk. |
| `contact.whatsappMessage` (ES) | ¡Hola, Luis! Vi tu portafolio y me gustaría conversar. |

## Identical in both languages (language-neutral, on the spec FR-010 list)

`skills.groups.backend.name` = Backend; `skills.groups.backend.items[0]` = C#; `skills.groups.backend.items[1]` = .NET Core; `skills.groups.backend.items[2]` = .NET Framework; `skills.groups.backend.items[5]` = Azure Functions; `skills.groups.frontend.name` = Frontend; `skills.groups.frontend.items[0]` = Angular; `skills.groups.frontend.items[1]` = TypeScript; `skills.groups.frontend.items[2]` = JavaScript; `skills.groups.cloud.items[0]` = Microsoft Azure; `skills.groups.cloud.items[1]` = Azure DevOps; `skills.groups.cloud.items[2]` = Docker; `skills.groups.cloud.items[3]` = CI/CD; `skills.groups.cloud.items[4]` = App Services; `skills.groups.databases.items[0]` = SQL Server; `skills.groups.databases.items[1]` = PostgreSQL; `skills.groups.tools.items[0]` = Git; `skills.groups.tools.items[1]` = Agile/Scrum; `skills.secondary[0]` = React; `skills.secondary[1]` = Node.js; `skills.secondary[2]` = MongoDB; `skills.secondary[3]` = MySQL; `skills.secondary[4]` = Power BI; `contact.location` = Quito, Ecuador (UTC−5); `meta.blog` = Blog — Luis Jacho Zambrano
