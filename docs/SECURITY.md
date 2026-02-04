# Lista de verificación de seguridad para despliegue a producción

## ⚠️ IMPORTANTE: antes de desplegar a producción

Este documento resume consideraciones críticas de seguridad para desplegar Toast Club PMV a producción.

## 🔒 Autenticación y secretos

### Clave secreta (CRÍTICO)
- [ ] **Cambiar `SECRET_KEY`** en el archivo `.env`
- [ ] Generar una clave criptográficamente segura:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] Nunca commitear la clave secreta de producción al repositorio
- [ ] Usar variables de entorno o un sistema de gestión de secretos

### Contraseñas

- [ ] **Cambiar contraseñas por defecto**
- [ ] Usar contraseñas fuertes (mínimo 12 caracteres, mayúsculas/minúsculas, números, símbolos)
- [ ] Considerar reglas de complejidad
- [ ] Implementar restablecimiento de contraseña

### Credenciales de base de datos

- [ ] **Cambiar credenciales por defecto de PostgreSQL**
- [ ] Usar contraseñas fuertes y únicas
- [ ] Evitar usuarios por defecto como 'postgres' o 'toastclub'
- [ ] Restringir el acceso a la DB solo al backend

## 🌐 Configuración CORS

### Configuración actual (desarrollo)
```python
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
```

### Configuración en producción

- [ ] Actualizar `CORS_ORIGINS` a tus dominios reales
- [ ] Nunca usar `["*"]` (permitir todos los orígenes) en producción
- [ ] Incluir solo URLs HTTPS
- [ ] Ejemplo:
  ```python
  CORS_ORIGINS = ["https://yourdomain.com", "https://app.yourdomain.com"]
  ```

## 🔐 HTTPS/SSL

