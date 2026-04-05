#!/bin/bash
set -e

# Configuration
SERVER_IP="150.136.42.8"
SERVER_USER="ubuntu"
KEY_PATH="/home/leader/.ssh/childcare_server_key.pem"
REMOTE_PATH="/opt/cc-portal-api"
SSH_CMD="ssh -o StrictHostKeyChecking=no -i $KEY_PATH $SERVER_USER@$SERVER_IP"

echo "🚀 Deploying Portal API to OCI..."

# 1. Ensure remote directory exists
$SSH_CMD "sudo mkdir -p $REMOTE_PATH && sudo chown -R $SERVER_USER:$SERVER_USER $REMOTE_PATH"

# 2. Sync only source files (no node_modules — Docker builds its own)
scp -o StrictHostKeyChecking=no -i $KEY_PATH \
  portal-api/package.json \
  portal-api/package-lock.json \
  portal-api/tsconfig.json \
  portal-api/Dockerfile \
  portal-api/service-account.json \
  portal-api/.dockerignore \
  $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

# Copy src directory
$SSH_CMD "mkdir -p $REMOTE_PATH/src"
scp -o StrictHostKeyChecking=no -i $KEY_PATH \
  portal-api/src/index.ts \
  $SERVER_USER@$SERVER_IP:$REMOTE_PATH/src/

echo "📦 Files synced. Building Docker image on server..."

# 3. Build image, stop old container, start new one
$SSH_CMD "cd $REMOTE_PATH && \
  docker build -t ccbp-portal-api . && \
  (docker stop ccbp-portal-api 2>/dev/null; docker rm ccbp-portal-api 2>/dev/null; true) && \
  docker run -d \
    --name ccbp-portal-api \
    --network frappe_docker_default \
    -e DB_HOST=frappe_docker-db-1 \
    -e DB_USER=root \
    -e DB_PASSWORD='@sodium1223' \
    -e DB_NAME=ccbp_portal \
    -p 4000:4000 \
    --restart unless-stopped \
    ccbp-portal-api"

echo "✅ Portal API deployed and running on port 4000"
