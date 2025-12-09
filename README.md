# Toast Club PMV

Producto Mínimo Viable (PMV) para Toast Club - Una plataforma de entrenamiento en habilidades de comunicación con VR.

## 🎯 Descripción

Toast Club PMV es una plataforma web diseñada para validar el concepto de entrenamiento en habilidades de comunicación usando realidad virtual. Esta versión permite:

- Crear sesiones de entrenamiento
- Gestionar el flujo de trabajo de las sesiones
- Recolectar grabaciones de audio (mock)
- Recopilar encuestas de retroalimentación
- Analizar datos de sesiones

## 🏗️ Arquitectura

### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT tokens

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Servicios**: Backend, Frontend, PostgreSQL

## 📋 Requisitos Previos

- Docker
- Docker Compose
- Git

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/panconlocro/Toast-Club-PMV.git
cd Toast-Club-PMV
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones (opcional para desarrollo)
```

### 3. Levantar el Proyecto con Docker

```bash
docker-compose up --build
```

Esto iniciará:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **API Docs**: http://localhost:8000/docs

### 4. Acceder a la Aplicación

Abre tu navegador en http://localhost:3000

**Cuentas de prueba:**
- **IMPULSADOR**: 
  - Email: `impulsador@toastclub.com`
  - Password: `impulsador123`
- **ANALISTA**: 
  - Email: `analista@toastclub.com`
  - Password: `analista123`

## 📁 Estructura del Proyecto

```
Toast-Club-PMV/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/         # Endpoints REST
│   │   │   └── v1/      # API version 1
│   │   ├── core/        # Configuración y seguridad
│   │   ├── db/          # Configuración de base de datos
│   │   └── models/      # Modelos SQLAlchemy
│   ├── tests/           # Tests unitarios
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # Aplicación React
│   ├── src/
│   │   ├── api/        # Cliente API
│   │   ├── components/ # Componentes React
│   │   └── pages/      # Páginas
│   ├── Dockerfile
│   └── package.json
├── docs/               # Documentación
│   ├── pmv_overview.md
│   └── api_design.md
├── vr/                 # Placeholder para app VR
├── docker-compose.yml
├── .env.example
├── .gitignore
└── LICENSE
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Usuario actual
- `POST /api/v1/auth/logout` - Cerrar sesión

### Sesiones
- `POST /api/v1/sessions` - Crear sesión
- `GET /api/v1/sessions/{id}` - Obtener sesión
- `PATCH /api/v1/sessions/{id}/state` - Actualizar estado

### Grabaciones
- `POST /api/v1/sessions/{id}/recording` - Crear grabación
- `POST /api/v1/sessions/{id}/upload` - Subir archivo

### Encuestas
- `POST /api/v1/sessions/{id}/survey` - Enviar encuesta
- `GET /api/v1/sessions/{id}/survey` - Obtener encuestas

### Dataset (Solo ANALISTA)
- `GET /api/v1/dataset` - Obtener dataset completo
- `GET /api/v1/dataset/export` - Exportar CSV

Para más detalles, consulta la [documentación de la API](docs/api_design.md).

## 🔄 Flujo de Trabajo de Sesiones

Las sesiones siguen una máquina de estados:

```
created → ready_to_start → running → audio_uploaded → survey_pending → completed
```

Cada transición está validada por la aplicación.

## 🎭 Roles de Usuario

### IMPULSADOR (Facilitador)
- Crear sesiones de entrenamiento
- Gestionar el flujo de sesiones
- Cargar grabaciones
- Enviar encuestas

### ANALISTA (Analista)
- Ver todas las sesiones
- Exportar datasets
- Analizar datos recopilados

## 🗃️ Modelos de Datos

### Session
- Información del participante
- Texto seleccionado para práctica
- Estado de la sesión
- Código único de sesión

### Recording
- URL del audio
- Duración y formato
- Metadata de carga

### Survey
- Respuestas en formato JSON
- Feedback del participante

### User
- Email y contraseña
- Rol (IMPULSADOR o ANALISTA)

## 🧪 Desarrollo

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
pytest
```

## 📚 Documentación Adicional

- [Visión General del PMV](docs/pmv_overview.md)
- [Diseño de la API](docs/api_design.md)
- [Aplicación VR (Placeholder)](vr/README.md)

## 🔒 Seguridad

⚠️ **Importante para Producción:**
- Cambiar `SECRET_KEY` en las variables de entorno
- Usar contraseñas seguras
- Configurar HTTPS
- Implementar rate limiting
- Revisar configuración de CORS

## 🚫 Fuera del Alcance del PMV

Este PMV **NO** incluye:
- Pagos o suscripciones
- Multi-tenancy
- Dashboards avanzados
- Integración con IA/ML
- Aplicación VR funcional
- Almacenamiento de audio en la nube

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Contribuir

Este es un proyecto PMV para validación de concepto. Para contribuir:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, por favor abre un issue en GitHub.
