#!/bin/bash
set -e

# ==========================================
# DEPLOY TASK-ME CHAMA PORTAL (ONLY)
# ==========================================

# Guardrail: Ensure we are in the correct directory
DIR_NAME=$(basename "$PWD")
if [ "$DIR_NAME" != "Taskme Chama" ]; then
  echo "ERROR: You are running this script from the wrong directory! Current directory is $DIR_NAME, expected 'Taskme Chama'"
  exit 1
fi

echo "----------------------------------------"
echo "Deploying Task-Me Chama Portal..."
echo "----------------------------------------"

# Sync Backend
echo "Syncing Backend..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.env' --exclude '.env.*' -e "ssh -i taskme-prod-key.pem -o StrictHostKeyChecking=no" ./backend/ ubuntu@chama.task-me.ke:~/taskme-chama/backend/

# Sync Frontend
echo "Syncing Frontend..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.env' --exclude '.env.*' -e "ssh -i taskme-prod-key.pem -o StrictHostKeyChecking=no" ./frontend/ ubuntu@chama.task-me.ke:~/taskme-chama/frontend/

# Rebuild and Restart remotely
echo "Triggering Remote Build..."
ssh -i taskme-prod-key.pem -o StrictHostKeyChecking=no ubuntu@chama.task-me.ke << 'EOF'
  set -e
  echo "Building Backend (Task-Me Chama)..."
  cd ~/taskme-chama/backend
  npm install
  npx prisma generate
  npx prisma db push --accept-data-loss
  npm run build
  pm2 restart taskme-api || pm2 start dist/server.js --name "taskme-api"
  pm2 save
  
  echo "Building Frontend (Task-Me Chama)..."
  cd ~/taskme-chama/frontend
  npm install
  npm run build
EOF

echo "========================================"
echo "Deployment of Task-Me Chama Successful!"
echo "========================================"
