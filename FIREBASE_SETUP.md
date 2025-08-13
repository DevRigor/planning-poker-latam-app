# Configuración de Firebase para Planning Poker

## Pasos para configurar tu proyecto de Firebase

### 1. Habilitar Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `planning-poker-v0`
3. En el menú lateral, ve a **Build > Authentication**
4. Haz clic en **Get started**
5. Ve a la pestaña **Sign-in method**
6. Habilita **Google** como proveedor:
   - Haz clic en **Google**
   - Activa el toggle **Enable**
   - Configura un email de soporte (tu email)
   - Haz clic en **Save**

### 2. Configurar Realtime Database

1. En Firebase Console, ve a **Build > Realtime Database**
2. Haz clic en **Create database**
3. Selecciona **Start in test mode** (para desarrollo)
4. Selecciona la ubicación más cercana (us-central1 recomendado)
5. Haz clic en **Enable**

### 3. Configurar reglas de seguridad

Una vez creada la base de datos, configura las reglas:

1. Ve a la pestaña **Rules** en Realtime Database
2. Reemplaza las reglas con:

\`\`\`json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
\`\`\`

3. Haz clic en **Publish**

### 4. Configurar dominios autorizados

1. Ve a **Authentication > Settings**
2. En la sección **Authorized domains**, asegúrate de que estén incluidos:
   - `localhost` (para desarrollo local)
   - `v0.dev` (para preview en v0)
   - Tu dominio de producción cuando despliegues

### 5. Verificar configuración

Tu configuración actual es:
- **Project ID**: planning-poker-v0
- **Auth Domain**: planning-poker-v0.firebaseapp.com
- **Database URL**: https://planning-poker-v0-default-rtdb.firebaseio.com/
- **App ID**: 1:146704816058:web:f078fa4b0e4af8cbff6f83

## Estructura de datos esperada

La aplicación creará automáticamente esta estructura en tu Realtime Database:

\`\`\`json
{
  "rooms": {
    "rapido-equipo-123": {
      "participants": {
        "userId1": {
          "id": "userId1",
          "name": "Usuario 1",
          "hasVoted": false,
          "joinedAt": 1640995200000
        }
      },
      "votes": {
        "userId1": "5"
      },
      "gameState": {
        "isRevealed": false,
        "roundId": "round_1640995200000",
        "createdAt": 1640995200000,
        "voteStartedAt": 1640995200000
      },
      "roomInfo": {
        "id": "rapido-equipo-123",
        "createdAt": 1640995200000,
        "createdBy": "userId1"
      }
    }
  }
}
\`\`\`

## Solución de problemas

### Error: "auth/configuration-not-found"
- Verifica que el proveedor de Google esté habilitado en Authentication
- Asegúrate de que el dominio esté en la lista de dominios autorizados

### Error: "Permission denied"
- Verifica que las reglas de Realtime Database permitan lectura/escritura para usuarios autenticados
- Asegúrate de estar autenticado antes de intentar acceder a los datos

### La aplicación no se conecta
- Verifica que Realtime Database esté habilitado
- Comprueba que la URL de la base de datos sea correcta: `https://planning-poker-v0-default-rtdb.firebaseio.com/`
- Revisa la consola del navegador para errores específicos

### Error: "Database URL not found"
- Asegúrate de que la URL de la base de datos esté incluida en la configuración
- Verifica que la Realtime Database esté habilitada en tu proyecto
- La URL debe ser exactamente: `https://planning-poker-v0-default-rtdb.firebaseio.com/`
