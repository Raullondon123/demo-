# NEURAL · Cartographer Edition

NEURAL adopta el proyecto real [Cartographer](https://github.com/ho3h/cartographer), con licencia MIT, fijado al commit `e09bdf2142433d5fe015f362c168895619d205cc` como submódulo. Nuestro desarrollo se mantiene en la rama `feat/neural-cartographer`, aislado de la app Utilex.

## Preparar y probar en Mac

Se necesita Node.js 20+, Python 3, Git y Ollama local. El servidor Neo4j de Cartographer puede aprovisionarse automáticamente al primer arranque (~500 MB de descarga).

```bash
git clone --branch feat/neural-cartographer --recurse-submodules https://github.com/Raullondon123/demo-.git neural-project
cd neural-project/neural-cartographer
bash scripts/prepare.sh
cd workspace
npm ci
npm run dev
```

En otra terminal instala/inicia Ollama y descarga el modelo `qwen3:4b`:

```bash
ollama pull qwen3:4b
```

Abre `http://localhost:3000` en Chrome, luego **Settings** para seleccionar **Ollama** y el modelo instalado. Autoriza el micrófono y usa **Ask me questions**. La red gráfica es el motor 3D original de Cartographer, que recibe asociaciones durante la conversación.

## Qué está adaptado

- Reconocimiento en español de Perú (`es-PE`) mediante Web Speech.
- Entrevista orientada a explorar conceptos e ideas de desarrollo de producto.
- Respuestas habladas con la síntesis de voz del navegador.
- Reapertura del micrófono después de hablar, para evitar que el TTS sea capturado como nueva pregunta.
- Cartographer y su núcleo Three.js, Neo4j y Ollama se reutilizan, no se reescriben.

## Limitaciones reales

**No es aún conversación full-duplex.** El reconocimiento y las respuestas de voz son turnos alternados. Web Speech puede usar infraestructura del navegador; no equivale a audio 100 % offline. Ollama funciona localmente, y Neo4j local conserva las relaciones. La voz nativa de ChatGPT y su memoria automática no están conectadas a esta app. Importación del historial completo de ChatGPT aún pendiente. El código está preparado en GitHub, pero necesita validación en tu Mac para comprobar micrófono, velocidad y funcionamiento de extremo a extremo.

Nunca subas tus conversaciones, claves o archivos `.env.local` al repositorio. El `workspace/` editable está excluido de Git.

## Siguiente fase de ingeniería

1. Prueba integral en Mac y medición de latencia, incluyendo memoria/CPU/GPU.
2. Sustituir Web Speech por transcripción local Whisper.cpp con VAD; incorporar TTS local y capacidad de interrupción.
3. Incorporar comandos de voz para explorar un nodo, volver, cruzar ramas y generar hipótesis.
4. Importador privado de exportaciones de ChatGPT, con procedencia de cada relación.
5. Automatización de controles de rendimiento con densidad de nodos alta.

Código original © 2025 Cartographer, licencia MIT. Consulta `vendor/cartographer/LICENSE` y la licencia en la copia de trabajo.
