# Toast Club PMV - Frontend

SPA (Single Page Application) simple para el proyecto Toast Club, con vistas para Impulsador y Analista.

## Características

- **SPA simple**: HTML, CSS y JavaScript vanilla (sin frameworks)
- **Dos roles**: Impulsador y Analista
- **Diseño responsive**: Adaptado para desktop y móvil
- **Integración con API**: Conexión REST con el backend

## Estructura

```
frontend/
├── index.html              # Página principal - selección de rol
├── pages/
│   ├── impulsador.html     # Panel del impulsador
│   └── analista.html       # Panel del analista
├── css/
│   └── style.css           # Estilos principales
├── js/
│   ├── api.js              # Cliente API REST
│   ├── impulsador.js       # Lógica del impulsador
│   └── analista.js         # Lógica del analista
└── README.md               # Esta documentación
```

## Instalación y uso

### Opción 1: Servidor HTTP simple con Python

```bash
# Desde el directorio frontend
python -m http.server 8080
```

Luego abrir: http://localhost:8080

### Opción 2: Servidor HTTP con Node.js

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar desde el directorio frontend
http-server -p 8080
```

Luego abrir: http://localhost:8080

### Opción 3: VS Code Live Server

1. Instalar la extensión "Live Server" en VS Code
2. Click derecho en `index.html` → "Open with Live Server"

## Configuración

### URL del Backend

Por defecto, el frontend se conecta a `http://localhost:8000/api/v1`.

Para cambiar esto, editar `js/api.js`:

```javascript
const API_BASE_URL = 'http://tu-servidor:puerto/api/v1';
```

## Funcionalidades

### Panel Impulsador

- **Crear sesiones**: Formulario para crear nuevas sesiones VR
- **Listar sesiones**: Ver todas las sesiones del impulsador
- **Gestionar estados**: Avanzar sesiones a través de sus estados:
  - created → ready_to_start → running → audio_uploaded → survey_pending → completed
- **Eliminar sesiones**: Borrar sesiones no completadas

### Panel Analista

- **Estadísticas generales**:
  - Total de sesiones
  - Sesiones completadas
  - Usuarios activos
  - Encuestas realizadas

- **Análisis de sesiones**:
  - Tabla con todas las sesiones
  - Filtro por estado
  - Información detallada: fechas, duración, audio, encuestas

## Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con gradientes y animaciones
- **JavaScript ES6+**: Código modular y async/await
- **Fetch API**: Comunicación con el backend

## Notas de desarrollo

- **Sin autenticación**: El MVP no incluye login/registro. Se usa un user_id simulado.
- **Almacenamiento**: No hay localStorage. Todos los datos vienen del backend.
- **Validación**: Validación básica en el frontend. La validación principal está en el backend.
- **Error handling**: Manejo básico de errores con mensajes al usuario.

## Mejoras futuras

- Implementar autenticación de usuarios
- Añadir formularios de encuestas dinámicos
- Implementar subida real de archivos de audio
- Añadir gráficos y visualizaciones
- Implementar notificaciones en tiempo real
- Añadir tests unitarios y e2e

## Licencia

MIT License - Ver archivo LICENSE en la raíz del proyecto.
