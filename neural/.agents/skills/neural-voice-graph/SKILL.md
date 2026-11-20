---
name: neural-voice-graph
description: Desarrollo y pruebas de una aplicación de conocimiento interactiva voice-first, grafo animado y Ollama local, sin APIs comerciales.
---

# NEURAL Voice Graph

## Aplicación
Usar esta skill cuando se modifique interfaz, reconocimiento o salida de voz, parsing de conocimiento, grafos o conectividad con un modelo local.

## Proceso de implementación
1. Identificar camino completo de audio: permiso de micrófono → transcripción → detección de fin de turno → inferencia local → voz de salida y actualización visual.
2. Probar estado permitido, denegado y navegador sin SpeechRecognition. Nunca ocultar fallos.
3. Usar salida semántica estructurada: conceptos, conexiones, nivel de confianza, fuente y explicación; validar antes de dibujar.
4. Mantener el lienzo dinámico con `requestAnimationFrame`, pero evitar renderizado innecesario en pestañas ocultas.
5. Priorizar lectura, interacción y fluidez, no efectos decorativos.
6. Evitar envío de datos de ChatGPT exportados a servicios remotos.
7. Ejecutar `npm run check` y comprobar visualmente carga inicial, zoom, arrastre, selección, importación, voz y TTS.
8. En planes sin API, no representar ChatGPT como proveedor de inferencia de la app: Ollama es independiente.

## Siguiente trabajo
Agregar Whisper.cpp streaming verdaderamente local para evitar la dependencia del servicio Web Speech; medir latencia en Mac Apple Silicon; permitir activar/desactivar salida de voz e interrumpir al volver a hablar.
