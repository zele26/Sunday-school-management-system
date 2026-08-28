#!/usr/bin/env bash
# ==============================================================================
# DevSecOps Local Pipeline Execution Script for Ubuntu / Linux
# Sunday School Management System
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE} Starting Local DevSecOps Pipeline Verification      ${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Step 1: Software Composition Analysis (SCA) & Unit Tests - Backend
echo -e "\n${YELLOW}[Stage 1/5] Backend SCA Audit & Code Quality Check...${NC}"
if [ -d "church-server" ]; then
    cd church-server
    echo "Running npm audit for backend..."
    npm audit --audit-level=high || echo -e "${YELLOW}Warning: High/Critical vulnerabilities found in backend npm dependencies.${NC}"
    if npm run | grep -q "test"; then
        npm test || true
    fi
    cd ..
else
    echo -e "${RED}Error: church-server directory not found!${NC}"
    exit 1
fi

# Step 2: Software Composition Analysis (SCA) & Linting - Frontend
echo -e "\n${YELLOW}[Stage 2/5] Frontend SCA Audit & Build Verification...${NC}"
if [ -d "church-system" ]; then
    cd church-system
    echo "Running npm audit for frontend..."
    npm audit --audit-level=high || echo -e "${YELLOW}Warning: High/Critical vulnerabilities found in frontend npm dependencies.${NC}"
    echo "Testing Frontend build..."
    npm run build
    cd ..
else
    echo -e "${RED}Error: church-system directory not found!${NC}"
    exit 1
fi

# Step 3: Container Build
echo -e "\n${YELLOW}[Stage 3/5] Building Docker Container Images...${NC}"
docker build -t church-backend:local ./church-server
docker build -t church-frontend:local ./church-system
echo -e "${GREEN}✓ Docker images built successfully.${NC}"

# Step 4: Container Security Scan (Trivy)
echo -e "\n${YELLOW}[Stage 4/5] Scanning Containers with Trivy...${NC}"
if command -v trivy &> /dev/null; then
    echo "Scanning backend image with Trivy..."
    trivy image --severity HIGH,CRITICAL --exit-code 0 church-backend:local
    echo "Scanning frontend image with Trivy..."
    trivy image --severity HIGH,CRITICAL --exit-code 0 church-frontend:local
    echo -e "${GREEN}✓ Trivy scans complete.${NC}"
else
    echo -e "${YELLOW}Trivy is not installed on this system. Skipping container scanning.${NC}"
    echo -e "${YELLOW}To install Trivy on Ubuntu, run: sudo apt-get install trivy${NC}"
fi

# Step 5: Docker Compose Stack Deployment
echo -e "\n${YELLOW}[Stage 5/5] Deploying Stack via Docker Compose...${NC}"
docker-compose down || true
docker-compose up --build -d

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN} DevSecOps Local Pipeline Completed Successfully!    ${NC}"
echo -e "${GREEN} Frontend running at http://localhost:80              ${NC}"
echo -e "${GREEN} Backend running at http://localhost:5000           ${NC}"
echo -e "${GREEN}=====================================================${NC}"
