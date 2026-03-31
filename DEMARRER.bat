@echo off
setlocal

cd /d "%~dp0"

if exist "%ProgramFiles%\nodejs\node.exe" (
  set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

if defined ProgramFiles(x86) if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
)

echo --- Lancement du site de Streaming Sportif ---
echo Dossier du projet : %CD%

if not exist "package.json" (
  echo Erreur : package.json introuvable dans ce dossier.
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Erreur : Node.js n'est pas installe.
  echo Installe la version Windows de Node.js, puis relance ce fichier.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Erreur : npm n'est pas installe.
  echo Reinstalle Node.js pour Windows afin d'ajouter npm au PATH.
  exit /b 1
)

if not exist "node_modules" (
  echo Dependances absentes, installation en cours...
  call npm install
  if errorlevel 1 exit /b 1
)

call npm run dev
