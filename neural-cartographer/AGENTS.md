# Instrucciones para Codex — NEURAL

Proyecto base: Cartographer, submódulo fijado en `vendor/cartographer`. No desarrollar otra interfaz de red desde cero. Preparar copia editable mediante `bash scripts/prepare.sh` dentro de `neural-cartographer/`. Preservar la licencia MIT y la atribución del proyecto original.

Objetivo: diálogo natural en español con entrada/salida de voz y un grafo semántico 3D que crece y pueda explorarse por palabra o comando. Construir con Ollama y Neo4j locales sin API de pago; privacidad obligatoria. Se prioriza latencia, fluidez y navegación, no efectos cosméticos.

Antes de declarar que funciona:
- Ejecutar `npm ci`, `npm run build` y una prueba real en Chrome/macOS.
- Probar permiso y denegación de micrófono, inicio de entrevista, voz española, parada y reanudación de escucha, actualización real del grafo, selección de nodos y persistencia.
- Medir recursos con cientos de nodos y evitar que el renderizado bloquee el audio.
- Implementar Whisper.cpp + VAD/TTS local para la versión offline real y capacidad de interrupción de voz.
- Implementar importación de chats de manera local, sin datos privados en GitHub.
- Nunca modificar los archivos Utilex del repositorio.

Estado inicial: se adapta Web Speech a español con turnos y salida TTS. No equivale todavía a full-duplex ni a ChatGPT Voice.
