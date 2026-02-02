# Toast Club PMV – Visión general

## ¿Qué es Toast Club?

Toast Club es una plataforma de entrenamiento en Realidad Virtual (RV) diseñada para ayudar a las personas a mejorar sus habilidades de comunicación.
Este PMV (Producto Mínimo Viable) se centra en validar el concepto base: recolectar grabaciones de audio de sesiones de entrenamiento y retroalimentación del usuario mediante encuestas.

## Objetivo del PMV

Los objetivos principales de este PMV son:

- Validar el concepto de entrenamiento de comunicación basado en RV
- Recolectar grabaciones de audio de sesiones
- Recolectar retroalimentación mediante encuestas
- Construir un dataset simple para análisis
- Proveer textos de lectura normalizados para RV

## Qué NO es el PMV

Este PMV explícitamente excluye:

- Pagos o suscripciones
- Multi-tenancy
- Dashboards complejos o analítica avanzada
- Integraciones de IA/ML (por ejemplo, análisis automático del habla)
- Una aplicación RV “final” (Unity es parte del trabajo externo al PMV web)

Nota: el PMV **sí** incluye almacenamiento de audio privado mediante Cloudflare R2 (S3 compatible) y URLs presignadas para descarga (rol ANALISTA).

## Usuarios objetivo

### IMPULSADOR (facilitador)

- Crea sesiones de entrenamiento para participantes
- Administra el flujo (estados) de la sesión
- Coordina el proceso de grabación (Unity sube el audio) y encuesta
- Selecciona textos con filtros por tags

### ANALISTA (analista)

- Visualiza los datos de las sesiones
- Exporta datasets para análisis
- Descarga audios mediante URLs presignadas
- Previsualiza grabaciones desde la web

## Flujo de sesión (máquina de estados)

El backend usa el campo `estado` con una máquina de estados.

1. **Creada** (`created`): sesión inicializada con datos del participante
2. **Lista para iniciar** (`ready_to_start`): preparada para entrenamiento
3. **En curso** (`running`): entrenamiento en progreso
4. **Audio cargado** (`audio_uploaded`): Unity subió el audio al backend
5. **Encuesta pendiente** (`survey_pending`): esperando retroalimentación
6. **Completada** (`completed`): sesión finalizada con datos completos

## Stack tecnológico

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React (Vite) + CSS
- **Infraestructura**: Docker Compose
- **Autenticación**: JWT

## Modelo de datos

### Sesión (Session)

- Información del participante (nombre, edad aproximada, email opcional)
- Texto seleccionado para entrenamiento (normalizado desde la página 3)
- Estado del flujo
- Código único `session_code`

### Grabación (Recording)

- Referencia al audio (se guarda una *key* del objeto en R2)
- Duración y formato
- Metadatos de carga

### Encuesta (Survey)

- Respuestas del participante
- JSON para flexibilidad

### Usuario (User)

- Email y password
- Rol (`IMPULSADOR` o `ANALISTA`)

## Mejoras futuras (post-PMV)

- Integración más completa con Unity (RV)
- Analítica avanzada
- Análisis de audio / scoring
- Soporte multi-idioma
- App móvil
