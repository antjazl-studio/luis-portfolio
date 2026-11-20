---
title: "Mover las discusiones antes del código: desarrollo guiado por especificaciones con un agente de IA"
summary: "Qué cambió escribir especificaciones antes del código en mi widget de chat: lo que detectó el análisis antes de que hubiera código, una suposición de latencia que habría llegado a producción, la constitución como barrera, dónde se desordenó el proceso y cuándo lo omitiría."
date: 2026-11-20
draft: true
---

Cuando empecé a usar un agente de IA en este portafolio, le daba instrucciones directas. El
código salía rápido. Lo que no sobrevivía era el razonamiento. Por qué un botón estaba donde
estaba, por qué un timeout era de 30 segundos, qué opción había descartado: todo vivía en un
historial de chat que desaparece. Y donde mi instrucción dejaba un hueco, el agente lo llenaba
con una suposición suya.

Por eso pasé el trabajo por Spec Kit. No se programa nada hasta que el spec, el plan y la lista
de tareas existen como archivos que puedo leer en un pull request.

Mi tesis es que las especificaciones mueven las discusiones a antes del código, donde salen
baratas. No digo que ahorren tiempo, porque eso no lo medí. La evidencia de abajo sale de una
funcionalidad, el widget de chat, y de los lugares donde el propio proceso falló. La
configuración que lo rodea (la cuenta bot, el ruleset, las vistas previas) está en
[el artículo anterior](/blog/ai-agent-workflow-portfolio).

## SDD en 60 segundos

El desarrollo guiado por especificaciones (SDD, por sus siglas en inglés) consiste en escribir la
funcionalidad antes de construirla. Describes qué debe hacer y por qué, lo conviertes en un plan
y una lista de tareas, revisas todo el conjunto en busca de huecos, y solo entonces escribes
código. El agente trabaja a partir de los archivos, no del chat, y el revisor lee esos mismos
archivos. Donde un hueco habría dejado al agente adivinar, los primeros pasos lo muestran cuando
corregirlo todavía cuesta una frase.

