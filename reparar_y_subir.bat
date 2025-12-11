@echo off
TITLE REPARAR Y SUBIR A GITHUB
CLS

ECHO ==========================================
ECHO      REPARADOR DE GITHUB - AUTO DRAFT
ECHO ==========================================
ECHO.
ECHO Al parecer la subida anterior fallo. Vamos a arreglarlo.
ECHO.
ECHO IMPORTANTE: Cuando le des a ENTER, es posible que te salga
ECHO una ventanita pidiendo tu usuario y contrasena de GitHub.
ECHO !Mirala y rellenala!
ECHO.
PAUSE

SET /P REPO_URL="Pega aqui la URL de GitHub OTRA VEZ y pulsa Enter: "

ECHO.
ECHO [1] Limpiando intentos anteriores...
rmdir /s /q .git

ECHO [2] Iniciando Git desde cero...
call git init
call git branch -m main

ECHO [3] Guardando archivos...
call git config user.email "auto-draft@user.com"
call git config user.name "Auto Draft User"
call git add .
call git commit -m "Reparacion y Subida Inicial"

ECHO [4] Conectando con la nube...
call git remote add origin %REPO_URL%

ECHO [5] SUBIENDO (Atento a la ventana emergente)...
call git push --force -u origin main

ECHO.
ECHO ==========================================
ECHO SI ABAJO PONE "To https://github.com..." y "Done"
ECHO ENTONCES TODO HA SALIDO BIEN.
ECHO.
ECHO SI PONE "ERROR", COPIAME LO QUE DICE.
ECHO ==========================================
ECHO.
PAUSE
