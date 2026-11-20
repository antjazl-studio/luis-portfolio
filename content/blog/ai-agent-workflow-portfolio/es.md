---
title: "Barreras en la configuración, no en los prompts: dejar que un agente de IA trabaje en mi portafolio público"
summary: "Cómo un agente de IA trabaja en este portafolio público sin poder hacer push, fusionar ni borrar: una cuenta bot de solo lectura, reglas de denegación, un ruleset de ramas, CI, vistas previas y revisión humana, con los errores del camino."
date: 2026-11-05
---

Estoy migrando hacia la ingeniería de IA y quería que un agente hiciera trabajo real en este
portafolio. El problema: el repositorio es público y fusionar a `master` despliega a producción.

Con mis propias credenciales, un agente podría hacer push directo a `master`, un force-push,
borrar ramas o publicar contenido a medio terminar. Pedírselo en un prompt es solo una petición.
Quería un agente rápido y con los límites en la configuración.

*Reescrito el 2026-11-19 con los detalles que la primera versión dejó fuera.*

## Qué podría hacer un agente con mis credenciales

Cada riesgo de la tabla tiene al menos un control que funciona aunque el agente se porte mal:

| Riesgo | Control |
|---|---|
| Push a `master` | La cuenta bot no tiene acceso de escritura al repo principal; un ruleset exige un pull request |
| Force-push | El ruleset bloquea las actualizaciones que no son fast-forward; `git push --force` está denegado en la configuración del agente |
| Borrar ramas | El ruleset bloquea borrar la rama protegida; `gh repo delete` está denegado |
| Publicar contenido sin terminar | Un pull request necesita una aprobación y un build exitoso; los borradores del blog se ocultan en producción |
| Fusionar | `gh pr merge` está denegado; fusionar me toca a mí |

## Una cuenta bot que solo puede pedir

Creé una cuenta de GitHub aparte, `antjazlbot`, con acceso de solo lectura al repositorio de la
organización. Se comporta como un colaborador externo: hace fork del repo, sube su trabajo a su
fork (`origin`) y abre pull requests contra el repo principal (`upstream`). GitHub confirma qué
puede hacer el bot:

```
$ gh api repos/antjazl-studio/luis-portfolio --jq .permissions
{"admin":false,"maintain":false,"pull":true,"push":false,"triage":false}
```

Descubrí el límite usándolo mal. Intenté crear el repositorio en la organización mientras `gh`
seguía con la sesión del bot, y el token del bot recibió un error de permisos de GraphQL: no
puede crear repositorios ahí. Eso era lo que quería, así que cambié a mi cuenta de propietario
y creé el repositorio yo mismo.

La siguiente sorpresa fue la contraria. El bot recibió "permission denied" al hacer push a su
propio fork. Lo resolví cambiando de cuenta con `gh auth switch` y ejecutando
`gh auth setup-git`. Con dos cuentas en una misma máquina, cada comando se ejecuta como alguien,
y es fácil ejecutarlo como la equivocada.

## La herramienta se niega a decidir identidad y publicación, así que lo dejé escrito

El modo automático de Claude Code se negó a ejecutar por su cuenta dos comandos: `gh auth switch`
("Identity Not Given") y `gh pr create` ("Create Public Surface"). Deja en manos de una persona
cambiar de identidad y publicar algo público. Ejecuté ambos yo mismo con el prefijo `!`, que
corre un comando dentro de la sesión.

Después copié ese comportamiento a `.claude/settings.json`, para que cada ejecución siga la
misma política (recortado):

```json
"allow": [
  "Bash(npm run lint)",
  "Bash(npm run build)",
  "Bash(git push origin:*)",
  "Bash(gh pr create:*)",
  ...
],
"deny": [
  "Bash(git push upstream:*)",
  "Bash(git push --force:*)",
  "Bash(gh pr merge:*)",
  "Bash(gh auth switch:*)",
  "Bash(gh repo delete:*)"
],
"ask": ["Edit(.specify/memory/constitution.md)"]
```

El agente puede ejecutar lint y build, hacer commit, subir a su propio fork y abrir un pull
request, que es como propone trabajo. No puede hacer push a `upstream`, forzar un push, fusionar,
cambiar de identidad ni borrar el repositorio, y debe preguntar antes de editar la constitución.

Esta lista solo contiene los comandos que se me ocurrieron. Por eso los límites del lado de GitHub,
en la siguiente sección, importan más.

## Un ruleset que protegía la rama equivocada

Un ruleset exige un pull request con una aprobación y un check `build` exitoso, y bloquea los
force-push y el borrado. GitHub no informa de actores con permiso de omisión, así que las reglas
también aplican para mí. Esto es lo que devuelve la API (recortado):

```json
"name": "protect-master",
"enforcement": "active",
"conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"] } },
"rules": [
  { "type": "deletion" },
  { "type": "non_fast_forward" },
  { "type": "pull_request",
    "parameters": { "required_approving_review_count": 1, ... } },
  { "type": "required_status_checks", ... }
]
```

Mi primer ruleset no protegía `master`. Fíjate en la condición: `~DEFAULT_BRANCH` significa "la
rama por defecto, sea cual sea". Mientras `chore/adopt-speckit`, la rama donde adopté Spec Kit,
era la rama por defecto, `master` no estaba cubierta. La solución fue convertir `master` en la
rama por defecto.

El ruleset se llama `protect-master`, pero protege la rama por defecto, sea cual sea. Revisa la
condición, porque el nombre no te dice qué rama cubre.

## CI, vistas previas y una fricción deliberada

Cada pull request ejecuta un flujo de GitHub Actions en Node 24:

```yaml
- run: npm ci
- run: npm run lint
- run: npm run build
```

