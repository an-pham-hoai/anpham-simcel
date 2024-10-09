# Use an official Node.js runtime as the base image
FROM node:20.15.0-buster-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the PORT (passed as argument)
ARG PORT
ENV PORT=${PORT}

# Expose the MongoDB connection string as an environment variable
ARG MONGO_CONNECTION_STRING
ENV MONGO_CONNECTION_STRING=${MONGO_CONNECTION_STRING}

# Build and start the application
RUN npm run build

CMD ["npm", "run", "start:prod"]
