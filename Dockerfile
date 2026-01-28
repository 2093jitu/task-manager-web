# syntax=docker/dockerfile:1

# ---------- Build stage ----------
ARG NODE_VERSION=20.11.1
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .

# Build Angular app in production mode
RUN npm run build:prod


# ---------- Runtime stage ----------
ARG NGINX_VERSION=1.27-alpine
FROM nginx:${NGINX_VERSION} AS runner

# Copy nginx configuration for SPA routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled app from build stage
COPY --from=builder /app/dist/taskmanager-web /usr/share/nginx/html

EXPOSE 80

# By default, nginx image launches nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]


