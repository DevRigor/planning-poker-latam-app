# Planning Poker App

Una aplicación de Planning Poker desarrollada con Next.js, Firebase Realtime Database y Firebase Auth.

## Características

- ✅ Autenticación con Google usando Firebase Auth
- ✅ Sala única para todos los usuarios
- ✅ Votación privada hasta que todos voten
- ✅ Valores de votación: 1, 2, 3, 5, 8, ☕
- ✅ Lista de participantes en tiempo real
- ✅ Reseteo de rondas
- ✅ Interfaz responsiva
- ✅ Actualizaciones en tiempo real
- ✅ **Timeout automático de 5 minutos**
- ✅ **Logout automático por inactividad**
- ✅ Limpieza automática de participantes

## Funcionalidad de Timeout

### ⏰ Sistema de Timeout Automático

La aplicación incluye un sistema de timeout que garantiza que las votaciones se mantengan activas:

- **Tiempo límite**: 5 minutos para votar
- **Indicador visual**: Countdown con barra de progreso
- **Estados visuales**:
  - 🟢 **Normal** (>1 min): Indicador azul
  - 🟡 **Urgente** (<1 min): Indicador amarillo "¡Vota pronto!"
  - 🔴 **Crítico** (<30s): Indicador rojo "¡Serás desconectado!"

### 🚪 Logout Automático

Cuando un usuario no vota dentro del tiempo límite:

1. **Logout automático**: La sesión se cierra completamente
2. **Limpieza de sala**: El usuario es removido de la sala actual
3. **Mensaje informativo**: Se muestra un mensaje explicando la desconexión
4. **Re-login requerido**: Debe iniciar sesión nuevamente para continuar

### 💡 Experiencia de Usuario

