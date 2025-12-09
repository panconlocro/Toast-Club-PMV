# Toast Club PMV - Setup Guide

## Quick Start with Docker (Recommended)

The easiest way to run the entire application is with Docker Compose.

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/panconlocro/Toast-Club-PMV.git
cd Toast-Club-PMV
```

2. **Start all services**
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:8000
- Frontend on http://localhost:3000

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/health

### Test Accounts
- **IMPULSADOR**: impulsador@toastclub.com / impulsador123
- **ANALISTA**: analista@toastclub.com / analista123

## Development Setup (Without Docker)

### Backend Setup

1. **Install Python 3.11+**

2. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up PostgreSQL**
```bash
# Create database
createdb toastclub

# Or use SQLite for quick testing
export DATABASE_URL="sqlite:///./dev.db"
```

5. **Run the backend**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### Frontend Setup

1. **Install Node.js 18+**

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Configure API URL**
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:8000
```

4. **Run the frontend**
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Database Setup

### PostgreSQL (Production)

1. Create the database:
```sql
CREATE DATABASE toastclub;
CREATE USER toastclub WITH PASSWORD 'toastclub';
GRANT ALL PRIVILEGES ON DATABASE toastclub TO toastclub;
```

2. Update `.env` file:
```
DATABASE_URL=postgresql://toastclub:toastclub@localhost:5432/toastclub
```

### SQLite (Development)

For quick local development:
```
DATABASE_URL=sqlite:///./dev.db
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key (change in production!)
- `CORS_ORIGINS`: Allowed origins for CORS

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Test Specific Module
```bash
pytest tests/test_state_machine.py -v
```

## API Documentation

Once the backend is running, visit:
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Check if port 8000 is available

### Frontend won't start
- Check if Node.js is installed
- Run `npm install` again
- Verify VITE_API_URL points to backend

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in DATABASE_URL
- Ensure database exists

### CORS errors
- Add your frontend URL to CORS_ORIGINS in .env
- Restart backend after changing .env

## Production Deployment

### Security Checklist
- [ ] Change SECRET_KEY to a strong random value
- [ ] Use strong passwords for users
- [ ] Enable HTTPS
- [ ] Configure proper CORS_ORIGINS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Review security headers

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment for Production
- Use PostgreSQL (not SQLite)
- Set strong SECRET_KEY
- Configure proper CORS
- Use environment-specific .env files
- Enable logging and monitoring

## Common Tasks

### Create a new database migration
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Reset database
```bash
# With Docker
docker-compose down -v
docker-compose up -d

# Without Docker
dropdb toastclub
createdb toastclub
```

### View logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check database
docker-compose exec db psql -U toastclub -d toastclub
```

## Next Steps

1. Review the [API Design](api_design.md)
2. Read the [PMV Overview](pmv_overview.md)
3. Explore the interactive API docs
4. Try creating a session and completing the workflow
5. Test both IMPULSADOR and ANALISTA roles
