FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# npm run build usa a URL de produção. O .env está no .dockerignore, então o
# valor tem que vir por build arg (o compose passa o dele).
ARG VITE_PROD_API_BASEURL=http://localhost:8081
ENV VITE_PROD_API_BASEURL=$VITE_PROD_API_BASEURL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
