#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Este instalador está preparado para macOS. Para Linux instala Node >=20 y Ollama manualmente."
  exit 1
fi
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew no está instalado: https://brew.sh"
  echo "Por seguridad, instala Homebrew desde su sitio oficial y vuelve a ejecutar este script."
  exit 1
fi
echo "Instalando Node.js y Ollama con Homebrew..."
brew install node ollama
echo "Dependencias instaladas. Intentando iniciar Ollama como servicio local..."
brew services start ollama || echo "Inicia Ollama manualmente si el servicio no se inició."
echo "Descargando un modelo de lenguaje local. Requiere varios GB de espacio y conexión a Internet..."
ollama pull qwen3:4b || echo "La descarga del modelo falló; puedes reintentar con: ollama pull qwen3:4b"
echo
echo "NEURAL está preparado. Dentro del directorio neural ejecuta: npm start"
echo "Abre http://localhost:4173 y permite el micrófono en el navegador."
echo "NOTA: El reconocimiento nativo del navegador puede depender de servicios de su proveedor."
