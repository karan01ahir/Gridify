# Gridify - Collage Maker with User Authentication

A beautiful collage maker application with user authentication using Node.js, Express, and SQLite.

## Features

- User Registration and Login
- Password encryption using bcrypt
- SQLite database for user data storage
- Beautiful UI for creating photo collages
- Caption and hashtag generation
- Social media sharing

## Database Schema

### Users Table
- `id` - Primary key (auto-increment)
- `full_name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

## Installation

1. Install Node.js (if not already installed)

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### POST /api/register
Register a new user
- **Body**: `{ name, email, password }`
- **Response**: `{ success, message, user }`

### POST /api/login
Login existing user
- **Body**: `{ email, password }`
- **Response**: `{ success, message, user }`

### GET /api/users
Get all users (for testing/admin)
- **Response**: `{ success, users }`

### GET /api/users/:id
Get user by ID
- **Response**: `{ success, user }`

## Security Features

- Passwords are hashed using bcrypt (10 salt rounds)
- Email validation
- Password minimum length requirement (6 characters)
- Duplicate email prevention
- SQL injection protection through parameterized queries

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: bcryptjs
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **CORS**: Enabled for cross-origin requests

## File Structure

```
gridify/
├── server.js           # Express server and API endpoints
├── package.json        # Node.js dependencies
├── users.db           # SQLite database (created automatically)
├── index.html         # Frontend application
└── README.md          # This file
```

## Notes

- The database file `users.db` will be created automatically when you first run the server
- User passwords are never stored in plain text
- The server runs on port 3000 by default
