# church-system/Dockerfile

# -------------------------------------------
#  Stage 1: Build the React app with Vite
# -------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build the production version of the frontend
RUN npm run build

# -------------------------------------------
#  Stage 2: Serve the built files with nginx
# -------------------------------------------
FROM nginx:stable-alpine

# Copy the built files from the first stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration (explained below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (the default HTTP port)
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
