# Expense Tracker

A modern full-stack expense management application built with React, TypeScript, Express, and MySQL. Track your daily expenses, visualize spending patterns, and manage your finances with ease.

## Features

- **User Authentication** - Secure registration, login, and logout with JWT tokens
- **Dashboard** - Overview with spending statistics, charts, and recent expenses
- **Expense Management** - Add, edit, and delete expenses with category assignment
- **Category Management** - Default categories + create custom categories with colors and icons
- **Multi-Currency Support** - 10 currencies with automatic conversion (USD, EUR, GBP, MYR, SGD, etc.)
- **Data Visualization** - Monthly trends, category breakdown pie chart, and daily spending bar chart
- **Search & Filter** - Filter expenses by date range, category, and search by description
- **Export** - Download expenses as CSV or PDF reports
- **Profile Management** - Update profile info, change password, delete account
- **Responsive Design** - Mobile-friendly web interface that adapts to all screen sizes

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Query (TanStack Query) for server state management
- React Router v6 for navigation
- Recharts for data visualization
- Axios for HTTP requests

**Backend:**
- Node.js with Express
- TypeScript
- MySQL with raw SQL queries (mysql2)
- JWT authentication with access + refresh tokens
- Zod for request validation
- bcrypt for password hashing
- PDFKit for PDF generation

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── charts/     # Chart components (Pie, Bar, Area)
│   │   │   ├── expenses/   # Expense-related components
│   │   │   ├── layout/     # Layout components (Navbar, Sidebar)
│   │   │   └── ui/         # Generic UI components (Modal, Toast)
│   │   ├── context/        # React context (AuthContext)
│   │   ├── hooks/          # Custom hooks (useExpenses, useCategories)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions (formatters)
│   └── public/             # Static assets
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Configuration (env variables)
│       ├── controllers/    # Route controllers
│       ├── middleware/     # Express middleware (auth, error, validation)
│       ├── models/         # Database connection
│       ├── routes/         # API route definitions
│       ├── scripts/        # Utility scripts (seed)
│       ├── services/       # Business logic
│       ├── utils/          # Utility functions (password, jwt)
│       └── validators/     # Zod validation schemas
├── database/               # SQL schema and seed files
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
└── package.json            # Root package.json (npm workspaces)
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/fahmifze/expense-tracker.git
cd expense-tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the `server` directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5174
```

4. **Create the database:**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE expense_tracker;
exit;

# Run schema
mysql -u root -p expense_tracker < database/schema.sql
```

5. **Seed demo data (optional):**
```bash
npm run seed
```

This creates a demo user:
- Email: `demo@example.com`
- Password: `password123`

### Running the Application

**Start both frontend and backend:**
```bash
npm run dev
```

**Or start them separately:**
```bash
# Backend only (port 3001)
npm run dev:server

# Frontend only (port 5174)
npm run dev:client
```

**Access the application:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout and invalidate refresh token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user profile |
| PATCH | `/api/users/profile` | Update profile (name, currency) |
| POST | `/api/users/change-password` | Change password |
| DELETE | `/api/users/account` | Delete account |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/:id` | Get single category |
| POST | `/api/categories` | Create custom category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete custom category |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get expenses (paginated, filterable) |
| GET | `/api/expenses/stats` | Get expense statistics |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/csv` | Export expenses as CSV |
| GET | `/api/export/pdf` | Export expenses as PDF |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

## Currency Support

The application supports 10 currencies with automatic conversion:

| Currency | Code | Symbol | Exchange Rate (to USD) |
|----------|------|--------|------------------------|
| US Dollar | USD | $ | 1.00 |
| Euro | EUR | € | 0.92 |
| British Pound | GBP | £ | 0.79 |
| Japanese Yen | JPY | ¥ | 149.50 |
| Malaysian Ringgit | MYR | RM | 4.47 |
| Singapore Dollar | SGD | S$ | 1.34 |
| Australian Dollar | AUD | A$ | 1.53 |
| Canadian Dollar | CAD | C$ | 1.36 |
| Indian Rupee | INR | ₹ | 83.12 |
| Chinese Yuan | CNY | ¥ | 7.24 |

*Note: Exchange rates are approximate and hardcoded. For production use, integrate a real-time exchange rate API.*

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server in development mode |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build both client and server |
| `npm run seed` | Seed database with demo user and sample expenses |

## Screenshots

### Dashboard
- Monthly spending overview with trend chart
- Category breakdown pie chart
- Daily spending bar chart
- Recent expenses list

### Expenses Page
- Full expense list with pagination
- Filter by category, date range, and search
- Add/edit expense modal
- Export to CSV/PDF

### Profile Page
- Update personal information
- Change display currency
- Change password
- Delete account option

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern React and TypeScript best practices
- UI inspired by modern dashboard designs
- Charts powered by Recharts library
