#!/bin/bash
set -e

# Configuration
SERVER_IP="150.136.42.8"
SERVER_USER="ubuntu"
KEY_PATH="/home/leader/.ssh/childcare_server_key.pem"
REMOTE_PATH="/opt/cc-claims-api"
SSH_CMD="ssh -o StrictHostKeyChecking=no -i $KEY_PATH $SERVER_USER@$SERVER_IP"

echo "🚀 Deploying Claims API to OCI..."

# 1. Ensure remote directory exists
$SSH_CMD "sudo mkdir -p $REMOTE_PATH && sudo chown -R $SERVER_USER:$SERVER_USER $REMOTE_PATH"

# 2. Sync source files
scp -o StrictHostKeyChecking=no -i $KEY_PATH \
  claims-api/package.json \
  claims-api/package-lock.json \
  claims-api/tsconfig.json \
  claims-api/Dockerfile \
  claims-api/service-account.json \
  claims-api/.dockerignore \
  $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

# Copy src directory
$SSH_CMD "mkdir -p $REMOTE_PATH/src"
scp -o StrictHostKeyChecking=no -i $KEY_PATH \
  claims-api/src/index.ts \
  $SERVER_USER@$SERVER_IP:$REMOTE_PATH/src/

echo "📦 Files synced. Building Docker image on server..."

# 3. Build image, stop old container, start new one
$SSH_CMD "cd $REMOTE_PATH && \
  docker build -t ccbp-claims-api . && \
  (docker stop ccbp-claims-api 2>/dev/null; docker rm ccbp-claims-api 2>/dev/null; true) && \
  docker run -d \
    --name ccbp-claims-api \
    -p 4100:4100 \
    --restart unless-stopped \
    ccbp-claims-api && \
  docker network connect frappe_docker_default ccbp-claims-api 2>/dev/null; true"

echo "✅ Claims API deployed and running on port 4100"
