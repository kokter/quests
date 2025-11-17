FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend /app

ARG REACT_APP_PATH_URL_API=http://localhost:8000/api
ENV REACT_APP_PATH_URL_API=${REACT_APP_PATH_URL_API}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
