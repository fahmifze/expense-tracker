# Expense Tracker

A modern full-stack expense management application built with React, TypeScript, Express, and MySQL.

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Query for server state management
- React Router for navigation
- Recharts for data visualization

**Backend:**
- Node.js with Express
- TypeScript
- MySQL with raw SQL queries (mysql2)
- JWT authentication with refresh tokens
- Zod for validation

## Features

- User authentication (register, login, logout)
- Dashboard with expense statistics and charts
- Add, edit, and delete expenses
- Category management (default + custom categories)
- Filter and search expenses
- Export expenses to CSV and PDF
- User profile management
- Password change functionality
- Responsive design

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Express backend
│   └── src/
│       ├── config/        # Configuration
│       ├── controllers/   # Route controllers
│       ├── middleware/    # Express middleware
│       ├── models/        # Database models
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       ├── utils/         # Utility functions
│       └── validators/    # Request validators
├── database/              # SQL schema files
└── package.json           # Root package.json (workspaces)
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5174
```

5. Create the database and run the schema:
```bash
mysql -u root -p < database/schema.sql
```

### Running the Application

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or start them separately:
```bash
# Backend only
npm run dev:server

# Frontend only
npm run dev:client
```

The application will be available at:
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password
- `DELETE /api/users/me` - Delete account

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses
- `GET /api/expenses` - Get expenses (with filters/pagination)
- `GET /api/expenses/stats` - Get expense statistics
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Export
- `GET /api/export/csv` - Export expenses as CSV
- `GET /api/export/pdf` - Export expenses as PDF

## License

MIT
