@echo off
TITLE Auto-Draft AI
CLS

ECHO ========================================================
ECHO          AUTO-DRAFT AI - INICIANDO
ECHO ========================================================
ECHO.
ECHO [1] Verificando sistema...

:: Force install if node_modules is missing
IF NOT EXIST "node_modules" (
    ECHO [AVISO] Faltan archivos, instalando rapido...
    call npm.cmd install
)

ECHO [2] Abriendo App...
TIMEOUT /T 3 /NOBREAK >nul
START http://localhost:3000

ECHO.
ECHO [INFO] La app esta lista. Minimiza esta ventana.
ECHO.

call npm.cmd run dev

PAUSE
