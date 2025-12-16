import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, LoadingPage } from './components/ui';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Budget from './pages/Budget';
import Income from './pages/Income';
import Recurring from './pages/Recurring';
import News from './pages/News';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import CurrencyExchange from './pages/CurrencyExchange';

// Redirect authenticated users away from login/register
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Wrapper for protected routes with layout
function ProtectedWithLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedWithLayout>
            <Dashboard />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedWithLayout>
            <Categories />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedWithLayout>
            <Expenses />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedWithLayout>
            <Profile />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedWithLayout>
            <Budget />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/income"
        element={
          <ProtectedWithLayout>
            <Income />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/recurring"
        element={
          <ProtectedWithLayout>
            <Recurring />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/news"
        element={
          <ProtectedWithLayout>
            <News />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/stocks"
        element={
          <ProtectedWithLayout>
            <Stocks />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/stocks/:symbol"
        element={
          <ProtectedWithLayout>
            <StockDetail />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/portfolio"
        element={
          <ProtectedWithLayout>
            <Portfolio />
          </ProtectedWithLayout>
        }
      />
      <Route
        path="/currency"
        element={
          <ProtectedWithLayout>
            <CurrencyExchange />
          </ProtectedWithLayout>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
