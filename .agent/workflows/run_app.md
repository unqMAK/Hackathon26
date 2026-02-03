---
description: How to run the full stack application
---

# How to Run the Application

Since this is now a full-stack application, you need to run **both** the backend and the frontend servers simultaneously.

## 1. Database (MongoDB)
Ensure your MongoDB server is running locally.
- Windows: Usually runs automatically as a service, or run `mongod` in a terminal.

## 2. Backend Server
This handles the API and database connections.
1. Open a terminal.
2. Navigate to the server directory: `cd server`
3. Start the server: `npm run dev`
   - You should see: `Server running on port 5000` and `MongoDB Connected`.

## 3. Frontend Application
This is the React UI you interact with.
1. Open a **new** terminal (keep the backend running).
2. Navigate to the project root.
3. Start the frontend: `npm run dev`
4. Open your browser to `http://localhost:5173`.

## Troubleshooting
- **Connection Error**: If the frontend says "Network Error", ensure the backend is running on port 5000.
- **Login Failed**: Make sure MongoDB is running. You may need to register a new user since the old `localStorage` users are gone.
