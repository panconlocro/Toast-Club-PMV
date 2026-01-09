# Contribuir a Toast Club PMV

Gracias por tu interés en contribuir a Toast Club PMV. Este documento contiene pautas e instrucciones para contribuir.

## Tabla de contenidos

1. [Código de conducta](#código-de-conducta)
2. [Primeros pasos](#primeros-pasos)
3. [Flujo de trabajo](#flujo-de-trabajo)
4. [Estándares de código](#estándares-de-código)
5. [Guía de pruebas](#guía-de-pruebas)
6. [Proceso de PR (Pull Request)](#proceso-de-pr-pull-request)

## Código de conducta

- Ser respetuoso e inclusivo
- Dar retroalimentación constructiva
- Ayudar a otros a aprender
- Mantener discusiones profesionales y en tema

## Primeros pasos

1) **Fork del repositorio** en GitHub

2) **Clona tu fork** localmente:

```bash
git clone https://github.com/YOUR_USERNAME/Toast-Club-PMV.git
cd Toast-Club-PMV
```

3) **Agregar remote upstream**:

```bash
git remote add upstream https://github.com/panconlocro/Toast-Club-PMV.git
```

4) **Configurar entorno de desarrollo** (ver [SETUP_GUIDE.md](SETUP_GUIDE.md))

## Flujo de trabajo

### 1) Crear una rama

```bash
git checkout -b feature/tu-feature
```

Prefijos recomendados:

- `feature/` – nuevas funcionalidades
- `fix/` – errores
- `docs/` – cambios de documentación
- `refactor/` – refactorizaciones
- `test/` – pruebas

### 2) Hacer cambios

- Seguir los estándares (ver abajo)
- Escribir pruebas si aplica
- Actualizar documentación si aplica

### 3) Commit

```bash
git add .
git commit -m "Descripción breve de los cambios"
```

Formato sugerido:

```
<tipo>: <asunto>

<cuerpo (opcional)>

<pie (opcional)>
```

Ejemplos:

- `feat: Agregar validación de subida de audio`
- `fix: Corregir validación de transiciones de estado`
- `docs: Actualizar documentación de endpoints`

### 4) Mantener el fork actualizado

```bash
git fetch upstream
git rebase upstream/main
```

### 5) Push

```bash
git push origin feature/tu-feature
```

### 6) Crear un PR (Pull Request)

- Ir al repo original en GitHub
- Clic en “Nuevo Pull Request”
- Seleccionar tu fork y rama
- Completar la plantilla del PR

## Estándares de código

### Python (backend)

- **Guía de estilo**: seguir PEP 8
- **Anotaciones de tipo**: usar anotaciones de tipo cuando sea posible
- **Docstrings**: usar docstrings en clases/funciones
- **Importaciones**: agrupar importaciones (stdlib, terceros, locales)

Ejemplo:

```python
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

def get_session_by_id(
    session_id: int,
    db: Session = Depends(get_db)
) -> Optional[SessionModel]:
  """Obtener una sesión por su ID."""
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()
```

### JavaScript/React (frontend)

- **Formato**: consistente
- **Componentes**: funcionales + hooks
- **Props**: desestructurar props en parámetros
- **State**: usar `useState`/`useEffect` correctamente
- **Naming**: PascalCase para componentes, camelCase para funciones/variables

Ejemplo:

```javascript
function SessionForm({ onSessionCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    edad_aproximada: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Manejar el envío
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Contenido del formulario */}
    </form>
  );
}
```

### Principios generales

- **DRY**: no repetirse
- **KISS**: mantenerlo simple
- **YAGNI**: no agregar funcionalidad “por si acaso”
- **Separación de responsabilidades**: modularidad y claridad

## Guía de pruebas

### Pruebas del backend

Se usa pytest:

```python
def test_valid_state_transition():
  """Prueba que las transiciones de estado válidas están permitidas."""
    assert SessionStateMachine.can_transition(
        SessionState.CREATED,
        SessionState.READY_TO_START
    )

def test_invalid_state_transition():
  """Prueba que las transiciones de estado inválidas se rechazan."""
    with pytest.raises(ValueError):
        SessionStateMachine.validate_transition(
            SessionState.CREATED,
            SessionState.COMPLETED
        )
```

### Cobertura

- Apuntar a >80% en lógica crítica
- Probar casos felices y bordes
- Probar errores
- Simular dependencias externas

### Ejecutar pruebas

```bash
cd backend
pytest

# Con cobertura
pytest --cov=app tests/

# Un archivo
pytest tests/test_state_machine.py -v
```

## Proceso de PR (Pull Request)

### Antes de enviar

- [ ] Pruebas pasan localmente
- [ ] Código sigue estándares
- [ ] Documentación actualizada
- [ ] Commits claros
- [ ] No se incluyen archivos innecesarios
- [ ] Rama actualizada con `main`

### Plantilla sugerida

1. **Descripción**: qué cambió y por qué
2. **Incidencias relacionadas**: enlaces
3. **Pruebas**: cómo probar
4. **Capturas de pantalla**: si hay cambios en la UI
5. **Lista de verificación**: confirmar requisitos

### Revisión

1. Validaciones automáticas pasan (si existen)
2. Aprobación de al menos un mantenedor
3. Atender retroalimentación
4. Hacer “squash” de commits si se solicita
5. Mantener historial limpio

## Qué contribuir

### “Buenas primeras incidencias”

Buscar incidencias con la etiqueta `good-first-issue`:

- Mejoras de documentación
- Errores simples
- Pruebas
- Limpieza de código

### Áreas

- **Backend**: endpoints, modelos, lógica
- **Frontend**: UI/UX
- **Pruebas**: unitarias/integración
- **Documentación**: guías/ejemplos
- **DevOps**: Docker/CI

### Fuera de alcance del PMV

Recordatorio: esto es un PMV. Fuera de alcance:

- Pagos/suscripciones
- Multi-tenancy
- Analítica avanzada
- IA/ML
- Aplicación RV “final” (marcador de posición)

Enfocarse en la funcionalidad central para validar el concepto.

## ¿Dudas?

1) Revisar documentación
2) Buscar incidencias cerradas
3) Abrir una incidencia con la etiqueta `question`
4) Dar contexto y pasos para reproducir

## Licencia

Al contribuir, aceptas que tus contribuciones se licencian bajo MIT.

Gracias por contribuir a Toast Club PMV.
