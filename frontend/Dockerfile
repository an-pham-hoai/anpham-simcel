#FROM node:lts-buster AS build-stage
#FROM node:20.15.0-buster-slim as build-stage
# Step 1: Build Stage
FROM node:20.15.0-buster-slim AS build

# Set working directory
WORKDIR /app

RUN npm i -g @angular/cli

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the project files
COPY . .

# Build the Angular app with production configuration
RUN npm run build --prod

# Expose port
EXPOSE 4200

# Run the Angular app using ng serve, for production, use nginx instead
# CMD ["npm", "run", "start"]
CMD ["ng", "serve", "--host=0.0.0.0"]