<<<<<<< HEAD
<<<<<<< HEAD
# Task Manager Web Application

A full-featured task management application built with Node.js, Express, MongoDB, and React.

## Features

- User Authentication (Register/Login)
- Task Management (CRUD operations)
- Task Filtering and Search
- Dashboard with Statistics
- Calendar View
- Dark/Light Theme Support
- Mobile Responsive Design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React
- Tailwind CSS
- Context API for state management

## Project Structure

```
task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── stats.js
│   │   └── calendar.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── utils/
    └── package.json
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a new task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task
- GET /api/tasks/filter - Filter tasks

### Statistics
- GET /api/stats/overview - Get overall statistics
- GET /api/stats/by-status - Get tasks by status
- GET /api/stats/by-priority - Get tasks by priority
- GET /api/stats/by-label - Get tasks by label
- GET /api/stats/weekly-trends - Get weekly task trends

### Calendar
- GET /api/calendar/month/:year/:month - Get tasks for a month
- GET /api/calendar/date/:year/:month/:day - Get tasks for a specific date
- PUT /api/calendar/:taskId/due-date - Update task due date

## Setup Instructions

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Create a .env file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
5. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
6. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 
=======
# Task-Manager-App
# Task Manager Web App  A modern task management application with calendar view, analytics dashboard, and real-time updates. Built with React, Node.js, and MongoDB.  Features: - 📅 Interactive calendar - 📊 Analytics dashboard - 🎯 Task prioritization - 🔍 Search &amp; filters - 🌙 Dark mode
>>>>>>> e0735da1677c301db0f45c33f4541f860ec07ce3
=======
# Task-Manager-App
>>>>>>> c79aa701c80efd94e069aa3d7da0b357753b7d6d