Como los pull requests del bot vienen de un fork, Vercel no los compila por su cuenta. En cada
pull request del bot tengo que autorizar el despliegue como propietario, y solo entonces se
construye la vista previa. Es fricción. La mantengo porque la alternativa es que cualquiera que
haga fork de un repositorio público pueda conseguir que se compile su código en mi cuenta de
Vercel.

La vista previa también es donde viven los borradores. El blog oculta las publicaciones con
`draft: true` solo cuando `VERCEL_ENV` es `production`, así que las vistas previas las muestran.

## Especificaciones, una constitución y un supervisor que solo me pregunta lo que me toca decidir

Cada funcionalidad empieza como una especificación escrita con Spec Kit: specify, clarify, plan,
tasks, analyze, implement. Una constitución reúne las reglas que toda especificación debe
cumplir, incluida la de que todo texto visible exista en inglés y en español, y solo se puede
cambiar con su propio comando.

No conduzco cada paso. Una skill, `sdd-supervisor`, ejecuta el proceso y solo decide por sí
sola las cosas pequeñas. Esta es su política de escalamiento (recortada):

```
ASK the owner:
- Taste and brand: colors, theme, typography, ...
- Facts about Luis or his work.
- Scope changes: adding, dropping or splitting user stories ...
- Constitution amendments.
- Anything irreversible or public beyond a PR: ...
DECIDE YOURSELF and log the decision in the hand-off:
- Analyze findings that are consistency, wording, numbering or ordering fixes.
```

Un segundo agente, `sdd-reviewer`, revisa especificaciones y diffs. Tiene herramientas de lectura,
búsqueda y shell, y sus instrucciones dicen que nunca edita archivos.

En el widget de chat (funcionalidad 008) este ciclo valió la pena:

- El informe de análisis marcó 2 problemas CRITICAL y 2 HIGH antes de que existiera código. El
  informe no está guardado en el repositorio.
- También detectó un bug real fuera del repo que estaba revisando. Mi API de agente, separada, no
  exponía `Retry-After` al JavaScript de otro origen, así que el navegador no podía leer el tiempo
  de espera del límite de peticiones. Lo corregí allí con `Access-Control-Expose-Headers: Retry-After`.
- Las pruebas en navegador real encontraron dos bugs en el widget: el foco se escapaba del diálogo
  (en Chrome sin interfaz, Tab desde el último control saltaba al enlace de salto de la página) y el
  panel quedaba invisible bajo React StrictMode.
- El supervisor ejecutó 130 comprobaciones de navegador con scripts, y Lighthouse se mantuvo en
  100/100 en móvil y escritorio.

El primer commit de la funcionalidad es de las 21:42 y el pull request se fusionó a las 23:27
(UTC-5). Son casi una hora y tres cuartos entre el primer commit y la fusión. El trabajo de
pensar antes del primer commit no queda en el historial.

## Cuando el agente se equivoca: un error de sintaxis y una suposición de latencia

Un error de sintaxis, commiteado. Durante la 008, el revisor marcó un problema de severidad
baja: el parser del stream perdía una última línea sin salto de línea final. La primera
corrección del supervisor tenía un error de sintaxis, una cadena de texto partida en dos líneas, y
la commiteó antes de ejecutar lint porque nada en su cadena de comandos esperaba a que lint
pasara. Lint y el build lo detectaron. El supervisor reportó el descuido por sí mismo, lo corrigió y enmendó el
commit minuto y medio después, antes de subir nada. El commit roto nunca llegó a una rama remota.
Este es el diff real entre los dos commits, en `src/hooks/useChat.ts`:

```diff
-  for (const event of parseSseChunk(buffer + decoder.decode() + "
-").events) apply(event);
+  const tail = parseSseChunk(`${buffer}${decoder.decode()}\n`);
+  for (const event of tail.events) apply(event);
```

Ejecutar lint primero depende de que alguien se acuerde. Un hook lo haría cumplir, y todavía
no he agregado ese hook.

Un dato que el agente no podía saber. El plan del widget de chat suponía que las respuestas
llegan en unos 3 segundos. El agente real llama a una herramienta durante 3 a 10 segundos y luego
transmite la respuesta, y las respuestas completas tardan de 10 a 45 segundos. Un tiempo límite
total habría cortado respuestas normales, así que el widget usa un tiempo límite de inactividad de
30 segundos y ninguno total. Debí darle al agente la latencia real antes de que planificara.

## Qué cambiaría y qué puedes copiar

Qué cambiaría:

1. Bloquear los commits hasta que lint pase, con un hook, desde el primer día, en vez de confiar
   en que el agente se acuerde.
2. Versionar los scripts de ayuda. Tenía un pequeño script de PowerShell que cambiaba a
   `master`, traía `upstream`, subía el `master` del fork y borraba la rama ya fusionada. Nunca lo
   commiteé y se perdió.
3. Darle al agente los datos del mundo real desde el principio, como la latencia, en lugar de
   dejar que el plan los adivine.

Qué puedes copiar para tu propio proyecto:

- Dale al agente su propia cuenta, sin acceso de escritura al repositorio principal, y que trabaje
  con fork y pull request.
- Pon los límites duros en la plataforma (permisos del token y un ruleset) y los hábitos en la
  configuración del agente (allow, deny, ask). La configuración solo lista lo que se te ocurrió.
- Comprueba a qué rama apunta el ruleset y pruébalo contra la rama que despliega.
- Haz que tu fusión sea el único camino a producción y dale una vista previa a cada pull request.
- Deja que el agente te pregunte solo lo que te toca decidir: gusto, datos sobre ti y cualquier
  cosa pública o irreversible.

Nada de esto impide que el agente proponga un mal cambio. Eso lo detecta la revisión.
