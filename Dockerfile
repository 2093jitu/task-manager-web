# syntax=docker/dockerfile:1

# ---------- Global build args ----------
ARG NODE_VERSION=22.12.0
ARG NGINX_VERSION=1.27-alpine

# ---------- Build stage ----------
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy source and build
COPY . .

# Build Angular app in production mode
RUN npm run build:prod


# ---------- Runtime stage ----------
FROM nginx:${NGINX_VERSION} AS runner

# Copy nginx configuration for SPA routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled app from build stage
COPY --from=builder /app/dist/taskmanager-web /usr/share/nginx/html

EXPOSE 80

# By default, nginx image launches nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]


