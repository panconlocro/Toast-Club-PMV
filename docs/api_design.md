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

## Endpoints de textos de entrenamiento

Los textos de entrenamiento se almacenan en un archivo JSON en el backend. Estos endpoints permiten listar y obtener los textos disponibles.

### GET `/texts`

Devuelve la lista de todos los textos disponibles para entrenamiento (sin incluir las páginas completas).

Soporta filtros por tags como query params (match por igualdad, **case-insensitive** y con **trim**):

- Ejemplo: `/texts?tema=especialización&tono=combativo`
- Si un query param no existe como key en `Tags`, no hace match.

Respuesta:

```json
{
  "texts": [
    {
      "Id": "20251225202648_0001",
      "Title": "La Tiranía del Embudo: Cuando el Especialismo nos convierte en Expertos Incompetentes",
      "Tags": {
        "audiencia": "investigadores y profesionales técnicos",
        "contexto": "academia e industria",
        "duracion_aprox": "6-7 min",
        "intencion": "promover integración de saberes",
        "referentes": "crítica al especialismo",
        "subtema": "interdisciplinariedad",
        "tema": "especialización",
        "tono": "combativo"
      }
    }
  ],
  "total": 1
}
```

### GET `/texts/{text_id}`

Devuelve un texto específico por su ID, incluyendo el array completo de páginas.

- `text_id`: string (ej. `"20251225202648_0001"`)

Respuesta:

```json
{
  "Id": "20251225202648_0001",
  "Title": "La Tiranía del Embudo: Cuando el Especialismo nos convierte en Expertos Incompetentes",
  "Pages": [
    [
      "",
      "",
      "La Tiranía del Embudo: Cuando el",
      "Especialismo nos convierte en Expertos",
      "Incompetentes"
    ],
    [
      "Colegas, estudiantes:",
      "",
      "Hay una frase cruel, pero demoledora, que",
      "ronda los pasillos de la academia..."
    ]
  ],
  "Tags": {
    "audiencia": "investigadores y profesionales técnicos",
    "duracion_aprox": "6-7 min",
    "tema": "especialización",
    "tono": "combativo"
  }
}
```

Notas:

- `Pages` es un array de páginas, donde cada página es un array de líneas de texto.
- Este es el formato que Unity debe usar para mostrar el texto al participante.
- Desde la página 3 en adelante, el backend normaliza el texto para RV:
  - Máximo 8 líneas por página.
  - Máximo 39 caracteres por línea.
  - Word wrapping sin cortar palabras (si es posible).
  - Si supera 8 líneas, crea nuevas páginas.
  - Páginas 1 y 2 se mantienen intactas.

Si el texto no existe:

```json
{ "detail": "Text with Id 'xxx' not found" }
```

---

### GET `/texts/tags`

Devuelve el índice de tags disponibles para filtros.

Respuesta:

```json
{
  "keys": ["audiencia", "contexto", "duracion_aprox", "intencion", "referentes", "subtema", "tema", "tono"],
  "values": {
    "tema": ["especialización", "ética universitaria", "meritocracia", "misión de la universidad"],
    "tono": ["combativo", "crítico", "provocador", "reflexivo-crítico"]
  }
}
```

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
  "texto_seleccionado_id": "20251225202648_0001"
}
```

Notas:

- `texto_seleccionado_id`: ID del texto de entrenamiento (obtenido de `GET /texts`).
- El backend busca el texto completo y lo almacena en la sesión **ya normalizado**.
- Si el ID no existe, devuelve `404`.

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
  "texto_seleccionado": {
    "Id": "20251225202648_0001",
    "Title": "La Tiranía del Embudo...",
    "Pages": [["línea1", "línea2"], ["línea3", "línea4"]],
    "Tags": { "tema": "especialización", "duracion_aprox": "6-7 min" }
  },
  "estado": "created",
  "created_at": "2026-01-08T10:30:00.000000",
  "updated_at": "2026-01-08T10:30:00.000000"
}
```
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
- `recordings` contiene objetos con `id`, `audio_url` (key en R2) y `created_at`.
- Para acceder al audio usar `/recordings/{id}/download` (URL presignada).

### GET `/dataset/export`

Exporta un ZIP con metadata, encuestas y audios reales desde R2.

Formato del archivo:

- `dataset_export_YYYYMMDD_HHMM.zip`
  - `dataset.csv`
  - `surveys.csv`
  - `audios/{session_code}__{recording_id}.{ext}`

Notas:

- Requiere rol `ANALISTA`.
- `recordings.audio_url` almacena la **storage key** en R2 (no URL pública).
- `dataset.csv` incluye una fila por grabación (o una fila por sesión si no hay grabaciones).
- `surveys.csv` se exporta en formato ancho si las keys son fijas, o en formato largo si son dinámicas.

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
