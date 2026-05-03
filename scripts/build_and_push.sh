#!/usr/bin/env bash
set -euo pipefail

# Usage: ./build_and_push.sh PROJECT_ID
PROJECT_ID=${1:-YOUR_PROJECT_ID}
REGION=${2:-us-central1}
REPO=${3:-instagram}

SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")

BACKEND_IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:${SHORT_SHA}"
FRONTEND_IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:${SHORT_SHA}"

echo "Building backend image: ${BACKEND_IMG}"
docker build -t "${BACKEND_IMG}" ./backend
docker push "${BACKEND_IMG}"

echo "Building frontend image: ${FRONTEND_IMG}"
docker build -t "${FRONTEND_IMG}" ./frontend
docker push "${FRONTEND_IMG}"

echo "Images pushed. To deploy run: ./deploy_to_cloud_run.sh ${PROJECT_ID} ${REGION} ${SHORT_SHA}"
