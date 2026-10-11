# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Khai báo ARG để nhận biến môi trường lúc build (từ docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build dự án (Vite sẽ thay thế các biến VITE_* vào static files)
RUN npm run build

# Stage 2: Phục vụ ứng dụng bằng Nginx
FROM nginx:alpine
# Copy cấu hình Nginx custom hỗ trợ React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts từ Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
