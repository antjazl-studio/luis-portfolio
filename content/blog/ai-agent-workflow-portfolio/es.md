---
title: "Cómo construí un flujo de trabajo con agentes de IA para mi portafolio"
summary: "Cómo se modifica este portafolio mediante Spec Kit, una constitución, una cuenta bot con permisos mínimos, pull requests, CI y revisión humana."
date: 2026-11-05
---

Este portafolio se mantiene con la ayuda de un agente de programación con IA. No quería que eso
significara "el agente edita lo que quiera", así que el flujo de trabajo se apoya en unas pocas
barreras explícitas.

## Primero las especificaciones, con Spec Kit

Cada funcionalidad empieza como una especificación escrita y no como un prompt. Uso Spec Kit,
que divide el trabajo en pasos: una especificación de lo que debe hacer la funcionalidad, un plan
de cómo construirla, una lista de tareas y, solo entonces, la implementación. Cada paso deja un
archivo en el repositorio, de modo que el razonamiento detrás de un cambio se puede revisar junto
con el cambio mismo.

## Una constitución que el agente debe respetar

El repositorio contiene una constitución: un documento corto con las reglas que toda
especificación, plan y cambio deben cumplir. Cubre aspectos como el stack tecnológico, las
convenciones de componentes, el estilo visual y el requisito de que todo texto visible exista en
inglés y en español. Cuando un plan entra en conflicto con la constitución, cambia el plan, no
la regla.

## Una cuenta bot sin acceso al repositorio principal

El agente no hace push al repositorio principal. Usa una cuenta bot separada que no tiene ningún
acceso a él. Como el repositorio es público, el bot lo bifurca (fork), sube su trabajo a su propio
fork y abre un pull request, igual que cualquier colaborador externo.

## Integración continua

Cada pull request ejecuta un flujo de GitHub Actions que instala las dependencias con `npm ci`,
ejecuta el linter y compila el sitio. Debe pasar para que el pull request pueda fusionarse.

## Protección de ramas

Un ruleset de GitHub en la rama principal exige un pull request con una aprobación y exige que
pase la verificación de compilación. También bloquea los force push y la eliminación de la rama,
y su lista de excepciones está vacía, así que las reglas aplican a todos, incluido yo.

## Despliegues de vista previa

Cada pull request recibe un despliegue de vista previa en Vercel. Como los pull requests del bot
vienen de un fork, yo debo autorizar cada despliegue primero; es la protección de forks de Vercel.
El contenido en borrador, como esta publicación, solo es visible en las vistas previas y nunca en
producción, así que puedo revisarlo en un entorno realista antes de que sea público.

## Una persona revisa cada cambio

Nada de esto saca a la persona del proceso. Solo yo apruebo y fusiono los pull requests, y
fusionar a la rama principal es lo que dispara el despliegue a producción. El agente acelera el
trabajo; las especificaciones, la constitución, las verificaciones y la revisión son lo que lo
mantiene bajo control.
