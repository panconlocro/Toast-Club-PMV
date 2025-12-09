# Toast Club PMV - VR

Directorio para componentes y assets relacionados con la experiencia de Realidad Virtual.

## Estructura planificada

```
vr/
├── scenes/         # Escenas VR
├── assets/         # Modelos 3D, texturas, audio
├── scripts/        # Scripts de interacción VR
└── README.md       # Esta documentación
```

## Descripción

Este directorio está reservado para el desarrollo de la experiencia VR de Toast Club. Incluirá:

- **Escenas VR**: Entornos virtuales donde se realizan las sesiones
- **Assets 3D**: Modelos, texturas y materiales para la experiencia
- **Scripts de interacción**: Lógica de interacción del usuario en VR
- **Configuración**: Archivos de configuración para el motor VR

## Tecnologías sugeridas

- **Unity** o **Unreal Engine**: Motores principales para desarrollo VR
- **A-Frame**: Framework web para VR (alternativa más ligera)
- **WebXR**: API estándar para experiencias VR en web
- **Three.js**: Biblioteca JavaScript para 3D

## Integración con Backend

La aplicación VR se comunicará con el backend a través de la API REST para:

- Autenticar usuarios
- Registrar inicio/fin de sesiones
- Subir grabaciones de audio
- Actualizar estados de sesión
- Recuperar encuestas

## Estado actual

⚠️ **En desarrollo**: Este directorio está preparado para el desarrollo futuro de la experiencia VR.

## Próximos pasos

1. Definir plataforma VR objetivo (Quest, PCVR, WebVR, etc.)
2. Seleccionar motor de desarrollo
3. Diseñar experiencia de usuario VR
4. Implementar comunicación con API
5. Desarrollar escenas y mecánicas de interacción

## Licencia

MIT License - Ver archivo LICENSE en la raíz del proyecto.
