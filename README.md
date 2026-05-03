# Instagram Clone

A minimal Instagram-like web application for learning and demonstration. This repo contains a Node/Express backend and a Vite + React frontend, containerized with Docker and set up for Cloud Run deployment.

## Features

- User authentication (signup/login)
- Create, list, and interact with posts
- Notifications and basic tenant support
- Dockerized frontend and backend
- Cloud Build + Cloud Run deployment scripts

## Repository Layout

- backend/ — Node/Express API, controllers, models, and routes
- frontend/ — Vite + React frontend app
- cloudbuild.yaml — Cloud Build pipeline configuration
- scripts/ — helper scripts: `build_and_push.sh`, `deploy_to_cloud_run.sh`

## Prerequisites

- Node.js (v16+ recommended)
- npm or pnpm
- Docker (to build images)
- Google Cloud SDK (`gcloud`) if deploying to Cloud Run

## Local Development

1. Backend
   - Install dependencies and start the server:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   - Environment variables (example):

   ```env
   MONGODB_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   PORT=8080
   ```

2. Frontend
   - Install dependencies and start the dev server:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Open the app at the address printed by Vite (usually http://localhost:5173).

## Docker

- Build backend image:

```bash
docker build -t instagram-clone-backend ./backend
```

- Build frontend image:

```bash
docker build -t instagram-clone-frontend ./frontend
```

You can adapt `scripts/build_and_push.sh` to build and push images to a container registry.

## Deployment

- This repo includes `cloudbuild.yaml` for Google Cloud Build and a helper script `scripts/deploy_to_cloud_run.sh` for deploying images to Cloud Run. Typical flow:

```bash
# build & push images (customize project and image names)
./scripts/build_and_push.sh

# deploy to Cloud Run
./scripts/deploy_to_cloud_run.sh <SERVICE_NAME> <IMAGE_URL>
```

## Useful Scripts

- `scripts/build_and_push.sh` — build and push images
- `scripts/deploy_to_cloud_run.sh` — deploy to Cloud Run
- `backend/scripts/listUsers.js` — utility to list users

## Environment

Keep environment variables secure (use Secret Manager / Cloud Run environment configuration). Example variables used by the backend: `MONGODB_URI`, `JWT_SECRET`, `PORT`.

## Contributing

Contributions are welcome. Open issues or PRs for bug fixes and improvements.

## License

This project is provided as-is for learning purposes. Add a license file if you plan to open-source it.
