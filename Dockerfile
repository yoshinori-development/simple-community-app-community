# syntax = docker/dockerfile:experimental

# Base
FROM node:16-bullseye-slim as base

# Workspace
FROM base as workspace
RUN apt -y update && \
    apt -y install unzip curl ssh git wget
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip ./aws
WORKDIR /workspace

# Build
FROM base as build
ARG ENV
COPY . /root/app
WORKDIR /root/app
RUN npm install && npm run build -- --mode ${ENV}
 
# Release (SPA)
FROM debian:bullseye-slim as release-spa
# Debianイメージのセキュリティアップデート
# https://linuxsecurity.com/features/how-to-install-security-updates-in-ubuntu-debian
RUN apt update && apt full-upgrade -y && apt autoremove -y && apt autoclean -y
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /root/app/dist/ /var/www/html/public/
CMD nginx -g 'daemon off;'
EXPOSE 80

# # Release (SSR)
# FROM gcr.io/distroless/nodejs-debian10 as release-ssr
# COPY --from=build-env /app /app
# WORKDIR /app
# CMD ["hello.js"]
