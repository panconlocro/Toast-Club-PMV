# Toast Club PMV – Guía de instalación y ejecución

## Inicio rápido con Docker (recomendado)

La forma más sencilla de levantar toda la aplicación es usando Docker Compose.

- Docker
- Docker Compose

### Pasos

1) **Clonar el repositorio**

```bash
git clone https://github.com/panconlocro/Toast-Club-PMV.git
cd Toast-Club-PMV
```

2) **Levantar todos los servicios**

```bash
docker-compose up --build
```

- Backend API en http://localhost:8000
- Frontend (Vite) en http://localhost:3000

- Swagger (documentación del API): http://localhost:8000/docs
- Health (salud): http://localhost:8000/health

- **IMPULSADOR**: `impulsador@toastclub.com` / `impulsador123`
- **ANALISTA**: `analista@toastclub.com` / `analista123`

---

## Configuración de desarrollo (sin Docker)

### Backend

1) **Instalar Python 3.11+**

2) **Crear y activar un entorno virtual**

```bash
cd backend
python -m venv venv
```


- Windows (PowerShell):

```bash
venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source venv/bin/activate
```

3) **Instalar dependencias**

```bash
pip install -r requirements.txt
```

4) **Configurar variables de entorno**

En la raíz del proyecto, copia `.env.example` a `.env` y ajusta valores:

```bash
copy .env.example .env
```

- `SECRET_KEY`: clave JWT (cámbiala para entornos reales)
- `CORS_ORIGINS`: orígenes permitidos

Nota: para el almacenamiento de audio (Cloudflare R2) se requieren variables `R2_*` (ver [docs/api_design.md](api_design.md)).


- Opción A: usando Docker solo para la DB:

```bash
docker-compose up -d db
```

- Opción B: PostgreSQL local (instalado en tu máquina) y `DATABASE_URL` apuntando a tu instancia.

6) **Correr el backend**

Importante: corre Uvicorn desde la carpeta `backend/`.

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El API queda en http://localhost:8000

### Frontend

1) **Instalar Node.js 18+**

2) **Instalar dependencias**

```bash
cd frontend
npm install
```

3) **Configurar URL del API**

Por defecto se puede usar la variable `VITE_API_URL` apuntando al backend:

Crear `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

4) **Correr el frontend**

```bash
npm run dev
```


---

## Base de datos

### PostgreSQL (recomendado)

Ejemplo de creación (opcional, según tu instalación local):

```sql
CREATE DATABASE toastclub;
CREATE USER toastclub WITH PASSWORD 'toastclub';
GRANT ALL PRIVILEGES ON DATABASE toastclub TO toastclub;
```

Ejemplo de `DATABASE_URL`:

```
DATABASE_URL=postgresql://toastclub:toastclub@localhost:5432/toastclub
```

---

## Pruebas

### Pruebas del backend

```bash
cd backend
pytest
```

Ejecutar un test específico:

```bash
pytest tests/test_state_machine.py -v
```

---

## Documentación del API

- Swagger: http://localhost:8000/docs

---

## Solución de problemas

- Verifica que PostgreSQL esté corriendo y que `DATABASE_URL` sea correcto.
- Verifica que el puerto 8000 esté libre.

- Ejecuta `npm install`.
- Verifica que `VITE_API_URL` apunte al backend.


- Verifica que la DB exista y que las credenciales en `DATABASE_URL` sean correctas.



---

## Siguientes pasos

1) Leer el diseño de API: [docs/api_design.md](api_design.md)
2) Leer la visión general del PMV: [docs/pmv_overview.md](pmv_overview.md)
3) Probar el flujo completo: crear sesión → `running` → upload Unity → encuesta → `completed`
