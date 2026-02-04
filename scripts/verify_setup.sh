#!/bin/bash

# Toast Club PMV - Setup Verification Script
# This script checks if all components are properly configured

set -e

echo "🚀 Toast Club PMV - Setup Verification"
echo "======================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "1. Checking directory structure..."
dirs=("backend" "backend/app" "backend/app/api" "backend/app/core" "backend/app/models" "frontend" "frontend/src" "docs")
all_dirs_exist=0
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_status 0 "   Directory $dir exists"
    else
        print_status 1 "   Directory $dir is missing"
        all_dirs_exist=1
    fi
done

echo ""
echo "2. Checking required files..."
files=(
    "backend/requirements.txt"
    "backend/app/main.py"
    "backend/Dockerfile"
    "frontend/package.json"
    "frontend/Dockerfile"
    "docker-compose.yml"
    ".env.example"
    ".gitignore"
    "LICENSE"
    "README.md"
)
all_files_exist=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "   File $file exists"
    else
        print_status 1 "   File $file is missing"
        all_files_exist=1
    fi
done

echo ""
echo "3. Checking backend structure..."
backend_files=(
    "backend/app/core/config.py"
    "backend/app/core/security.py"
    "backend/app/core/state_machine.py"
    "backend/app/models/user.py"
    "backend/app/models/session.py"
    "backend/app/models/recording.py"
    "backend/app/models/survey.py"
    "backend/app/api/v1/auth.py"
    "backend/app/api/v1/sessions.py"
    "backend/app/api/v1/recordings.py"
    "backend/app/api/v1/surveys.py"
    "backend/app/api/v1/dataset.py"
)
backend_complete=0
for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "   $file"
    else
        print_status 1 "   $file missing"
        backend_complete=1
    fi
done

echo ""
echo "4. Checking frontend structure..."
frontend_files=(
    "frontend/src/App.jsx"
    "frontend/src/main.jsx"
    "frontend/src/pages/LoginPage.jsx"
    "frontend/src/pages/ImpulsorPage.jsx"
    "frontend/src/pages/AnalistaPage.jsx"
    "frontend/src/components/SessionForm.jsx"
    "frontend/src/components/SessionList.jsx"
    "frontend/src/components/SurveyForm.jsx"
    "frontend/src/api/client.js"
    "frontend/src/api/sessions.js"
)
frontend_complete=0
for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "   $file"
    else
        print_status 1 "   $file missing"
        frontend_complete=1
    fi
done

echo ""
echo "5. Checking documentation..."
doc_files=(
    "docs/pmv_overview.md"
    "docs/api_design.md"
    "docs/SETUP_GUIDE.md"
    "docs/CONTRIBUTING.md"
)
docs_complete=0
for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "   $file"
    else
        print_status 1 "   $file missing"
        docs_complete=1
    fi
done

echo ""
echo "6. Checking Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    required_packages=("fastapi" "uvicorn" "sqlalchemy" "pydantic" "python-jose" "passlib")
    deps_ok=0
    for pkg in "${required_packages[@]}"; do
        if grep -q "$pkg" backend/requirements.txt; then
            print_status 0 "   $pkg in requirements.txt"
        else
            print_status 1 "   $pkg missing from requirements.txt"
            deps_ok=1
        fi
    done
fi

echo ""
echo "7. Checking environment setup..."
if [ -f ".env.example" ]; then
    required_vars=("DATABASE_URL" "SECRET_KEY" "CORS_ORIGINS")
    env_ok=0
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example; then
            print_status 0 "   $var defined in .env.example"
        else
            print_status 1 "   $var missing from .env.example"
            env_ok=1
        fi
    done
    
    if [ ! -f ".env" ]; then
        print_warning "   .env file not found (optional for Docker)"
    fi
fi

echo ""
echo "======================================"
echo "Verification Summary"
echo "======================================"

if [ $all_dirs_exist -eq 0 ] && [ $all_files_exist -eq 0 ] && [ $backend_complete -eq 0 ] && [ $frontend_complete -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the application with: docker-compose up --build"
    echo "2. Access the frontend at: http://localhost:3000"
    echo "3. View API docs at: http://localhost:8000/docs"
    echo ""
    echo "Test accounts:"
    echo "  - IMPULSADOR: impulsador@toastclub.com / impulsador123"
    echo "  - ANALISTA: analista@toastclub.com / analista123"
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo "Please review the errors above and fix any missing files or directories."
    exit 1
fi
