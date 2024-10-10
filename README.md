

# Inventory Management System

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction
This project is a scalable **Inventory Management System** designed for warehouses in a supply chain network. It allows users to manage inventory tracking, order processing, and reporting efficiently.

## Features
- **Multi-Version API**: Supports multiple versions of the API for backward compatibility.
- **Order Management**: Create, view, and fulfill orders while automatically adjusting inventory.
- **Real-time Inventory Updates**: Reduces inventory when orders are processed.
- **Authentication**: Secured endpoints with JWT authentication.
- **User-Friendly Interface**: A frontend built with Angular for an intuitive user experience.

## Technologies Used
- **Backend**: NodeJS, NestJS
- **Frontend**: Angular
- **Database**: MongoDB
- **Authentication**: JWT
- **Others**: TypeScript, Mongoose

## Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 20+ or later)
- [MongoDB](https://www.mongodb.com/) (set up locally or use a cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/an-pham-hoai/anpham-simcel.git
   ```

2. Navigate to the project directory:
   ```bash
   cd anpham-simcel
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the Project By Docker (1st option)
   
   docker-compose up -d --build

## Running the Project Manually (2nd option)

### Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the backend server:
   ```bash
   npm run start:dev
   ```

### Start the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the frontend application:
   ```bash
   ng serve
   ```

### Access the Application
- The frontend will typically run at `http://localhost:4200`.
- The backend API will typically be accessible at `http://localhost:3000`.

### Logins
There are 2 mock users that can be used to login:
admin/go
user/me