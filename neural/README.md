# NEURAL · Living Knowledge

**Aplicación local para Mac**: red sináptica animada, conversación por voz, exploración espacial y base de conocimiento privada. **No requiere OpenAI API ni servicios de pago.**

> Estado: prototipo funcional de desarrollo, no una integración oficial con la voz o memoria de ChatGPT.

## Probar en tu Mac

1. [Descarga la rama NEURAL](https://github.com/Raullondon123/demo-/tree/feat/neural-voice-graph/neural) o abre el repositorio en Codex y selecciona `feat/neural-voice-graph`.
2. En Terminal, desde la carpeta `neural`, ejecuta `bash scripts/setup-macos.sh`. Necesita [Homebrew](https://brew.sh), conexión a Internet, espacio para un modelo de aproximadamente unos GB y autorización para las instalaciones.
3. Ejecuta `npm start` y abre **http://localhost:4173** en Chrome. El servidor solo escucha en 127.0.0.1.
4. Pulsa **INICIAR CONVERSACIÓN** y autoriza el micrófono. Si el navegador no permite reconocimiento continuo, NEURAL lo notificará.
5. Para incorporar datos propios, exporta tu historial desde ChatGPT y selecciona **IMPORTAR CHATGPT**, eligiendo `conversations.json` (del ZIP descomprimido).

**Importante:** no se ha instalado nada automáticamente en tu Mac. La instalación requiere ejecutar el script en tu propio equipo. No ejecutes scripts de repositorios que no hayas revisado.

## Arquitectura

- **Frontend:** HTML, CSS y Canvas 2D nativos, sin dependencias npm, con zoom, paneo, arrastre, impulsos luminosos y agrupaciones semánticas.
- **Voz:** Web Speech API del navegador para entrada, SpeechSynthesis para salida. Hay reanudación de escucha entre turnos y estado de permisos.
- **Conocimiento e IA:** servidor Node local + modelo `qwen3:4b` mediante Ollama. Se pide salida JSON estructurada con hipótesis de relaciones.
- **Persistencia:** `data/graph.json`, guardado solo en tu Mac y excluido de Git.
- **Importación ChatGPT:** lee `conversations.json` **en tu navegador** y crea hasta 2000 nodos basados en títulos de conversaciones. Todavía **no** analiza todos los mensajes ni sincroniza automáticamente el historial.
- **Pruebas:** `npm run check`.

## Límites y privacidad

- El reconocimiento Web Speech no es uniformemente local: determinados navegadores pueden procesar audio en servicios del proveedor. Para voz íntegramente offline falta implementar Whisper.cpp como backend de transcripción.
- El modelo Ollama se ejecuta localmente. Las relaciones generadas son propuestas, no conocimiento verificado.
- Este proyecto **no usa la voz del modelo ChatGPT ni accede a la memoria privada** de la aplicación.
- No se deben publicar exportaciones de conversaciones ni el directorio `data` en GitHub.
- La primera versión trabaja por turnos de voz; **no ofrece aún full duplex de baja latencia** con interrupción natural. Esa es una tarea prioritaria.

## Próximas mejoras (priorizadas)

1. Sustituir Web Speech por Whisper.cpp local y detector de actividad vocal (VAD) para eliminar dependencia del navegador.
2. TTS local con interrupción mientras el usuario habla; medir tiempos desde fin de frase a primera respuesta.
3. Extraer entidades y relaciones del contenido completo de conversaciones exportadas, con trazabilidad, fechas y deduplicación.
4. Mejorar la navegación por agrupaciones densas y la calidad de conexión semántica.
5. Empaquetar con Tauri para Mac tras estabilizar audio y pruebas.

## Estructura

```
neural/
  index.html
  server.mjs
  package.json
  AGENTS.md
  src/app.js
  src/style.css
  scripts/setup-macos.sh
  .agents/skills/neural-voice-graph/SKILL.md
  tests/server.test.mjs
```

**Codex:** abre esta rama y lee `AGENTS.md` y la skill del proyecto antes de continuar.
