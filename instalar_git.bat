@echo off
TITLE INSTALAR GIT
CLS

ECHO ==========================================
ECHO      INSTALADOR AUTOMATICO DE GIT
ECHO ==========================================
ECHO.
ECHO El error que te ha salido es porque tu ordenador
ECHO no tiene instalado "Git" (la herramienta para subir cosas).
ECHO.
ECHO Vamos a intentar instalarlo automaticamente.
ECHO.
ECHO 1. Te pedira permisos (pantallazo azul o ventana emergente). DI QUE SI.
ECHO 2. Ten paciencia, puede tardar 1 o 2 minutos.
ECHO.
PAUSE

ECHO [1] Descargando e Instalando Git...
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements

ECHO.
ECHO ==========================================
ECHO        IMPORTANTE - LEEME
ECHO ==========================================
ECHO.
ECHO Si arriba pone "Successfully installed" o similar:
ECHO.
ECHO 1. CIERRA ESTA VENTANA NEGRA.
ECHO 2. CIERRA CUALQUIER OTRA VENTANA NEGRA DE LA APP.
ECHO 3. !VUELVE A ABRIR "reparar_y_subir.bat"!
ECHO.
ECHO (Es necesario cerrar para que Windows se entere del cambio).
ECHO.
PAUSE
