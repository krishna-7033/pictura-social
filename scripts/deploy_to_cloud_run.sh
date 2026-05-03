#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy_to_cloud_run.sh PROJECT_ID REGION
PROJECT_ID=${1:-YOUR_PROJECT_ID}
REGION=${2:-us-central1}

IMAGE_TAG=${3:-latest}

BACKEND_IMG="us-central1-docker.pkg.dev/${PROJECT_ID}/instagram/backend:${IMAGE_TAG}"
FRONTEND_IMG="us-central1-docker.pkg.dev/${PROJECT_ID}/instagram/frontend:${IMAGE_TAG}"

echo "Deploying backend to Cloud Run..."
gcloud run deploy ig-backend \
  --image "${BACKEND_IMG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars "PORT=8080"

echo "Deploying frontend to Cloud Run..."
gcloud run deploy ig-frontend \
  --image "${FRONTEND_IMG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated

echo "Done. Use 'gcloud run services list --platform managed --region ${REGION}' to view services and URLs."
