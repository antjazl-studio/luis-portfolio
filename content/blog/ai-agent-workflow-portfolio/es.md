---
title: "Cómo construí un flujo de trabajo con agentes de IA para mi portafolio"
summary: "Cómo se modifica este portafolio mediante Spec Kit, una constitución, una cuenta bot con permisos mínimos, pull requests, CI y revisión humana."
date: 2026-11-05
draft: true
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

## Una cuenta bot con permisos mínimos

El agente no hace push al repositorio principal. Usa una cuenta bot separada con los menores
privilegios necesarios. El bot trabaja en su propio fork del repositorio y propone los cambios
mediante pull requests, igual que lo haría un colaborador externo.

<!-- REVIEW: owner to confirm the exact permissions the bot account has -->

## Integración continua

<!-- REVIEW: owner to confirm that passing lint and build is required before merging -->
Cada pull request ejecuta un flujo de trabajo que instala las dependencias, ejecuta el linter y
compila el sitio. Un cambio que no pasa el lint o la compilación no se fusiona.

## Protección de ramas

<!-- REVIEW: owner to confirm how branch protection is configured on the main branch -->
La rama principal está protegida, por lo que los cambios llegan mediante pull requests y no con
pushes directos.

## Despliegues de vista previa

<!-- REVIEW: owner to confirm how Vercel preview deployments are set up for pull requests -->
Los pull requests se pueden previsualizar en Vercel antes de que algo llegue a producción. Así
también se puede revisar contenido en borrador, como esta publicación, en un entorno realista sin
que sea público.

## Una persona revisa cada cambio

Nada de esto saca a la persona del proceso. Leo cada pull request y decido qué se fusiona. El
agente acelera el trabajo; las especificaciones, la constitución, las verificaciones y la
revisión son lo que lo mantiene bajo control.
