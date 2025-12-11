# Cómo conseguir tus Claves de Google (Paso a Paso)

Para que la App pueda leer tus correos, necesitas permiso de Google. Es gratis y se hace así:

## Paso 1: Crear el Proyecto
1. Entra en [Google Cloud Console](https://console.cloud.google.com/).
2. Inicia sesión con tu Gmail.
3. Arriba a la izquierda, al lado del logo de Google, haz clic en el desplegable y dale a **"Nuevo Proyecto"**.
4. Ponle de nombre `Auto-Draft` y dale a **CREAR**.

## Paso 2: Activar Gmail
1. En el buscador de arriba, escribe **"Gmail API"** y selecciónalo.
2. Dale al botón azul **HABILITAR**.

## Paso 3: Pantalla de Consentimiento
1. En el menú de la izquierda, ve a **"Credenciales"** (o "APIs y servicios" > "Credenciales").
2. Te pedirá configurar la pantalla de consentimiento. Dale a **"Configurar pantalla de consentimiento"**.
3. Elige **Externo** y dale a CREAR.
4. Rellena solo lo obligatorio:
   - **Nombre de la aplicación**: `Auto-Draft`
   - **Correo de asistencia**: Tu email.
   - **Información de contacto del desarrollador**: Tu email.
5. Dale a **Guardar y Continuar** varias veces hasta terminar.

## Paso 4: Crear las Claves
1. Ve otra vez a **"Credenciales"** (menú izquierda).
2. Arriba, dale a **+ CREAR CREDENCIALES** > **ID de cliente de OAuth**.
3. **Tipo de aplicación**: Aplicación web.
4. **Nombre**: `Auto-Draft Web`.
5. **Orígenes autorizados de JavaScript**: `http://localhost:3000`
6. **URI de redireccionamiento autorizados**: `http://localhost:3000/api/auth/callback`
   *(Es muy importante que copies este enlace exactamente igual)*.
7. Dale a **CREAR**.

## Paso 5: Copiar y Pegar
Te saldrá una ventana con dos códigos muy largos:
- **Tu ID de cliente**
- **Tu secreto de cliente**

1. Copia el primero.
2. Abre el archivo `.env.local` en tu carpeta del proyecto (ábrelo con el Bloc de Notas).
3. Pégalo donde dice `GOOGLE_CLIENT_ID=...`.
4. Haz lo mismo con el "Secreto" en `GOOGLE_CLIENT_SECRET=...`.
5. Guarda el archivo.

¡Listo! Cierra la ventana negra de la app y vuelve a abrirla.
