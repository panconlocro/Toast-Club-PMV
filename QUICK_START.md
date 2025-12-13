# Toast Club PMV - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1️⃣ Prerequisites
- [Docker](https://www.docker.com/get-started) installed
- [Git](https://git-scm.com/) installed

### 2️⃣ Clone & Start
```bash
# Clone repository
git clone https://github.com/panconlocro/Toast-Club-PMV.git
cd Toast-Club-PMV

# Start everything with Docker
docker-compose up --build
```

Wait for the services to start (~2-3 minutes first time).

### 3️⃣ Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web interface |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **API Health** | http://localhost:8000/health | Check backend status |

### 4️⃣ Login

Choose a role and login:

**Option A: IMPULSADOR (Session Creator)**
- Email: `impulsador@toastclub.com`
- Password: `impulsador123`

**Option B: ANALISTA (Data Analyst)**
- Email: `analista@toastclub.com`
- Password: `analista123`

---

## 🎯 What Can I Do?

### As IMPULSADOR:
1. **Create Session**: Fill participant info and training text
2. **Start Session**: Begin the training workflow
3. **Upload Recording**: Submit audio (mock)
4. **Complete Survey**: Provide feedback

### As ANALISTA:
1. **View Sessions**: See all training sessions
2. **Export Data**: Download CSV dataset
3. **View Statistics**: Check session metrics

---

## 📖 Session Workflow

```
1. Created          → Session initialized
2. Ready to Start   → Prepared for training
3. Running          → Training in progress
4. Audio Uploaded   → Recording submitted
5. Survey Pending   → Waiting for feedback
6. Completed        ✅ Session finished
```

---

## 🛠️ Troubleshooting

### Docker won't start?
```bash
# Stop everything
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up --build
```

### Port already in use?
Edit `docker-compose.yml` and change ports:
- Backend: Change `8000:8000` to `8001:8000`
- Frontend: Change `3000:3000` to `3001:3000`

### Can't connect to backend?
Check if backend is running:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

---

## 📚 Need More Help?

- **Setup Guide**: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
- **API Documentation**: [docs/api_design.md](docs/api_design.md)
- **Project Overview**: [docs/pmv_overview.md](docs/pmv_overview.md)
- **Full README**: [README.md](README.md)

---

## 🧪 Quick Test

### Test the API (in a new terminal):
```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"impulsador@toastclub.com","password":"impulsador123"}'

# Create session (copy token from login response)
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "datos_participante": {
      "nombre": "Test User",
      "edad_aproximada": 25
    },
    "texto_seleccionado": "Practice speaking text"
  }'
```

---

## ✅ Verify Installation

Run the verification script:
```bash
bash scripts/verify_setup.sh
```

Should show all green checkmarks ✓

---

## 🎉 You're Ready!

Visit http://localhost:3000 and start exploring!

**Tip**: Open the API docs (http://localhost:8000/docs) in another tab to explore all available endpoints interactively.

---

## 💡 Quick Tips

- Frontend auto-reloads when you edit files in `frontend/src/`
- Backend auto-reloads when you edit files in `backend/app/`
- Database persists in Docker volume (survives restarts)
- View logs: `docker-compose logs -f backend` or `frontend`
- Stop everything: `docker-compose down`

---

**Happy Training! 🎤**
