# backend/Dockerfile
FROM node:22-alpine AS base
WORKDIR /app

# Install deps first for better layer caching
COPY package*.json package-lock.json ./
RUN npm ci --omit=production

# Copy source
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