- **Advertencias progresivas**: El usuario recibe avisos visuales antes del logout
- **Mensaje post-logout**: Explicación clara de por qué fue desconectado
- **Fácil re-ingreso**: Un clic para volver a iniciar sesión
- **Tip educativo**: Consejos para evitar futuras desconexiones

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── layout.tsx          # Layout principal con AuthProvider
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales
├── components/
│   ├── LoginCard.tsx       # Componente de login con mensaje de timeout
│   ├── PlanningRoom.tsx    # Sala principal
│   ├── ParticipantsList.tsx # Lista de participantes
│   ├── ParticipantStatistics.tsx # Estadísticas de participantes
│   ├── VoteStatistics.tsx  # Estadísticas de votación
│   ├── VoteTimeoutIndicator.tsx # Indicador de timeout
│   └── EditNameDialog.tsx  # Dialog para editar nombre
├── contexts/
│   └── AuthContext.tsx     # Context de autenticación
├── hooks/
│   ├── useRoom.ts          # Hook para manejar la sala
│   └── useVoteTimeout.ts   # Hook para manejar timeouts
├── lib/
│   └── firebase.ts         # Configuración de Firebase
├── types/
│   └── index.ts            # Tipos TypeScript
└── .env.example            # Variables de entorno de ejemplo
\`\`\`

## Configuración de Firebase

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (desactiva Google Analytics si no lo necesitas)
3. Una vez creado el proyecto, continúa con la configuración

### 2. Configurar Authentication

1. En Firebase Console, ve a Build > Authentication > Get started
2. En la pestaña "Sign-in method", habilita "Google" como proveedor de autenticación
3. Configura un correo electrónico de soporte
4. Guarda los cambios

### 3. Configurar Realtime Database

1. Ve a Build > Realtime Database > Create database
2. Selecciona "Start in test mode" para desarrollo (cambiar a reglas más restrictivas en producción)
3. Selecciona la ubicación de la base de datos más cercana a tus usuarios
4. Haz clic en "Enable"
5. Configura las reglas de seguridad:

\`\`\`json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "room": {
      ".read": true,
      ".write": true,
      "participants": {
        "$uid": {
          ".write": "auth != null"
        }
      },
      "votes": {
        "$uid": {
          ".write": "auth != null"
        }
      },
      "gameState": {
        ".write": "auth != null"
      }
    }
  }
}
\`\`\`

### 4. Registrar la aplicación web

1. En la página principal del proyecto, haz clic en el icono de web (</>) para añadir una aplicación web
2. Asigna un nombre a tu aplicación (ej. "Planning Poker")
3. Marca la opción "Also set up Firebase Hosting" si planeas usar Firebase Hosting
4. Haz clic en "Register app"
5. Copia las credenciales de configuración que se muestran

### 5. Configurar dominios autorizados

1. Ve a Authentication > Settings > Authorized domains
2. Añade los dominios desde los que se accederá a la aplicación:
   - `localhost` (para desarrollo local)
   - Tu dominio de producción (ej. `your-app.vercel.app`)

## Instalación y Configuración

### 1. Clonar e instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Completa las variables con tus credenciales de Firebase:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://xxx-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:xxx
\`\`\`

### 3. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## Solución de problemas comunes

### Error: Firebase: Error (auth/configuration-not-found)

Este error puede ocurrir por varias razones:

1. **Variables de entorno incorrectas**: Verifica que todas las variables en `.env.local` estén correctamente configuradas
2. **Proveedor de Google no habilitado**: Asegúrate de haber habilitado el proveedor de Google en Firebase Authentication
3. **Dominio no autorizado**: Verifica que el dominio desde el que accedes esté en la lista de dominios autorizados
4. **Cookies bloqueadas**: Asegúrate de que tu navegador permita cookies de terceros para la autenticación

### Error: PERMISSION_DENIED

Este error puede ocurrir por:

1. **Reglas de seguridad restrictivas**: Asegúrate de que las reglas permitan operaciones de lectura/escritura
2. **Usuario no autenticado**: Verifica que el usuario esté correctamente autenticado
3. **Operaciones después del logout**: Evita operaciones de base de datos después de cerrar sesión

### Desconexión por Timeout

Si fuiste desconectado automáticamente:

1. **Es normal**: El sistema protege contra usuarios inactivos
2. **Vuelve a iniciar sesión**: Un clic en "Iniciar sesión con Google"
3. **Vota más rápido**: Tienes 5 minutos para votar
4. **Mantente activo**: Los usuarios que ya votaron no tienen timeout

### Error: Firebase: Error (auth/popup-closed-by-user)

Este error ocurre cuando el usuario cierra la ventana emergente de autenticación antes de completar el proceso. No requiere acción.

## Estructura de la Base de Datos

La aplicación usa la siguiente estructura en Firebase Realtime Database:

\`\`\`json
{
  "room": {
    "participants": {
      "userId1": {
        "id": "userId1",
        "name": "John Doe",
        "hasVoted": true,
        "joinedAt": 1640995200000,
        "voteStartedAt": 1640995200000
      },
      "userId2": {
        "id": "userId2", 
        "name": "Jane Smith",
        "hasVoted": false,
        "joinedAt": 1640995300000,
        "voteStartedAt": 1640995200000
      }
    },
    "votes": {
      "userId1": "5",
      "userId2": "3"
    },
    "gameState": {
      "isRevealed": false,
      "roundId": "round_1640995200000",
      "createdAt": 1640995200000,
      "voteStartedAt": 1640995200000
    }
  }
}
\`\`\`

## Deploy en Vercel

### 1. Conectar con GitHub

1. Sube tu código a un repositorio de GitHub
2. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
3. Importa tu repositorio

### 2. Configurar variables de entorno

En Vercel Dashboard:
1. Ve a tu proyecto > Settings > Environment Variables
2. Agrega todas las variables de `.env.local`

### 3. Deploy

Vercel desplegará automáticamente tu aplicación.

### 4. Configurar dominio en Firebase

1. Ve a Firebase Console > Authentication > Settings
2. En "Authorized domains", agrega tu dominio de Vercel (ej. `your-app.vercel.app`)

## Uso de la Aplicación

1. **Login**: Los usuarios inician sesión con su cuenta de Google
2. **Unirse a la sala**: Automáticamente se unen a la sala única
3. **Votar**: Seleccionan un valor (1, 2, 3, 5, 8, ☕) **dentro de 5 minutos**
4. **Esperar**: Los votos permanecen ocultos hasta que todos voten
5. **Ver resultados**: Una vez que todos votan, se revelan los resultados
6. **Nueva ronda**: Cualquier usuario puede resetear para una nueva votación
7. **Timeout**: Los usuarios inactivos son deslogueados automáticamente

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **Firebase Auth** - Autenticación con Google
- **Firebase Realtime Database** - Base de datos en tiempo real
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes de UI
- **TypeScript** - Tipado estático
