# API Design Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

#### POST /auth/login
Login to get access token.

**Request:**
```json
{
  "email": "impulsador@toastclub.com",
  "password": "impulsador123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "impulsador@toastclub.com",
  "rol": "IMPULSADOR"
}
```

#### POST /auth/logout
Logout (client should discard token).

#### GET /auth/me
Get current user information (requires authentication).

## Session Endpoints

#### POST /sessions
Create a new training session.

**Request:**
```json
{
  "datos_participante": {
    "nombre": "Juan Pérez",
    "edad_aproximada": 25,
    "email_opcional": "juan@example.com"
  },
  "texto_seleccionado": "The quick brown fox jumps over the lazy dog."
}
```

**Response:**
```json
{
  "id": 1,
  "session_code": "abc123xyz",
  "datos_participante": {
    "nombre": "Juan Pérez",
    "edad_aproximada": 25,
    "email_opcional": "juan@example.com"
  },
  "texto_seleccionado": "The quick brown fox jumps over the lazy dog.",
  "estado": "created",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null
}
```

#### GET /sessions/{session_id}
Get session details by ID.

#### PATCH /sessions/{session_id}/state
Update session state.

**Request:**
```json
{
  "new_state": "running"
}
```

Valid state transitions:
- `created` → `ready_to_start`
- `ready_to_start` → `running`
- `running` → `audio_uploaded`
- `audio_uploaded` → `survey_pending`
- `survey_pending` → `completed`

## Recording Endpoints

#### POST /sessions/{session_id}/recording
Create a recording for a session (mock implementation).

**Request:**
```json
{
  "audio_url": "/uploads/recording_123.wav",
  "duracion_segundos": 120.5,
  "formato": "wav",
  "metadata_carga": {
    "filename": "recording_123.wav"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "session_id": 1,
  "audio_url": "/uploads/recording_123.wav",
  "duracion_segundos": 120.5,
  "formato": "wav",
  "created_at": "2024-01-15T10:35:00Z"
}
```

#### POST /sessions/{session_id}/upload
Upload an audio file (placeholder implementation).

**Request:** multipart/form-data with `file` field

## Survey Endpoints

#### POST /sessions/{session_id}/survey
Submit survey responses for a session.

**Request:**
```json
{
  "respuestas_json": {
    "experiencia_general": "excelente",
    "facilidad_uso": "muy_facil",
    "utilidad_entrenamiento": "muy_util",
    "volveria_usar": "si",
    "mejoras_sugeridas": "Agregar más textos de práctica"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "session_id": 1,
  "respuestas_json": { ... },
  "created_at": "2024-01-15T10:40:00Z"
}
```

#### GET /sessions/{session_id}/survey
Get all surveys for a session.

## Dataset Endpoints (ANALISTA only)

#### GET /dataset
Get complete dataset with all sessions.

**Response:**
```json
{
  "dataset": [
    {
      "session_id": 1,
      "session_code": "abc123xyz",
      "participant_name": "Juan Pérez",
      "participant_age": 25,
      "participant_email": "juan@example.com",
      "texto_seleccionado": "...",
      "estado": "completed",
      "created_at": "2024-01-15T10:30:00Z",
      "recordings_count": 1,
      "recordings": ["/uploads/recording_123.wav"],
      "surveys_count": 1,
      "survey_responses": [{ ... }]
    }
  ],
  "total_sessions": 1
}
```

#### GET /dataset/export
Export dataset as CSV file.

**Response:** CSV file download

## Error Responses

All endpoints may return error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error, invalid state transition)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Test Accounts

For development and testing:

- **IMPULSADOR**: 
  - Email: `impulsador@toastclub.com`
  - Password: `impulsador123`

- **ANALISTA**: 
  - Email: `analista@toastclub.com`
  - Password: `analista123`
