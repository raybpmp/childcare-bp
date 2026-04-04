#!/bin/bash

# Configuration
SERVER_IP="150.136.42.8"
SERVER_USER="ubuntu"
KEY_PATH="/home/leader/.ssh/childcare_server_key.pem"
REMOTE_PATH="/opt/cc-portal-api"

echo "🚀 Preparing deployment to OCI..."

# 1. Sync files to server
ssh -i $KEY_PATH $SERVER_USER@$SERVER_IP "sudo mkdir -p $REMOTE_PATH && sudo chown -R $SERVER_USER:$SERVER_USER $REMOTE_PATH"
scp -i $KEY_PATH -r portal-api/* $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

# 2. Build and Start Container on Server
ssh -i $KEY_PATH $SERVER_USER@$SERVER_IP "cd $REMOTE_PATH && \
docker build -t ccbp-portal-api . && \
docker stop ccbp-portal-api || true && \
docker rm ccbp-portal-api || true && \
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
