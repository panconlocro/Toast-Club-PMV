# Toast Club PMV – Estado del proyecto

**Estado:** ✅ Completo y listo para uso  
**Versión:** 0.1.0  
**Fecha:** Diciembre 2025 (actualizado enero 2026)

## Resumen

Toast Club PMV es un Producto Mínimo Viable para una plataforma de entrenamiento de comunicación en Realidad Virtual (RV). Incluye backend FastAPI, frontend React (Vite) y base PostgreSQL, con Docker Compose.

## Qué incluye

### ✅ Backend (FastAPI)

- **Endpoints API**: implementados
   - Autenticación (inicio/cierre de sesión)
   - Sesiones (crear, obtener, cambiar estado)
   - Resolución de sesión por código (`/sessions/by-code/{session_code}`)
   - Subida de audio real vía multipart (`/sessions/{session_id}/upload`)
   - Descarga de audio por URL presignada (solo ANALISTA)
   - Envío de encuestas
   - Dataset y exportación a CSV (solo ANALISTA)
- **Modelos**: SQLAlchemy (User, Session, Recording, Survey)
- **Máquina de estados**: validación de transiciones del flujo
- **Seguridad**: JWT + control por rol
- **Docs**: Swagger en `/docs`

### ✅ Frontend (React + Vite)

- **Páginas**:
   - Inicio de sesión con ruteo por rol
   - Dashboard IMPULSADOR (crear/gestionar sesiones)
   - Dashboard ANALISTA (ver dataset/exportar)
- **Integración API**: cliente HTTP
- **Ruteo**: rutas protegidas

### ✅ Infraestructura

- **Docker Compose**:
   - PostgreSQL
   - Backend
   - Frontend
- **Configuración**: `.env.example`
- **Archivos de build**: Dockerfiles backend/frontend

### ✅ Documentación

- README.md
- docs/SETUP_GUIDE.md
- docs/CONTRIBUTING.md
- docs/api_design.md
- docs/pmv_overview.md
- docs/PROJECT_STATUS.md
- docs/SECURITY.md

### ✅ Pruebas y validación

- Pruebas unitarias de la máquina de estados (pytest)
- Verificación manual de endpoints

## Qué funciona

### Autenticación y autorización ✅

- Inicio de sesión con email/contraseña
- JWT
- Control por rol (IMPULSADOR vs ANALISTA)
- Rutas protegidas en frontend

### Manejo de sesiones ✅

- Crear sesiones
- Guardar datos del participante
- Asociar texto
- Generar `session_code`
- Ver detalles de sesión
- Actualizar estado (validado por la máquina de estados)

### Máquina de estados ✅

Estados: `created → ready_to_start → running → audio_uploaded → survey_pending → completed`

- Transiciones válidas permitidas
- Transiciones inválidas bloqueadas con mensajes claros
- Persistencia en BD

### Grabaciones (audio) ✅

- Subida de audio real por Unity a través del backend (multipart)
- Almacenamiento privado en Cloudflare R2 (S3 compatible)
- Descarga mediante URL presignada temporal (solo ANALISTA)
- Existe un endpoint “mock” para pruebas web, pero Unity debe usar `/upload`

### Encuestas ✅

- Recolección de retroalimentación
- Respuestas en JSON
- Transición a `completed` al enviar encuesta (cuando corresponde)

### Dataset y exportación ✅

- ANALISTA ve dataset completo
- Exportación a CSV

## Qué NO incluye (por diseño)

- Pagos/suscripciones
- Multi-tenancy
- Analítica avanzada
- IA/ML
- Notificaciones en tiempo real
- Sistema de emails
- Gestión avanzada de usuarios

## Limitaciones conocidas

### Audio

- El almacenamiento está implementado (Cloudflare R2), pero no hay procesamiento/análisis del audio.

### Seguridad

- `SECRET_KEY` debe cambiarse en producción
- HTTPS debe habilitarse en despliegues reales
- No hay limitación de solicitudes implementada

### Escalabilidad

- Arquitectura simple (sin cache / sin balanceo)

## Cuentas de prueba

- **IMPULSADOR**: `impulsador@toastclub.com` / `impulsador123`
- **ANALISTA**: `analista@toastclub.com` / `analista123`

## Inicio rápido

```bash
git clone https://github.com/panconlocro/Toast-Club-PMV.git
cd Toast-Club-PMV
docker-compose up --build
```

- Frontend: http://localhost:3000
- Swagger (documentación del API): http://localhost:8000/docs

## Estado de componentes

| Componente | Estado | Notas |
|-----------|--------|-------|
| Backend API | ✅ Completo | Endpoints funcionales |
| Frontend UI | ✅ Completo | Páginas clave |
| Modelos DB | ✅ Completo | Entidades definidas |
| Máquina de estados | ✅ Completo | Validada |
| Autenticación | ✅ Completo | JWT |
| Docs | ✅ Completo | Documentación en `/docs` |
| Docker | ✅ Completo | Stack listo |
| Pruebas | ✅ Completo | Pruebas base |

## Conclusión

Este PMV demuestra el concepto base de una plataforma de entrenamiento en RV:

- ✅ API completa
- ✅ UI funcional
- ✅ Recolección de datos (sesión + audio + encuesta)
- ✅ Control por roles
- ✅ Exportación de dataset

**Estado: listo para validación y evolución del producto**
