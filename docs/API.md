# Toast Club PMV - API Reference

Documentación detallada de la API REST.

## Base URL

```
http://localhost:8000/api/v1
```

## Autenticación

⚠️ **MVP**: No requiere autenticación. En producción se implementará JWT o OAuth2.

## Formato de respuestas

### Respuestas exitosas

```json
{
  "id": "...",
  "campo": "valor",
  ...
}
```

### Respuestas de error

```json
{
  "detail": "Mensaje de error descriptivo"
}
```

## Status Codes

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Eliminación exitosa
- `400 Bad Request` - Datos inválidos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Users API

### POST /users

Crear un nuevo usuario.

**Request Body:**
```json
{
  "email": "usuario@toastclub.com",
  "name": "Juan Pérez",
  "role": "impulsador"
}
```

**Response:** `201 Created`
```json
{
  "id": "usr_123456",
  "email": "usuario@toastclub.com",
  "name": "Juan Pérez",
  "role": "impulsador",
  "created_at": "2025-12-09T18:00:00Z",
  "updated_at": "2025-12-09T18:00:00Z",
  "is_active": true
}
```

### GET /users

Listar usuarios.

**Query Parameters:**
- `role` (opcional): Filtrar por rol ("impulsador" o "analista")

**Response:** `200 OK`
```json
[
  {
    "id": "usr_123456",
    "email": "usuario@toastclub.com",
    "name": "Juan Pérez",
    "role": "impulsador",
    "created_at": "2025-12-09T18:00:00Z",
    "updated_at": "2025-12-09T18:00:00Z",
    "is_active": true
  }
]
```

### GET /users/{user_id}

Obtener un usuario específico.

**Response:** `200 OK`
```json
{
  "id": "usr_123456",
  "email": "usuario@toastclub.com",
  "name": "Juan Pérez",
  "role": "impulsador",
  "created_at": "2025-12-09T18:00:00Z",
  "updated_at": "2025-12-09T18:00:00Z",
  "is_active": true
}
```

### PUT /users/{user_id}

Actualizar un usuario.

**Request Body:**
```json
{
  "name": "Juan Pérez García",
  "is_active": false
}
```

**Response:** `200 OK`

### DELETE /users/{user_id}

Eliminar un usuario.

**Response:** `204 No Content`

---

## Sessions API

### POST /sessions

Crear una nueva sesión.

**Request Body:**
```json
{
  "user_id": "usr_123456",
  "title": "Sesión de prueba VR",
  "description": "Primera sesión de práctica"
}
```

**Response:** `201 Created`
```json
{
  "id": "ses_123456",
  "user_id": "usr_123456",
  "title": "Sesión de prueba VR",
  "description": "Primera sesión de práctica",
  "state": "created",
  "created_at": "2025-12-09T18:00:00Z",
  "updated_at": "2025-12-09T18:00:00Z",
  "started_at": null,
  "completed_at": null,
  "recording_id": null,
  "survey_id": null
}
```

### GET /sessions

Listar sesiones.

**Query Parameters:**
- `user_id` (opcional): Filtrar por usuario

**Response:** `200 OK`
```json
[
  {
    "id": "ses_123456",
    "user_id": "usr_123456",
    "title": "Sesión de prueba VR",
    "description": "Primera sesión de práctica",
    "state": "created",
    "created_at": "2025-12-09T18:00:00Z",
    "updated_at": "2025-12-09T18:00:00Z",
    "started_at": null,
    "completed_at": null,
    "recording_id": null,
    "survey_id": null
  }
]
```

### GET /sessions/{session_id}

Obtener una sesión específica.

**Response:** `200 OK`

### PUT /sessions/{session_id}

Actualizar una sesión.

**Request Body:**
```json
{
  "title": "Sesión actualizada",
  "description": "Descripción modificada"
}
```

**Response:** `200 OK`

### PATCH /sessions/{session_id}/state

Actualizar el estado de una sesión.

**Query Parameters:**
- `new_state` (requerido): Nuevo estado de la sesión
  - Valores: `created`, `ready_to_start`, `running`, `audio_uploaded`, `survey_pending`, `completed`

**Response:** `200 OK`
```json
{
  "id": "ses_123456",
  "user_id": "usr_123456",
  "title": "Sesión de prueba VR",
  "description": "Primera sesión de práctica",
  "state": "running",
  "created_at": "2025-12-09T18:00:00Z",
  "updated_at": "2025-12-09T18:10:00Z",
  "started_at": "2025-12-09T18:10:00Z",
  "completed_at": null,
  "recording_id": null,
  "survey_id": null
}
```

### DELETE /sessions/{session_id}

Eliminar una sesión.

**Response:** `204 No Content`

---

## Recordings API

### POST /recordings

Crear una entrada de grabación.

**Request Body:**
```json
{
  "session_id": "ses_123456",
  "file_path": "/recordings/audio.mp3",
  "mime_type": "audio/mpeg"
}
```

**Response:** `201 Created`

### POST /recordings/upload

Subir un archivo de grabación.

**Content-Type:** `multipart/form-data`

**Query Parameters:**
- `session_id` (requerido): ID de la sesión asociada

**Form Data:**
- `file`: Archivo a subir

**Response:** `201 Created`
```json
{
  "id": "rec_123456",
  "session_id": "ses_123456",
  "file_path": "/recordings/rec_123456_audio.mp3",
  "file_size": null,
  "duration": null,
  "mime_type": "audio/mpeg",
  "created_at": "2025-12-09T18:00:00Z",
  "uploaded_at": "2025-12-09T18:15:00Z",
  "is_processed": false
}
```

### GET /recordings

Listar grabaciones.

**Query Parameters:**
- `session_id` (opcional): Filtrar por sesión

**Response:** `200 OK`

### GET /recordings/{recording_id}

Obtener una grabación específica.

**Response:** `200 OK`

### DELETE /recordings/{recording_id}

Eliminar una grabación.

**Response:** `204 No Content`

---

## Surveys API

### POST /surveys

Crear una nueva encuesta.

**Request Body:**
```json
{
  "session_id": "ses_123456",
  "user_id": "usr_123456",
  "questions": {
    "q1": "¿Cómo calificarías la experiencia?",
    "q2": "¿Qué mejorarías?"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "srv_123456",
  "session_id": "ses_123456",
  "user_id": "usr_123456",
  "questions": {
    "q1": "¿Cómo calificarías la experiencia?",
    "q2": "¿Qué mejorarías?"
  },
  "responses": {},
  "created_at": "2025-12-09T18:00:00Z",
  "completed_at": null,
  "is_completed": false
}
```

### GET /surveys

Listar encuestas.

**Query Parameters:**
- `session_id` (opcional): Filtrar por sesión
- `user_id` (opcional): Filtrar por usuario

**Response:** `200 OK`

### GET /surveys/{survey_id}

Obtener una encuesta específica.

**Response:** `200 OK`

### PUT /surveys/{survey_id}

Actualizar una encuesta (enviar respuestas).

**Request Body:**
```json
{
  "responses": {
    "q1": "Excelente",
    "q2": "Más tiempo de práctica"
  }
}
```

**Response:** `200 OK`
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

### DELETE /surveys/{survey_id}

Eliminar una encuesta.

**Response:** `204 No Content`

---

## Health Check

### GET /

Información de la API.

**Response:** `200 OK`
```json
{
  "name": "Toast Club PMV",
  "version": "0.1.0",
  "status": "running",
  "docs": "/docs"
}
```

### GET /health

Estado de salud de la API.

**Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

---

## Documentación Interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
