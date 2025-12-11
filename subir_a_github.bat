@echo off
TITLE Subir a GitHub
CLS

ECHO ==========================================
ECHO      ASISTENTE DE SUBIDA A GITHUB
ECHO ==========================================
ECHO.
ECHO Este script subira todo tu codigo a GitHub.
ECHO.
ECHO 1. Asegurate de haber creado el repositorio vacio en GitHub.
ECHO 2. Ten a mano la URL (empieza por https://github.com/...)
ECHO.
PAUSE

SET /P REPO_URL="Pega aqui la URL de GitHub y pulsa Enter: "

ECHO.
ECHO [1] Inicializando Git...
call git init
call git branch -m main

ECHO [2] Asergurando identidad basica (solo local)...
call git config user.email "auto-draft@user.com"
call git config user.name "Auto Draft User"

ECHO [3] Guardando archivos...
call git add .
call git commit -m "Initial commit of Auto-Draft App"

ECHO [4] Conectando con la nube...
call git remote add origin %REPO_URL%

ECHO [5] Subiendo codigo...
call git push -u origin main

ECHO.
ECHO ==========================================
ECHO    SI NO HUBO ERRORES EN ROJO...
ECHO          ¡YA ESTA EN LA NUBE!
ECHO ==========================================
ECHO.
PAUSE
