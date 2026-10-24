
# Etapa 1: construir el frontend React
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8080
ARG VITE_PRODUCTS_ENDPOINT=/api/productos

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PRODUCTS_ENDPOINT=$VITE_PRODUCTS_ENDPOINT

RUN npm run build

# Etapa 2: servir los archivos estáticos
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
