# Toast Club PMV - Backend

Backend API REST monolítico desarrollado con FastAPI para el proyecto Toast Club.

## Características

- **Framework**: FastAPI
- **Arquitectura**: Monolítica REST API
- **Modelos de datos**: User, Session, Recording, Survey
- **Estados de sesión**: created, ready_to_start, running, audio_uploaded, survey_pending, completed
- **Almacenamiento**: En memoria (MVP) - preparado para migrar a base de datos

## Instalación

### Requisitos previos

- Python 3.8 o superior
- pip

### Pasos de instalación

1. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env según necesidades
```

## Ejecución

### Servidor de desarrollo

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Acceso a la API

- **API**: http://localhost:8000
- **Documentación interactiva (Swagger)**: http://localhost:8000/docs
- **Documentación alternativa (ReDoc)**: http://localhost:8000/redoc

## Estructura del proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicación FastAPI principal
│   ├── api/                 # Endpoints de la API
│   │   ├── __init__.py
│   │   ├── sessions.py      # Endpoints de sesiones
│   │   ├── users.py         # Endpoints de usuarios
│   │   ├── recordings.py    # Endpoints de grabaciones
│   │   └── surveys.py       # Endpoints de encuestas
│   ├── core/                # Configuración central
│   │   ├── __init__.py
│   │   └── config.py        # Configuración de la aplicación
│   └── models/              # Modelos de datos
│       ├── __init__.py
│       ├── user.py          # Modelo User
│       ├── session.py       # Modelo Session + SessionState
│       ├── recording.py     # Modelo Recording
│       └── survey.py        # Modelo Survey
├── tests/                   # Tests (para futuro desarrollo)
├── requirements.txt         # Dependencias Python
├── .env.example            # Ejemplo de variables de entorno
└── README.md               # Esta documentación
```

## API Endpoints

### Users (Usuarios)
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/{user_id}` - Obtener usuario
- `PUT /api/v1/users/{user_id}` - Actualizar usuario
- `DELETE /api/v1/users/{user_id}` - Eliminar usuario

### Sessions (Sesiones)
- `POST /api/v1/sessions` - Crear sesión
- `GET /api/v1/sessions` - Listar sesiones
- `GET /api/v1/sessions/{session_id}` - Obtener sesión
- `PUT /api/v1/sessions/{session_id}` - Actualizar sesión
- `PATCH /api/v1/sessions/{session_id}/state` - Actualizar estado de sesión
- `DELETE /api/v1/sessions/{session_id}` - Eliminar sesión

### Recordings (Grabaciones)
- `POST /api/v1/recordings` - Crear grabación
- `POST /api/v1/recordings/upload` - Subir archivo de grabación
- `GET /api/v1/recordings` - Listar grabaciones
- `GET /api/v1/recordings/{recording_id}` - Obtener grabación
- `DELETE /api/v1/recordings/{recording_id}` - Eliminar grabación

### Surveys (Encuestas)
- `POST /api/v1/surveys` - Crear encuesta
- `GET /api/v1/surveys` - Listar encuestas
- `GET /api/v1/surveys/{survey_id}` - Obtener encuesta
- `PUT /api/v1/surveys/{survey_id}` - Actualizar encuesta (enviar respuestas)
- `DELETE /api/v1/surveys/{survey_id}` - Eliminar encuesta

## Modelos de datos

### User
- Roles: `impulsador` (promotor) o `analista`
- Campos: id, email, name, role, created_at, updated_at, is_active

### Session
- Estados: `created`, `ready_to_start`, `running`, `audio_uploaded`, `survey_pending`, `completed`
- Campos: id, user_id, title, description, state, created_at, updated_at, started_at, completed_at, recording_id, survey_id

### Recording
- Campos: id, session_id, file_path, file_size, duration, mime_type, created_at, uploaded_at, is_processed

### Survey
- Campos: id, session_id, user_id, questions, responses, created_at, completed_at, is_completed

## Notas de desarrollo

- **Almacenamiento actual**: Los datos se almacenan en memoria (diccionarios Python). Al reiniciar el servidor, se pierden los datos.
- **Migración futura**: La estructura está preparada para migrar a una base de datos relacional (SQLite, PostgreSQL, etc.)
- **Sin autenticación**: El MVP no incluye autenticación. Se puede agregar JWT o OAuth2 en el futuro.
- **Sin pagos ni suscripciones**: Como se especificó en los requisitos.
- **Sin multitenancy**: Sistema de tenant único.
- **Sin IA integrada**: La integración de IA es futura.

## Licencia

MIT License - Ver archivo LICENSE en la raíz del proyecto.