Uso [Spec Kit](https://github.com/github/spec-kit), que lo ejecuta como una serie de pasos. Cada
paso deja algo en el repositorio:

| Paso | Qué deja |
|---|---|
| specify | `spec.md` con historias de usuario priorizadas y requisitos numerados, y una lista de calidad |
| clarify | las respuestas, escritas de vuelta en `spec.md` |
| plan | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` |
| tasks | `tasks.md`, con cada tarea ligada a un requisito |
| analyze | un informe en pantalla; es de solo lectura y no escribe ningún archivo |
| implement | un commit por fase |

Un archivo aparte, la constitución, reúne las reglas del proyecto, como el stack y la paridad
bilingüe, y cada spec y cada plan se revisa contra ella. La instalación y el uso están en la
[documentación oficial de Spec Kit](https://github.github.io/spec-kit/).

Mi repositorio tiene diez carpetas en `specs/` (la `001` es la línea base del sitio que ya
existía) y 17 pull requests fusionados al 2026-11-20. El paso analyze no escribe ningún archivo,
así que lo que encuentra hay que corregirlo en los otros archivos, o se pierde.

## Qué cambió la etapa de especificación en el widget de chat

El widget (funcionalidad 008) habla con mi API de agente, separada, mediante server-sent events.
Antes de que existiera código, el informe de análisis marcó 2 problemas CRITICAL y 2 HIGH:

- Una transición CSS donde la constitución exige Framer Motion.
- `"use client"` en un componente que no lo necesitaba.
- Ningún plan para una carga diferida fallida del panel de chat.
- Ningún timeout.

El informe no está en el repositorio, así que no se puede abrir. Esta lista es mi resumen de lo
que marcó.

Una suposición de latencia. El plan asumía respuestas en unos 3 segundos, con un timeout de 10
segundos. Le conté al agente cómo se comporta el servicio real: llama a una herramienta durante
3 a 10 segundos, luego transmite, y una respuesta completa tarda de 10 a 45 segundos. El
requisito cambió a esto (texto original del spec, en inglés):

> FR-026: The widget MUST NOT apply a total request timeout (normal answers take 10 to 45 s).
> It MUST apply an idle timeout instead: if no bytes arrive from the service for 30 seconds
> (counted from sending, and restarted on every received chunk), the request is aborted and the
> error state is shown with a distinct "took too long" message. The visitor's message is kept,
> and one action (Retry) resends it. ...

El servidor de agente simulado que usé para probar cambió con él. Los escenarios `tool` y `ok`
emiten el evento de herramienta a los 5 segundos y luego transmiten texto durante unos 10, y un
escenario `stall` se queda en silencio más de 30. En las pruebas de navegador el timeout por
inactividad saltó a los 30,04 segundos, y una respuesta de 14 segundos no se cortó.

Mi lectura es que, con el plan original, las pruebas contra un simulado instantáneo
probablemente habrían pasado y la primera respuesta lenta habría fallado en producción. No puedo
demostrarlo, porque nunca construí esa versión.

Un bug en otro repositorio. Al leer el contrato del widget, el análisis también encontró que mi
API no exponía `Retry-After` al JavaScript de otro origen. El navegador no podía leer el tiempo
de espera del límite de peticiones, así que la cuenta regresiva que pedía el spec era
imposible. Corregí primero la API, con `Access-Control-Expose-Headers: Retry-After`, y después
construí el widget.

El historial de git da la forma del día, en mi zona horaria (UTC-5). Cambié a la rama de la
funcionalidad a las 16:59. El spec, el plan y las tareas entraron en un solo commit a las 21:42,
y el primer commit de código es de las 21:46. El pull request se fusionó a las 23:27. No puedo
separar las horas antes de las 21:42 entre trabajo y descansos, así que no voy a afirmar una
cifra de esfuerzo para ellas.

## La decisión que el agente no tomó por mí

La disposición del lanzador era una cuestión de gusto, así que el agente no eligió. Produjo un
mock en HTML con tres opciones y me preguntó. Esta es una captura de ese archivo:

![Tres maquetas del botón lanzador junto al botón de WhatsApp a 360 px: A es un icono redondo "AI" apilado sobre WhatsApp, B es una píldora con la etiqueta "Ask about Luis" apilada sobre él, C es la píldora colocada a su lado.](/blog/spec-driven-development/launcher-options.png)

Elegí la B, una píldora con etiqueta apilada sobre el botón de WhatsApp. Un botón solo con icono
se descubre menos, y la C queda justa a 360 px. La decisión entró en el spec como FR-002, con la
fecha. La funcionalidad 009 reemplazó después los botones apilados por un solo dock, y ese
cambio tuvo su propio spec.

## La constitución como barrera

La constitución es un archivo corto de reglas que toda especificación, plan y revisión debe
cumplir. Dos de sus reglas hicieron el trabajo en la 008. El Principio I fija el stack,
incluido Framer Motion para animación. El Principio II permite `"use client"` solo donde un
componente necesita interactividad. Coinciden con los dos primeros hallazgos de la lista de
arriba.

La regla de paridad es la que mostraría (texto original, en inglés):

> ### VI. Bilingual Parity (NON-NEGOTIABLE)
> Every user-facing string MUST exist in both English (EN) and Spanish (ES) and be served through
> the existing React Context language switcher (`LanguageContext`, `useLanguage`,
> `lib/translations.ts`). External i18n libraries MUST NOT be added. A feature is not done until
> both languages are complete. ...

Una parte de esa regla la hace cumplir el verificador de tipos. Los textos viven en un objeto
tipado, así que mientras escribía este artículo borré una clave de navegación de un idioma y
ejecuté `npx tsc --noEmit`:

```
src/lib/translations.ts(148,5): error TS2741: Property 'about' is
missing in type '{ experience: string; ... }' but required in
type '{ about: string; experience: string; ... }'.
```

Después restauré el archivo. Que la traducción se lea bien sigue siendo una revisión humana.

La constitución también me estorbó una vez. El Principio II enumeraba los archivos de `src/`, y
en la funcionalidad 007 una corrección necesitaba un hook nuevo. Con la redacción anterior eso
exigía una enmienda. Las enmiendas se versionan como una API, con un Sync Impact Report al
principio del archivo. Esta es la entrada de la versión 1.3.0:

```
- Version change: 1.2.0 -> 1.3.0 (MINOR: materially changed
  guidance in Principle II on when the structure list needs
  an amendment; owner decision 2026-11-07, raised by PR #10
  where a new hook file would otherwise have required an
  amendment)
```

Los archivos nuevos dentro de las carpetas existentes ya no necesitan una enmienda. Una carpeta
nueva de primer nivel o un cambio de la estructura sí la siguen necesitando.

## Dónde falló el proceso

Decisiones que nunca llegaron al spec. Tomé decisiones en la conversación, como aceptar un
riesgo o elegir una opción, y el spec y el plan no se actualizaron. El spec y el código se
fueron separando. La funcionalidad 008 terminó con un commit llamado "final reconciliation of
spec, plan and tasks" para arreglarlo a posteriori. La skill supervisora que ejecuta el proceso
ahora tiene una barrera antes del pull request (texto original, en inglés):

> Every decision made in conversation (waivers, accepted risks, owner choices) is written into
> spec.md or plan.md with the date and "owner"; no spec, plan or task claims something the
> shipped code contradicts.

Restos de plantilla. La plantilla del plan deja texto de relleno, y un plan sin editar parece
terminado. Una segunda barrera, en la etapa del plan, busca con grep en `plan.md` los
marcadores sobrantes (`REMOVE IF UNUSED`, `ACTION REQUIRED`, `Option 2`, `models/`,
`[FEATURE]`) antes de avanzar.

Ceremonia. Una ejecución completa son muchos pasos y mucha lectura, y no tengo una cifra de
sobrecarga que darte. Para una funcionalidad con comportamiento nuevo creo que vale la pena.
Para cambios pequeños, no.

## Cuándo lo omito y qué cambiaría

Una corrección de texto o un favicon no necesitan una especificación, y el último cambio de
favicon de este sitio no tiene carpeta de spec. Pero no he escrito un camino más ligero, y la
funcionalidad 010, un bug del menú y un título de página, pasó igualmente por todo el proceso.
Eso es lo primero que cambiaría.

Los demás cambios:

1. Definir un carril rápido para los cambios triviales desde el primer día.
2. Bloquear los commits hasta que lint pase, con un hook. Todavía no he agregado ese hook.
3. Poner los datos del mundo real, como la latencia y los límites de peticiones, en el spec
   desde el principio, en vez de dejar que el plan los adivine y que el análisis los detecte.

## Qué puedes copiar

Si quieres probar esto con un agente, tres cosas me funcionaron:

- Una constitución: una lista corta de reglas escritas con MUST y MUST NOT, contra las que se
  revisa cada especificación. Empieza con unas pocas.
- Un paso de analyze antes de implementar. No dejes que el agente escriba código mientras haya
  hallazgos CRITICAL o HIGH, y escribe las correcciones en los archivos, porque el informe
  desaparece al cerrarlo.
- Una persona que responde solo dos tipos de pregunta: gusto y datos sobre ti o tu sistema. Todo
  lo demás lo decide el agente y lo registra.

Después decide, cambio por cambio, si merece la ejecución completa. El widget de chat la
merecía. Un favicon no.
