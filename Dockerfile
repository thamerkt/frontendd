# Step 1: Build the Vite app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
