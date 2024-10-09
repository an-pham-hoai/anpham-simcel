#FROM node:lts-buster AS build-stage
#FROM node:20.15.0-buster-slim as build-stage
# Step 1: Build Stage
FROM node:20.15.0-buster-slim AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the project files
COPY . .

# Build the Angular app with production configuration
RUN npm run build --prod

# Step 2: Production Stage
FROM nginx:alpine

# Copy the built Angular app from the build stage
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copy the nginx configuration file (optional, if you need custom configuration)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 4200

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
