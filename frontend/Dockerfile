# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Accept build-time variables so Vite can embed them in the bundle
ARG VITE_API_BASE_URL
ARG VITE_DEFAULT_TENANT_SLUG=demo

# Expose them as env vars so Vite picks them up during `npm run build`
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEFAULT_TENANT_SLUG=$VITE_DEFAULT_TENANT_SLUG

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run routes traffic to port 80 (set via --port 80 in gcloud run deploy)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
