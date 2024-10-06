#Use node slim to decrease build size
FROM node:20.15.0-buster-slim as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build-stage /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
