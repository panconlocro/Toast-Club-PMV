# Toast Club PMV – Resumen de finalización

**Proyecto:** Toast Club PMV (Producto Mínimo Viable)  
**Estado:** ✅ COMPLETO  
**Fecha:** Diciembre 2025 (actualizado enero 2026)  
**Versión:** 0.1.0

---

## 🎉 Resumen

El PMV de Toast Club está implementado y documentado. Este documento resume lo que incluye el repositorio y el alcance del PMV.

---

## 📋 Alcance y requisitos

### ✅ Stack tecnológico

- **Backend:** FastAPI (monolito)
- **ORM:** SQLAlchemy
- **Frontend:** React + Vite (SPA)
- **Base de datos:** PostgreSQL (en Docker; en desarrollo se puede usar una DB local)
- **Licencia:** MIT

### ✅ Modelos backend

**Session**

- `id`
- `datos_participante` (nombre/alias, edad_aproximada, email_opcional)
- `texto_seleccionado`
- `estado` (máquina de estados)
- `session_code` (único)
- `created_at`, `updated_at`

**Recording**

- `id`
- `session_id` (FK)
- `audio_url` (key del objeto en R2, no URL pública)
- `duracion_segundos`
- `formato`
- `metadata_carga`

**Survey**

- `id`
- `session_id` (FK)
- `respuestas_json`
- `created_at`

**User**

- `id`
- `email`
- `password_hash`
- `rol` (`IMPULSADOR` o `ANALISTA`)

### ✅ Máquina de estados

Estados y transiciones:

```
created → ready_to_start → running → audio_uploaded → survey_pending → completed
```

Incluye validación de transiciones y pruebas unitarias.

### ✅ Endpoints API (resumen)

**Sesiones**

- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{session_id}`
- `GET /api/v1/sessions/by-code/{session_code}`
- `PATCH /api/v1/sessions/{session_id}/state`

**Grabaciones / audio**

- `POST /api/v1/sessions/{session_id}/upload` (subida real multipart; pensado para Unity)
- `GET /api/v1/recordings/{recording_id}/download` (URL presignada; solo `ANALISTA`)
- `POST /api/v1/sessions/{session_id}/recording` (mock/JSON; útil solo para pruebas web)

**Textos de entrenamiento**

- `GET /api/v1/texts` (lista con filtros por tags)
- `GET /api/v1/texts/{text_id}` (texto completo con páginas normalizadas desde la 3ra)
- `GET /api/v1/texts/tags` (índice de tags disponibles)

**Encuestas**

- `POST /api/v1/sessions/{session_id}/survey`
- `GET /api/v1/sessions/{session_id}/survey`

**Dataset (solo ANALISTA)**

- `GET /api/v1/dataset`
- `GET /api/v1/dataset/export`

**Autenticación**

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

---

## 🧩 Estructura del proyecto (alto nivel)

```
/backend/
  app/
    api/v1/ (sessions, recordings, surveys, auth, dataset)
    core/ (config, security, state_machine, storage_r2)
    models/
    db/
  tests/

/frontend/
  src/
    pages/ (LoginPage.jsx, ImpulsorPage.jsx, AnalistaPage.jsx)
    components/
    api/

/docs/
  api_design.md
  SETUP_GUIDE.md
  pmv_overview.md
  PROJECT_STATUS.md
  SECURITY.md
  CONTRIBUTING.md
  COMPLETION_SUMMARY.md
```

---

## ✅ Funcionalidad del frontend

**IMPULSADOR**

- Crear sesión (datos + texto)
- Ver estado
- Iniciar sesión (cambiar a `running`)
- Esperar a que Unity suba el audio (polling del estado)
- Continuar a encuesta cuando corresponda

**ANALISTA**

- Ver dataset
- Exportar CSV
- Preview y descarga de grabaciones desde URL presignada

**Selección de textos (IMPULSADOR)**

- Filtros por tags
- Búsqueda por título (insensible a tildes)

---

## 🎯 Fuera de alcance (por diseño)

- Pagos/suscripciones
- Multi-tenancy
- Analítica avanzada
- IA/ML
- Notificaciones en tiempo real
- Sistema de emails

---

## 🚀 Estado de despliegue

Listo para:

- Desarrollo local
- Ejecución con Docker Compose
- Pruebas del flujo end-to-end

Para producción, aplicar la lista de verificación de [docs/SECURITY.md](SECURITY.md).

---

## 📌 Próximos pasos recomendados

1) Revisar el contrato API: [docs/api_design.md](api_design.md)
2) Revisar configuración: [docs/SETUP_GUIDE.md](SETUP_GUIDE.md)
3) Validar flujo Unity: resolver `session_code` → `session_id` → subir audio → encuesta
