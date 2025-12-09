# Toast Club PMV

Producto Mínimo Viable (PMV) para Toast Club - Plataforma de comunicación VR.

## 📋 Descripción

Toast Club es una plataforma de comunicación mediante Realidad Virtual desarrollada para VR comunicación. Este repositorio contiene el MVP con backend monolítico, frontend simple y estructura para integración VR.

## 🏗️ Estructura del Proyecto

```
Toast-Club-PMV/
├── backend/          # API REST con FastAPI
├── frontend/         # SPA para impulsador y analista
├── vr/              # Componentes VR (en desarrollo)
├── docs/            # Documentación del proyecto
├── LICENSE          # Licencia MIT
└── README.md        # Este archivo
```

## ✨ Características

- **Backend monolítico**: API REST con FastAPI
- **Modelos de datos**: User, Session, Recording, Survey
- **Estados de sesión**: created → ready_to_start → running → audio_uploaded → survey_pending → completed
- **Frontend SPA**: Vistas para impulsador (crear/gestionar sesiones) y analista (análisis de datos)
- **Sin complejidad innecesaria**: Sin pagos, suscripciones, multitenancy ni IA integrada

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API estará disponible en: http://localhost:8000
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

### Frontend

```bash
cd frontend
python -m http.server 8080
```

La aplicación estará disponible en: http://localhost:8080

## 📚 Documentación

- [Documentación completa](docs/README.md)
- [API Reference](docs/API.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [VR README](vr/README.md)

## 🎯 Roles de Usuario

### Impulsador
- Crear sesiones VR
- Gestionar estados de sesión
- Subir grabaciones de audio
- Ver encuestas

### Analista
- Ver estadísticas generales
- Analizar sesiones completadas
- Filtrar por estados
- Revisar encuestas

## 📊 Modelos de Datos

### User
- Roles: `impulsador` o `analista`
- Datos: email, nombre, estado activo

### Session
- Estados: created, ready_to_start, running, audio_uploaded, survey_pending, completed
- Relaciones: usuario, grabación, encuesta

### Recording
- Archivos de audio/video de sesiones
- Metadatos: duración, tamaño, tipo MIME

### Survey
- Encuestas post-sesión
- Preguntas y respuestas dinámicas

## 🛠️ Tecnologías

### Backend
- FastAPI 0.104.1
- Pydantic 2.5.0
- Uvicorn 0.24.0
- Python 3.8+

### Frontend
- HTML5 / CSS3
- JavaScript ES6+
- Fetch API
- Sin frameworks (vanilla JS)

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

Copyright (c) 2025 Rosa Maria Rodriguez Valencia

## 🤝 Contribución

Este es un MVP en desarrollo. Para contribuir:

1. Fork el repositorio
2. Crea una rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 🔮 Roadmap

### Fase 1 - MVP (Actual)
- ✅ Backend API REST con FastAPI
- ✅ Modelos de datos completos
- ✅ Frontend SPA básico
- ✅ Gestión de estados de sesión

### Fase 2 - Mejoras
- [ ] Base de datos persistente (PostgreSQL)
- [ ] Autenticación JWT
- [ ] Sistema de permisos
- [ ] Tests unitarios y de integración

### Fase 3 - VR
- [ ] Integración con cliente VR
- [ ] Subida real de archivos de audio
- [ ] Almacenamiento en la nube

### Fase 4 - Analytics
- [ ] Dashboard avanzado
- [ ] Visualizaciones de datos
- [ ] Exportación de reportes

## 📧 Contacto

Para preguntas o sugerencias sobre el proyecto Toast Club PMV, contactar con el equipo de VR comunicación.
