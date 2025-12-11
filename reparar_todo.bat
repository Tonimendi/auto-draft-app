@echo off
TITLE Auto-Draft AI - REPARACION
CLS

ECHO ========================================================
ECHO      REPARANDO INSTALACION (LIMPIEZA TOTAL)
ECHO ========================================================
ECHO.
ECHO [1/4] Borrando instalacion corrupta (node_modules)...
IF EXIST "node_modules" (
    rmdir /s /q "node_modules"
)
IF EXIST "package-lock.json" (
    del "package-lock.json"
)

ECHO [2/4] Limpiando cache de NPM...
call npm.cmd cache clean --force

ECHO [3/4] Reinstalando TODO desde cero (esto tardara unos minutos)...
ECHO Por favor, ten paciencia.
call npm.cmd install
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] La instalacion fallo. Revisa tu internet.
    PAUSE
    EXIT
)

ECHO [4/4] Instalacion completada con exito.
ECHO.
ECHO Ya puedes cerrar esta ventana y volver a usar run_app.bat
ECHO O presiona una tecla para iniciar la app ahora mismo.
PAUSE

call npm.cmd run dev