- [ ] **Habilitar HTTPS** para todo el tráfico en producción
- [ ] Obtener certificado SSL/TLS (Let's Encrypt, etc.)
- [ ] Redirigir HTTP → HTTPS
- [ ] Configurar proxy inverso (Nginx, Caddy, etc.)
- [ ] Activar atributos de cookies seguras (si aplica):
  ```python
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  ```

## 🛡️ Headers y middleware

### Encabezados de seguridad

Agregar estos encabezados al proxy inverso o middleware:
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Content-Security-Policy`

Ejemplo Nginx:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 🚦 Limitación de solicitudes

### Limitación de solicitudes a nivel API

- [ ] Implementar limitación de solicitudes en endpoints de autenticación
- [ ] Limitar intentos de inicio de sesión (ej. 5/min por IP)
- [ ] Limitar creación de sesiones
- [ ] Considerar:
  - slowapi (FastAPI)
  - limitación de solicitudes con Redis
  - limitación de solicitudes en Nginx

Ejemplo:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

## 📝 Registro y monitoreo

### Registro

- [ ] **Deshabilitar logs de consultas SQL** en producción (`echo=False`)
- [ ] Registrar eventos de auth (inicio de sesión, cierre de sesión, fallos)
- [ ] Registrar transiciones de estado
- [ ] No registrar datos sensibles (contraseñas, tokens, PII)
- [ ] Rotación de logs

### Monitoreo

- [ ] Monitorear intentos de inicio de sesión fallidos
- [ ] Alertar ante patrones anómalos
- [ ] Métricas de errores del API
- [ ] Rendimiento de base de datos

## 🗄️ Seguridad de base de datos

### Configuración PostgreSQL

- [ ] Usar PostgreSQL (no SQLite) en producción
- [ ] Habilitar SSL
- [ ] Restringir acceso de red (firewall)
- [ ] Copias de seguridad regulares
- [ ] Cifrar copias de seguridad
- [ ] Probar restauraciones

### Seguridad de conexión
```python
# Ejemplo de DATABASE_URL con SSL
DATABASE_URL = "postgresql://user:pass@host:5432/dbname?sslmode=require"
```

## 📁 Seguridad de subida de archivos

### Subida de audio (implementación actual)

Actualmente el audio se sube al backend vía `multipart/form-data` y el backend lo guarda en **Cloudflare R2 (bucket privado)**. La BD guarda una **key** (no una URL pública) y la descarga se realiza mediante **URLs presignadas** (solo rol `ANALISTA`).

Lista de verificación de endurecimiento recomendado:

- [ ] Validar tipos de archivo (extensiones permitidas)
- [ ] Limitar tamaño de archivo
- [ ] Validar tipo MIME
- [ ] Generar nombres únicos
- [ ] Evitar exponer el bucket públicamente
- [ ] Expirar URLs presignadas en poco tiempo
- [ ] Auditar accesos y descargas

Ejemplo de validación:
```python
ALLOWED_EXTENSIONS = {'.wav', '.mp3', '.m4a'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def validate_audio_file(file):
  # Verificar extensión
  # Verificar tamaño
    # Verificar tipo MIME
  # Escanear contenido
```

## 🔑 Seguridad de tokens JWT

### Configuración de tokens

- [ ] Definir expiración adecuada (ACCESS_TOKEN_EXPIRE_MINUTES)
- [ ] Considerar refresh tokens
- [ ] Revocación/blacklist (si aplica)
- [ ] Almacenar tokens de forma segura en el cliente (evitar localStorage en apps sensibles)

### Validación del token
```python
# Current implementation validates:
- Token signature
- Token expiration
- User existence

# Considerar agregar:
- Token revocation check
- Device fingerprinting
- IP validation
```

## 🚫 Validación de inputs

### Backend

- [ ] Modelos Pydantic validan inputs
- [ ] Validación de email (ya implementada)
- [ ] Validación de rango de edad (1-120)
- [ ] Límites de longitud
- [ ] Prevención de SQL injection (SQLAlchemy con queries parametrizadas ✅)

### Frontend

- [ ] Validación client-side para UX
- [ ] Nunca confiar en el input del cliente
- [ ] Validar siempre en backend

## 🔍 Seguridad de código

### Dependencias

- [ ] Mantener dependencias actualizadas
- [ ] Correr auditorías:
  ```bash
  # Python
  pip install safety
  safety check
  
  # Node.js
  npm audit
  ```
  
- [ ] Suscribirse a avisos de seguridad

### Revisión de código

- [ ] Revisar código por problemas de seguridad
- [ ] Usar herramientas de análisis (Bandit, ESLint)
- [ ] Buscar secretos en el historial git

## 🧪 Pruebas

### Seguridad

- [ ] Probar auth
- [ ] Probar autorización (roles)
- [ ] Probar transiciones de estado
- [ ] Probar validación de inputs
- [ ] Pruebas de penetración (si aplica)

## 📊 Privacidad de datos

### GDPR / cumplimiento (si aplica)

- [ ] Política de privacidad
- [ ] Retención de datos
- [ ] Consentimiento del usuario
- [ ] Exportación de datos
- [ ] Borrado de datos
- [ ] Encriptar datos sensibles en reposo

### Manejo de PII

Actualmente se almacena:

- Nombres
- Edades (aproximadas)
- Emails (opcional)
- Grabaciones de audio

- [ ] Informar a usuarios sobre la recolección
- [ ] Ofrecer opciones de acceso/borrado
- [ ] Minimizar datos
- [ ] Asegurar transmisión

## 🐳 Seguridad Docker

### Contenedores

- [ ] Usar versiones específicas (no `latest`)
- [ ] Escanear imágenes:
  ```bash
  docker scan toastclub-backend
  docker scan toastclub-frontend
  ```
- [ ] Ejecutar como usuario no root si es posible
- [ ] Limitar capacidades
- [ ] Usar Docker secrets para datos sensibles

### Docker Compose en producción

- [ ] Evitar montar volúmenes con el código fuente
- [ ] Manejar `.env`/secrets de forma segura
- [ ] Exponer solo puertos necesarios

## 🌍 Entorno de despliegue

### Endurecimiento del servidor

- [ ] Mantener OS actualizado
- [ ] Configurar firewall
- [ ] Deshabilitar servicios innecesarios
- [ ] SSH con llaves
- [ ] Fail2ban o similar
- [ ] Actualizaciones regulares

### Proxy inverso

- [ ] Usar Nginx o Caddy
- [ ] Configurar SSL/TLS
- [ ] Encabezados de seguridad
- [ ] Limitación de solicitudes
- [ ] Límite de tamaño de solicitudes

Ejemplo de configuración Nginx:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Encabezados de seguridad
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Proxy al backend
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## ✅ Lista de verificación previa al despliegue

Antes de desplegar a producción, verificar:

- [ ] `SECRET_KEY` cambiado
- [ ] Credenciales de base de datos cambiadas
- [ ] `CORS_ORIGINS` actualizado
- [ ] HTTPS habilitado
- [ ] Encabezados de seguridad configurados
- [ ] Limitación de solicitudes implementada
- [ ] Registro SQL deshabilitado
- [ ] Copias de seguridad configuradas
- [ ] Monitoreo configurado
- [ ] Dependencias actualizadas
- [ ] Escaneo de seguridad completado
- [ ] Revisión de código completada
- [ ] Pruebas completadas

## 🆘 Respuesta a incidentes

### Si ocurre un incidente:

1. Aislar los sistemas afectados
2. Cambiar credenciales inmediatamente
3. Revisar logs para determinar el alcance
4. Notificar a usuarios afectados (si hubo exposición de PII)
5. Documentar el incidente
6. Implementar correcciones
7. Análisis post-mortem

### Contactos de emergencia

- [ ] Definir equipo de respuesta a incidentes
- [ ] Preparar plantillas de comunicación
- [ ] Conocer requisitos legales (notificaciones de brecha de seguridad)

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

## 🔄 Mantenimiento regular

### Mensual

- [ ] Revisar logs de acceso
- [ ] Actualizar dependencias
- [ ] Revisar avisos de seguridad
- [ ] Verificar copias de seguridad

### Trimestral

- [ ] Auditoría de seguridad
- [ ] Pruebas de penetración (si aplica)
- [ ] Revisar y actualizar contraseñas
- [ ] Revisar permisos de usuarios

---

**Recuerda: la seguridad es un proceso continuo, no una tarea de una sola vez.**

Para consultas o para reportar incidentes de seguridad, contactar al equipo de seguridad inmediatamente.
