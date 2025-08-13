# Planning Poker App

Una aplicación de Planning Poker desarrollada con Next.js 15, React 19, Firebase Realtime Database y Firebase Auth.

## Características

- ✅ **React 19 Compatible** - Usa las últimas características de React
- ✅ **Next.js 15** - Framework moderno con App Router
- ✅ Autenticación con Google usando Firebase Auth
- ✅ Salas únicas y compartibles
- ✅ Votación privada hasta que todos voten
- ✅ Valores de votación: 1, 2, 3, 5, 8, ☕
- ✅ Lista de participantes en tiempo real
- ✅ Reseteo de rondas
- ✅ Interfaz responsiva
- ✅ Actualizaciones en tiempo real
- ✅ **Timeout automático de 5 minutos**
- ✅ **Logout automático por inactividad**
- ✅ Limpieza automática de participantes
- ✅ **URLs compartibles** - Cada sala tiene su propia URL
- ✅ **Eliminación automática** - Salas vacías se eliminan automáticamente

## Tecnologías Utilizadas

### Core
- **Next.js 15.1.3** - Framework de React con App Router
- **React 19.1.1** - Biblioteca de UI con las últimas características
- **TypeScript 5.7.2** - Tipado estático
- **Firebase 10.14.1** - Backend como servicio

### UI y Estilos
- **Tailwind CSS 3.4.17** - Framework de CSS utility-first
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Iconos modernos
- **class-variance-authority** - Gestión de variantes de clases

### Dependencias Principales

\`\`\`json
{
  "dependencies": {
    "next": "15.1.3",
    "react": "19.1.1",
    "react-dom": "19.1.1",
    "firebase": "^10.14.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  }
}
\`\`\`

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

## Salas Compartibles

### 🔗 URLs Únicas

Cada sala tiene su propia URL única y compartible:

- **Formato**: `https://tu-app.com/room/rapido-equipo-123`
- **Generación automática**: IDs únicos y fáciles de recordar
- **Validación**: URLs inválidas se limpian automáticamente

### 📤 Compartir Salas

- **Copiar URL**: Botón para copiar la URL de la sala
- **Compartir nativo**: Usa la API de compartir del navegador cuando está disponible
- **QR Code**: (Futuro) Generar códigos QR para fácil acceso móvil

### 🧹 Limpieza Automática

- **Salas vacías**: Se eliminan automáticamente después de 30 segundos
- **Detección inteligente**: Distingue entre desconexiones temporales y abandono real
- **Notificaciones**: Los usuarios son informados cuando una sala es eliminada

## Instalación y Configuración

### 1. Requisitos

- **Node.js 18+** - Recomendado Node.js 20 LTS
- **npm, yarn, o pnpm** - Gestor de paquetes
- **Cuenta de Firebase** - Para autenticación y base de datos

### 2. Clonar e instalar dependencias

\`\`\`bash
# Clonar el repositorio
git clone <tu-repositorio>
cd planning-poker-app

# Instalar dependencias (sin warnings de React 19)
npm install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Completa las variables con tus credenciales de Firebase:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://xxx-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:xxx
\`\`\`

### 4. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

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
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        "participants": {
          "$uid": {
            ".write": "auth != null && auth.uid == $uid"
          }
        },
        "votes": {
          "$uid": {
            ".write": "auth != null && auth.uid == $uid"
          }
        },
        "gameState": {
          ".write": "auth != null"
        }
      }
    }
  }
}
\`\`\`

### 4. Configurar dominios autorizados

1. Ve a Authentication > Settings > Authorized domains
2. Añade los dominios desde los que se accederá a la aplicación:
   - `localhost` (para desarrollo local)
   - Tu dominio de producción (ej. `your-app.vercel.app`)

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── layout.tsx          # Layout principal con AuthProvider
│   ├── page.tsx            # Página principal con manejo de URLs
│   └── globals.css         # Estilos globales
├── components/
│   ├── ui/                 # Componentes UI compatibles con React 19
│   ├── LoginCard.tsx       # Componente de login mejorado
│   ├── PlanningRoom.tsx    # Sala principal
│   ├── RoomSelector.tsx    # Selector de salas
│   ├── ParticipantsList.tsx # Lista de participantes
│   ├── VoteStatistics.tsx  # Estadísticas de votación
│   └── VoteTimeoutIndicator.tsx # Indicador de timeout
├── contexts/
│   └── AuthContext.tsx     # Context de autenticación
├── hooks/
│   ├── useRoom.ts          # Hook para manejar salas
│   └── useVoteTimeout.ts   # Hook para manejar timeouts
├── lib/
│   ├── firebase.ts         # Configuración de Firebase
│   ├── roomUtils.ts        # Utilidades para salas
│   └── roomCleanup.ts      # Limpieza automática de salas
├── types/
│   └── index.ts            # Tipos TypeScript
└── .env.example            # Variables de entorno de ejemplo
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

### 🏠 Página Principal
1. **Login**: Los usuarios inician sesión con su cuenta de Google
2. **Selector de salas**: Crear nueva sala o unirse a una existente

### 🏢 Crear Sala
1. **Clic en "Crear Sala"**: Genera automáticamente un ID único
2. **Compartir**: Copia la URL o usa el botón de compartir nativo
3. **Acceso inmediato**: Entra automáticamente a la sala creada

### 🚪 Unirse a Sala
1. **Por ID**: Ingresa el ID de la sala (ej. `rapido-equipo-123`)
2. **Por URL**: Pega la URL completa de la sala
3. **Validación**: URLs inválidas se detectan y limpian automáticamente

### 🗳️ Votación
1. **Seleccionar voto**: Elige un valor (1, 2, 3, 5, 8, ☕) **dentro de 5 minutos**
2. **Esperar**: Los votos permanecen ocultos hasta que todos voten
3. **Ver resultados**: Una vez que todos votan, se revelan automáticamente
4. **Nueva ronda**: Cualquier usuario puede resetear para una nueva votación

### ⏰ Sistema de Timeout
1. **Indicador visual**: Muestra tiempo restante para votar
2. **Advertencias**: Avisos progresivos antes del logout automático
3. **Logout automático**: Usuarios inactivos son deslogueados automáticamente
4. **Re-login**: Fácil acceso para volver a la sala

## Solución de problemas comunes

### ✅ Sin warnings de dependencias

Esta versión está optimizada para React 19 y no debería mostrar warnings de peer dependencies.

### Error: Firebase: Error (auth/configuration-not-found)

Este error puede ocurrir por varias razones:

1. **Variables de entorno incorrectas**: Verifica que todas las variables en `.env.local` estén correctamente configuradas
2. **Proveedor de Google no habilitado**: Asegúrate de haber habilitado el proveedor de Google en Firebase Authentication
3. **Dominio no autorizado**: Verifica que el dominio desde el que accedes esté en la lista de dominios autorizados

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

## Estructura de la Base de Datos

La aplicación usa la siguiente estructura en Firebase Realtime Database:

\`\`\`json
{
  "rooms": {
    "rapido-equipo-123": {
      "participants": {
        "userId1": {
          "id": "userId1",
          "name": "John Doe",
          "hasVoted": true,
          "joinedAt": 1640995200000,
          "voteStartedAt": 1640995200000
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

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.
