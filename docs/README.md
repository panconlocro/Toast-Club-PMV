# Toast Club PMV - Documentación

Documentación completa del proyecto Toast Club.

## Contenido

- [Arquitectura](#arquitectura)
- [Modelos de Datos](#modelos-de-datos)
- [API REST](#api-rest)
- [Flujo de Estados](#flujo-de-estados)
- [Guías de Desarrollo](#guías-de-desarrollo)

## Arquitectura

Toast Club PMV es una aplicación de comunicación VR con arquitectura modular:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  VR Client  │
│    (SPA)    │     │  (FastAPI)  │     │   (Unity)   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                     │
      │                    │                     │
      └────────────────────┴─────────────────────┘
                    API REST
```

### Componentes

1. **Backend**: API REST monolítica con FastAPI
2. **Frontend**: SPA con vistas para Impulsador y Analista
3. **VR**: Cliente VR para experiencias inmersivas
4. **Docs**: Documentación del proyecto

## Modelos de Datos

### User (Usuario)

Representa usuarios del sistema (impulsadores y analistas).

```json
{
  "id": "usr_123456",
  "email": "usuario@toastclub.com",
  "name": "Juan Pérez",
  "role": "impulsador",  // "impulsador" o "analista"
  "created_at": "2025-12-09T18:00:00Z",
  "updated_at": "2025-12-09T18:00:00Z",
  "is_active": true
}
```

### Session (Sesión)

Representa una sesión VR de Toast Club.

```json
{
  "id": "ses_123456",
  "user_id": "usr_123456",
  "title": "Sesión de prueba VR",
  "description": "Primera sesión de práctica",
  "state": "created",  // Ver estados abajo
  "created_at": "2025-12-09T18:00:00Z",
  "updated_at": "2025-12-09T18:05:00Z",
  "started_at": "2025-12-09T18:10:00Z",
  "completed_at": null,
  "recording_id": "rec_123456",
  "survey_id": "srv_123456"
}
```

### Recording (Grabación)

Representa grabaciones de audio/video de las sesiones.

```json
{
  "id": "rec_123456",
  "session_id": "ses_123456",
  "file_path": "/recordings/ses_123456_audio.mp3",
  "file_size": 1048576,
  "duration": 300,
  "mime_type": "audio/mpeg",
  "created_at": "2025-12-09T18:00:00Z",
  "uploaded_at": "2025-12-09T18:15:00Z",
  "is_processed": false
}
```

### Survey (Encuesta)

Representa encuestas post-sesión.

```json
{
  "id": "srv_123456",
  "session_id": "ses_123456",
  "user_id": "usr_123456",
  "questions": {
    "q1": "¿Cómo calificarías la experiencia?",
    "q2": "¿Qué mejorarías?"
  },
  "responses": {
    "q1": "Excelente",
    "q2": "Más tiempo de práctica"
  },
  "created_at": "2025-12-09T18:00:00Z",
  "completed_at": "2025-12-09T18:25:00Z",
  "is_completed": true
}
```

## API REST

Base URL: `http://localhost:8000/api/v1`

### Endpoints de Usuarios

- `POST /users` - Crear usuario
- `GET /users` - Listar usuarios (query: `?role=impulsador`)
- `GET /users/{user_id}` - Obtener usuario
- `PUT /users/{user_id}` - Actualizar usuario
- `DELETE /users/{user_id}` - Eliminar usuario

### Endpoints de Sesiones

- `POST /sessions` - Crear sesión
- `GET /sessions` - Listar sesiones (query: `?user_id=usr_123`)
- `GET /sessions/{session_id}` - Obtener sesión
- `PUT /sessions/{session_id}` - Actualizar sesión
- `PATCH /sessions/{session_id}/state` - Actualizar estado (query: `?new_state=running`)
- `DELETE /sessions/{session_id}` - Eliminar sesión

### Endpoints de Grabaciones

- `POST /recordings` - Crear grabación
- `POST /recordings/upload` - Subir archivo (multipart/form-data)
- `GET /recordings` - Listar grabaciones (query: `?session_id=ses_123`)
- `GET /recordings/{recording_id}` - Obtener grabación
- `DELETE /recordings/{recording_id}` - Eliminar grabación

### Endpoints de Encuestas

- `POST /surveys` - Crear encuesta
- `GET /surveys` - Listar encuestas (queries: `?session_id=ses_123&user_id=usr_123`)
- `GET /surveys/{survey_id}` - Obtener encuesta
- `PUT /surveys/{survey_id}` - Actualizar encuesta (enviar respuestas)
- `DELETE /surveys/{survey_id}` - Eliminar encuesta

## Flujo de Estados

Las sesiones siguen un flujo de estados secuencial:

```
created
   ↓
ready_to_start
   ↓
running
   ↓
audio_uploaded
   ↓
survey_pending
   ↓
completed
```

### Descripción de Estados

1. **created**: Sesión creada pero no iniciada
2. **ready_to_start**: Sesión preparada para comenzar
3. **running**: Sesión en ejecución activa
4. **audio_uploaded**: Audio de la sesión subido
5. **survey_pending**: Esperando que se complete la encuesta
6. **completed**: Sesión finalizada completamente

## Guías de Desarrollo

### Configuración del Entorno

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
python -m http.server 8080
```

### Flujo de Trabajo

1. **Impulsador crea sesión**
   - Estado inicial: `created`
   - Frontend: `POST /api/v1/sessions`

2. **Preparar sesión**
   - Cambiar estado: `ready_to_start`
   - Frontend: `PATCH /api/v1/sessions/{id}/state?new_state=ready_to_start`

3. **Iniciar sesión VR**
   - Cambiar estado: `running`
   - VR Client se conecta y comienza experiencia

4. **Subir grabación**
   - Cambiar estado: `audio_uploaded`
   - VR Client: `POST /api/v1/recordings/upload`

5. **Solicitar encuesta**
   - Cambiar estado: `survey_pending`
   - Frontend: `POST /api/v1/surveys`

6. **Completar encuesta**
   - Cambiar estado: `completed`
   - Frontend: `PUT /api/v1/surveys/{id}` (con respuestas)
   - Frontend: `PATCH /api/v1/sessions/{id}/state?new_state=completed`

### Convenciones de Código

- **Backend**: PEP 8 para Python
- **Frontend**: Standard JS style
- **Commits**: Mensajes descriptivos en español
- **Branches**: feature/nombre-feature, fix/nombre-bug

### Testing

```bash
# Backend (futuro)
cd backend
pytest

# Frontend (futuro)
cd frontend
npm test
```

## Restricciones del MVP

- ❌ Sin sistema de pagos
- ❌ Sin suscripciones
- ❌ Sin multitenancy
- ❌ Sin IA integrada
- ❌ Sin autenticación (por ahora)
- ✅ Almacenamiento en memoria (migrable a DB)
- ✅ API REST completa
- ✅ Flujo de estados definido
- ✅ Frontend funcional

## Roadmap Futuro

### Fase 2
- Implementar base de datos (PostgreSQL)
- Añadir autenticación JWT
- Sistema de permisos por rol

### Fase 3
- Integración completa con VR
- Almacenamiento en la nube para grabaciones
- Análisis avanzado de datos

### Fase 4
- Integración de IA para análisis de audio
- Dashboard avanzado para analistas
- Notificaciones en tiempo real

## Licencia

MIT License - Ver archivo LICENSE en la raíz del proyecto.
