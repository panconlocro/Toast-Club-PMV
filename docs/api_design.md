# Toast Club PMV – Diseño de API REST (Unity + Web)

Este documento describe el contrato actual de la API REST implementada por el backend FastAPI.
Está pensado para compartirlo con el equipo que desarrolla la app de RV en Unity.

## URLs base

- Base API: `http://localhost:8000/api/v1`
- Swagger (documentación interactiva): `http://localhost:8000/docs`
- Chequeo de salud: `GET http://localhost:8000/health`

## Autenticación y roles

La autenticación es por JWT (Bearer).

Header:
```
Authorization: Bearer <access_token>
```

Los roles se guardan en el usuario y se incluyen dentro del token como `role`. Roles actuales:

- `IMPULSADOR`
- `ANALISTA`

Restricción por rol (PMV actual):

- Endpoints de dataset requieren `ANALISTA`
- Descarga de audio (presigned URL) requiere `ANALISTA`

## Máquina de estados de sesión

El campo de estado de la sesión es `estado` (string). Valores permitidos:

- `created`
- `ready_to_start`
- `running`
- `audio_uploaded`
- `survey_pending`
- `completed`

Transiciones válidas (validadas por el backend):

- `created` → `ready_to_start`
- `ready_to_start` → `running`
- `running` → `audio_uploaded`
- `audio_uploaded` → `survey_pending`
- `survey_pending` → `completed`

Expectativa para Unity:

- Unity normalmente “entra” a una sesión usando `session_code`, y luego usa `session_id` para el resto de llamadas.
- Unity sube el audio usando el endpoint `upload` del backend (multipart).

## Respuestas comunes / errores

La mayoría de errores tienen esta forma:

```json
{ "detail": "..." }
```

Códigos comunes:

- `200` OK
- `201` Creado
- `400` Input inválido / transición de estado inválida
- `401` No autorizado (token inválido o faltante)
- `403` Prohibido (rol)
- `404` No encontrado
- `500` Error del servidor

---

## Endpoints de autenticación

### POST `/auth/login`

Inicio de sesión y obtención de token.

Solicitud:

```json
{
  "email": "impulsador@toastclub.com",
  "password": "impulsador123"
}
```

Respuesta:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user_id": 1,
  "email": "impulsador@toastclub.com",
  "rol": "IMPULSADOR"
}
```

### GET `/auth/me`

Devuelve la información del usuario actual (requiere Bearer token).

Respuesta:

```json
{
  "id": 1,
  "email": "impulsador@toastclub.com",
  "rol": "IMPULSADOR"
}
```

### POST `/auth/logout`

Logout basado en token. El backend devuelve un mensaje; el cliente debe descartar el token.

---

## Endpoints de sesión

### POST `/sessions`

Crea una sesión de entrenamiento.

Solicitud:

```json
{
  "datos_participante": {
    "nombre": "Juan Pérez",
    "edad_aproximada": 25,
    "email_opcional": "juan@example.com"
  },
  "texto_seleccionado": "El zorro rápido salta sobre el perro perezoso."
}
```

Respuesta (`SessionResponse`):

```json
{
  "id": 123,
  "session_code": "abc123xyz",
  "datos_participante": {
    "nombre": "Juan Pérez",
    "edad_aproximada": 25,
    "email_opcional": "juan@example.com"
  },
  "texto_seleccionado": "El zorro rápido salta sobre el perro perezoso.",
  "estado": "created",
  "created_at": "2026-01-08T10:30:00.000000",
  "updated_at": "2026-01-08T10:30:00.000000"
}
```

### GET `/sessions/{session_id}`

Obtiene una sesión por su ID numérico.

Respuesta: `SessionResponse`.

### GET `/sessions/by-code/{session_code}`

Obtiene una sesión por su `session_code` (recomendado para Unity: resolver código → id).

Respuesta: `SessionResponse`.

Si el código es inválido:

```json
{ "detail": "Invalid session_code" }
```

### PATCH `/sessions/{session_id}/state`

Actualiza el estado de la sesión (aplicando la máquina de estados).

Solicitud:

```json
{ "new_state": "running" }
```

Notas:

- `new_state` debe ser uno de: `created | ready_to_start | running | audio_uploaded | survey_pending | completed`
- Transiciones inválidas devuelven `400` con `detail`.

---

## Endpoints de audio / grabaciones

### POST `/sessions/{session_id}/upload` (Unity: subida de audio)

Este es el endpoint **real** que debe usar Unity para subir audio.

- Content-Type: `multipart/form-data`
- Nombre del campo: `file`
- El backend sube el archivo a **Cloudflare R2 (bucket privado)**
- La BD guarda **solo la key del objeto** en `recordings.audio_url` (NO es una URL pública)
- Si la sesión está en `running`, el backend la actualiza a `audio_uploaded`

Solicitud (multipart):

- `file`: archivo de audio (ej. `.wav`)

Respuesta (`RecordingResponse`):

```json
{
  "id": 55,
  "session_id": 123,
  "audio_url": "recordings/session_123/9f4d...-....wav",
  "duracion_segundos": null,
  "formato": "audio/wav",
  "created_at": "2026-01-08T10:35:00.000000"
}
```

### GET `/recordings/{recording_id}/download` (solo ANALISTA)

Devuelve una URL presignada (temporal) para descargar el audio privado.

- Requiere Bearer token
- Requiere rol: `ANALISTA`
- Expiración por defecto: 600 segundos
- Query param opcional: `expires_seconds` (int)

Respuesta:

```json
{
  "recording_id": 55,
  "download_url": "https://...presigned...",
  "expires_in": 600
}
```

### POST `/sessions/{session_id}/recording` (solo PMV / pruebas web)

Endpoint mock (JSON) que se dejó para pruebas web. Unity debe preferir `/upload`.

---

## Endpoints de encuesta

### POST `/sessions/{session_id}/survey`

Envía la encuesta para una sesión.

Solicitud:

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

Comportamiento de estado:

- Si la sesión está en `survey_pending`, el backend la cambia a `completed`.

Respuesta:

```json
{
  "id": 77,
  "session_id": 123,
  "respuestas_json": { "...": "..." },
  "created_at": "2026-01-08T10:40:00.000000"
}
```

### GET `/sessions/{session_id}/survey`

Devuelve todas las encuestas de esa sesión.

---

## Endpoints de dataset (solo ANALISTA)

### GET `/dataset`

Devuelve el dataset completo de sesiones.

Notas:

- Requiere rol `ANALISTA`
- `recordings` contiene **keys de objetos en R2** (no URLs públicas). Para acceder al audio usar `/recordings/{id}/download`.

### GET `/dataset/export`

Exporta un CSV.

---

## Configuración Cloudflare R2 (backend)

El backend lee estas variables de entorno:

- `R2_ENDPOINT_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_REGION` (normalmente `auto`)

---

## Cuentas de prueba (dev)

- IMPULSADOR
  - email: `impulsador@toastclub.com`
  - password: `impulsador123`

- ANALISTA
  - email: `analista@toastclub.com`
  - password: `analista123`
