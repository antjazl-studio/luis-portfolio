---
title: "Escribir a mano el loop de un agente de IA antes de usar un framework"
summary: "Cómo funciona el asistente de IA de este portafolio: un loop escrito a mano con el SDK de openai, por qué envía el perfil completo en vez de usar RAG y embeddings, garantías movidas del prompt al código y dos maneras en que mi eval me mintió."
date: 2026-11-20
draft: true
---

Cuando un reclutador le pregunta al asistente de este portafolio qué he hecho con Azure, todo lo que diga sobre mí tiene que salir de mi perfil. Un modelo que adivina es un bug que no puedo publicar. Una de sus suposiciones fue un correo electrónico armado con mi nombre.

Escribí el loop del agente a mano con el SDK de `openai` y sin framework, porque quería ver qué esconde un framework antes de empezar a usar uno. De ahí salieron tres reglas que volvería a usar. Cuando la base de conocimiento es pequeña, envía toda en vez de recuperar fragmentos. Saca del prompt y pasa al código cada garantía que importe. Prueba tu eval antes de confiar en su puntaje.

El agente corre en FastAPI detrás del widget de chat de este sitio, y el código es público en [portfolio-agent](https://github.com/antjazl-studio/portfolio-agent). Cómo trabaja un agente de IA en el repositorio de este portafolio está en [un artículo anterior](/blog/ai-agent-workflow-portfolio).

## El agente en 60 segundos

Un agente es un loop. Le envías al modelo la conversación y una lista de herramientas. Si el modelo pide una herramienta, la ejecutas y le devuelves el resultado. Repites hasta que responde en texto plano o llegas a un límite de pasos.

Este agente tiene dos herramientas: `search_profile` y `get_contact_info`. El modelo es `deepseek/deepseek-v3.2`, elegido con una variable de entorno para poder cambiarlo sin tocar el código. El SDK de `openai` habla con OpenRouter cambiando solo la URL base y la clave, y FastAPI transmite la respuesta al widget como Server-Sent Events.

## Qué me enseñó escribir el loop a mano

Puse mal el orden de los mensajes. El mensaje del asistente que pide las herramientas tiene que entrar en el historial antes de los resultados, o el modelo no puede asociar resultados con pedidos. DeepSeek aceptó mi error. `gpt-5-nano` lo rechazó con un error 400.

El código del loop donde ocurre eso (recortado):

```python
for step in range(1, MAX_STEPS + 1):
    ...
    if not tool_calls:
        messages.append({"role": "assistant", "content": step_text.strip()})
        yield {"type": "done"}
        return

    # The assistant turn that requested the tools MUST go into the history
    # before the tool results, or the model can't match results to requests.
    messages.append(
        {
            "role": "assistant",
            "content": step_text,
            "tool_calls": [...],
        }
    )
```

La conversación es una lista de mensajes, y esa lista es la memoria del agente. Cada turno la envía completa otra vez, así que el costo crece con cada pregunta. La API no guarda estado: el widget conserva la conversación y envía hasta 20 mensajes de hasta 2,000 caracteres cada uno.

Hay dos límites obligatorios: 6 pasos por loop y 800 tokens de salida por respuesta, porque un loop que nunca termina gasta dinero.

La última lección fue un bug. El texto que el modelo escribía en el mismo turno que una llamada a herramienta se perdía en silencio. Supongo que un framework lo habría resuelto por mí, pero todavía no he usado uno, así que no puedo asegurarlo. Ahora hay una prueba que lo cubre.

## RAG y embeddings en 60 segundos, y por qué los omití

RAG viene de retrieval-augmented generation. Antes de que el modelo responda, un programa busca los fragmentos más relevantes para la pregunta dentro de un cuerpo de texto más grande y los pone en el prompt. El modelo responde entonces a partir de esos fragmentos y no de memoria.

La forma habitual de encontrar fragmentos relevantes son los embeddings. Un modelo convierte un texto en una lista de números, de modo que los textos con significado parecido quedan cerca. Calculas los embeddings de tus documentos una vez, calculas el de cada pregunta cuando llega, y tomas los fragmentos más cercanos.

Este agente no usa ninguno de los dos. Probé dos versiones de `search_profile`:

- El experimento 1a fue una búsqueda ingenua por palabras clave que devolvía las tres secciones principales del perfil.
- El experimento 1b devolvía el perfil completo en cada llamada. El perfil tiene 422 palabras, unos 800 tokens según un comentario del código.

En mis evals, 1b salió mejor en fundamentación. También tengo una razón estructural. Para responder "¿Luis ha trabajado con Kubernetes?" con un no, el modelo tiene que ver el perfil completo. La recuperación devuelve lo que se parece a la pregunta y pasa por alto, sin avisar, lo que no está.

Enviar todo tiene un costo. A veces el modelo llamaba a `search_profile` tres veces en un turno, lo que enviaba los mismos 800 tokens tres veces, así que ahora el resultado entra en la conversación una sola vez. La versión por palabras clave sigue en `agent.py` como `search_profile_keyword`. No construí una versión con embeddings, así que no sé cómo puntuaría en la misma suite. La agregaría cuando la base de conocimiento supere el contexto, y probaría las preguntas cuya respuesta correcta es "eso no está".

## Mover las garantías del prompt al código

En mis ejecuciones dirigidas, el modelo se saltaba la herramienta e inventaba, en algunas respuestas, un correo de Gmail verosímil armado con mi nombre. Por mi cuenta fueron de 2 a 4 de cada 10 ejecuciones, y no guardé esas ejecuciones. El primer arreglo fue forzar la herramienta en el primer paso:

```python
tool_choice="required" if step == 1 else "auto",
```

Con esa línea, las mismas ejecuciones dirigidas salieron limpias 10 de 10 veces, por mi cuenta. El segundo arreglo fue un guardrail de salida en código. Cada correo y cada enlace de una respuesta tiene que estar en una lista permitida, y una respuesta que no pasa la revisión se reemplaza por un mensaje seguro con mis datos de contacto reales.

El streaming lo complicó, porque no puedes retirar un texto que el visitante ya leyó. El guardrail tiene que ver un correo o un enlace antes de que se muestre cualquier parte, así que el texto se libera una oración a la vez. Un correo o un enlace nunca contiene espacios en blanco, de modo que uno completo siempre cae dentro de una sola oración (recortado):

```python
SENTENCE_BOUNDARY = re.compile(r"[.!?:]\s+|\n")

class GuardedText:
    """Holds streamed text until a sentence is complete, then checks it."""
    ...
    def feed(self, delta: str) -> str:
        self.pending += delta
        boundaries = list(SENTENCE_BOUNDARY.finditer(self.pending))
        if not boundaries:
            return ""
        cut = boundaries[-1].end()
        ready, self.pending = self.pending[:cut], self.pending[cut:]
        return self._check(ready)
```

Dos arreglos menores siguen la misma idea. Las negativas antes eran texto libre, y algunas ofrecían ayuda con habilidades que no están en mi perfil, así que ahora hay una sola oración fija de rechazo. Los fallos del proveedor también se manejan en código. Una llamada del eval se colgó 90 segundos y otra terminó en un crash. Ahora hay un timeout de 30 segundos, reintentos del SDK, un reintento de la llamada al modelo cuando el visitante aún no ha visto texto, y una respuesta de respaldo fija después de eso.

## El eval me mintió dos veces

Los evals usan promptfoo. Son 13 casos, cada uno ejecutado 3 veces, así que una corrida completa son 39 respuestas. El agente es `deepseek/deepseek-v3.2`. El evaluador es Claude Haiku 4.5 con temperatura 0, un modelo distinto del que se prueba, y trabaja con criterios escritos.

Los puntajes no subieron en línea recta. Estas son corridas de la primera suite de 11 casos, 33 respuestas cada una, del historial de promptfoo:

| Corrida (hora local) | Aprobadas |
|---|---|
| 2026-11-10 16:46, primera corrida completa | 23 de 33 |
| 2026-11-10 17:20 | 27 de 33 |
| 2026-11-10 17:27 | 25 de 33 |
| 2026-11-10 17:31 | 19 de 33 |
| 2026-11-11 18:14 | 27 de 33 |
| 2026-11-12 09:17 | 31 de 33 |
| 2026-11-12 09:53 | 33 de 33 |

El 19 lo atribuyo al evaluador, no al agente. La suite de 12 casos sacó 36 de 36 dos veces y la de 13 casos sacó 38 de 39 dos veces. Otras dos corridas dieron cero porque falló la infraestructura, así que no dicen nada del agente.

La primera mentira fue un puntaje perfecto. Mi mensaje de respaldo contiene mi correo real, así que la comprobación "el único correo de una respuesta es el real" pasaba incluso cuando el guardrail había actuado. Tenía 36 de 36 mientras dos de tres respuestas de un caso estaban degradadas. El arreglo fue una métrica aparte:

```yaml
    # The output guardrail is a safety net, not an answer. If it fires, the model
    # failed underneath, even when the safe answer would satisfy other assertions.
    - type: javascript
      value: "!output.startsWith(\"Sorry, I couldn't answer that reliably\")"
      metric: guardrail_clean
```

La segunda mentira vino del evaluador, y se equivocaba en ambos sentidos. Era demasiado permisivo: "usually replies the same day" pasaba. También era demasiado estricto: "Kubernetes isn't in his profile" fallaba, y una negativa simple se marcaba como filtración de configuración. Así que probé al evaluador. Una segunda suite le pasa 12 respuestas fijas por la misma rúbrica, 7 que deben fallar y 5 que deben pasar. La vuelvo a ejecutar cada vez que cambio la rúbrica, y en su última corrida las 12 se clasificaron como se esperaba.

El evaluador también gasta tokens. En las tres últimas corridas completas, la evaluación usó cerca de tres cuartos de los tokens que usó el agente.

## Cuánto cuesta y qué tan rápido es

En las tres últimas corridas completas del eval, una respuesta usó en promedio entre 2,190 y 2,400 tokens de entrada y unos 100 de salida, repartidos en dos llamadas al modelo. La entrada domina porque el perfil se envía otra vez. A $0.25 de entrada y $0.38 de salida por millón de tokens, los precios de `deepseek-v3.2` en OpenRouter cuando lo elegí, son unos $0.0006 por respuesta, o cerca de 1,600 respuestas por dólar (estimación).

La API tiene capas de protección: CORS, un límite de peticiones por IP, un presupuesto diario y, en el diseño, un tope duro en la clave de OpenRouter como última línea. Los valores por defecto del código son 10 peticiones por minuto y 100 por día por IP, y un presupuesto de $1 al día. Los valores desplegados vienen de variables de entorno.

El presupuesto expuso un bug más. El uso de tokens se contaba en un único diccionario global, así que dos visitantes respondidos al mismo tiempo habrían mezclado sus cuentas. Los evals hacen una pregunta a la vez y no podían verlo. Ahora cada petición tiene su propio contador.

Para la latencia tengo dos vistas, y las condiciones importan. En el eval, con 4 peticiones en paralelo, la respuesta mediana tardó entre 21 y 27 segundos y el rango fue de 10 a 46 segundos. El 2026-11-20 medí 3 peticiones individuales a la API de producción con una sola pregunta. La llamada a la herramienta apareció a los 1.6 a 2.6 segundos, el primer texto a los 2.4 a 3.5 segundos, y la respuesta terminó a los 5.0 a 8.0 segundos. Tres peticiones no son un benchmark.

## Qué cambiaría y qué puedes copiar

LangGraph es lo siguiente. Todavía no lo he usado, y los evals son la manera de comprobar que el cambio no empeora nada. Los resultados del eval viven en el historial de promptfoo de mi máquina, no en el repositorio, así que solo yo puedo verificar estos números. Debería guardar un resumen de cada corrida.

Si construyes tu primer agente de cara al público, tres cosas me sirvieron:

- Si tu base de conocimiento cabe en el contexto, envía toda, y prueba preguntas cuya respuesta correcta sea "eso no está".
- Saca del prompt y pasa al código cada garantía que importe: una herramienta forzada, una lista permitida, una sola negativa fija, límites de pasos y de tokens.
- Prueba tu eval antes de confiar en su puntaje. Pásale respuestas fijas con veredictos conocidos y agrega una métrica que te avise cuando actuó tu red de seguridad.

Probé de verdad un solo modelo, `deepseek/deepseek-v3.2`, y `gpt-5-nano` solo hasta que devolvió respuestas vacías.
