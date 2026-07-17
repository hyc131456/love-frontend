# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build:h5

FROM nginx:1.27-alpine
COPY docker-h5/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /workspace/dist/build/h5/ /usr/share/nginx/html/

EXPOSE 80
