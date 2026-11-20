# NEURAL — instrucciones para Codex

## Objetivo
Construir una aplicación local para macOS de pensamiento visual centrada en la voz, red neuronal dinámica e importación de conocimiento propio. No transformar el producto en una presentación o un simple chat.

## Principios
- Voz continua de entrada y salida, interrupción de respuestas, latencia reducida y funcionamiento sin API de pago.
- Nunca afirmar que la app puede leer automáticamente la memoria privada o la sesión de voz nativa de ChatGPT.
- Todos los datos importados deben permanecer locales. No añadir telemetría, servicios externos ni subir conversaciones a repositorios.
- Probar el micrófono y mostrar estado de permisos; degradar de forma explícita cuando no exista soporte de reconocimiento.
- Las conexiones generadas por IA deben distinguirse de las relaciones originales del usuario.
- Accesibilidad: soporte de teclado, contraste, prefers-reduced-motion.
- Preservar la app Utilex del repositorio; editar exclusivamente la carpeta neural/.
- Ejecutar `npm run check` tras cada cambio.
- Nunca hacer commit de `neural/data/`, `.env`, `node_modules/` ni de archivos de exportación de ChatGPT.

## Instalación mínima
Sin dependencias npm externas; Node.js >=20, Ollama opcional pero recomendado. `bash scripts/setup-macos.sh` en Mac para instalar dependencias mediante Homebrew. Para la voz: reconocimiento nativo del navegador donde esté disponible; añadir y verificar fallback Whisper local como siguiente iteración.

## Skill local recomendada
Leer `.agents/skills/neural-voice-graph/SKILL.md` antes de desarrollar nuevas interacciones.
