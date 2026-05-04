# E-commerce SaaS Monorepo

A starter project for a SaaS-style e-commerce application using React on the frontend and Express.js on the backend.

## Features

- React + Vite frontend
- Express.js backend with MVC-style controllers
- API versioning and environment configuration
- CORS, request logging, error middleware
- Monorepo workspace structure

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start both apps in development:
   ```bash
   npm run dev
   ```

3. Backend API runs at `http://localhost:4000` and frontend at `http://localhost:5173`.

## Structure

- `frontend/` - React application
- `backend/` - Express API server

## Notes

- Replace sample data with a database for production.
- Add authentication, payment integration, and tenancy for SaaS.
