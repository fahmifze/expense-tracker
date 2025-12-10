import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'D' },
  { path: '/expenses', label: 'Expenses', icon: 'E' },
  { path: '/income', label: 'Income', icon: 'I' },
  { path: '/budget', label: 'Budget', icon: 'B' },
  { path: '/recurring', label: 'Recurring', icon: 'R' },
  { path: '/categories', label: 'Categories', icon: 'C' },
  { path: '/profile', label: 'Profile', icon: 'P' },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Expense Tracker
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="text-gray-600 hidden sm:block hover:text-primary-600 transition-colors"
            >
              {user?.firstName} {user?.lastName}
            </Link>
            <button onClick={logout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <nav className="hidden md:block w-48 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-sm">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
            <div className="flex justify-around">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg ${
                    location.pathname === item.path
                      ? 'text-primary-600'
                      : 'text-gray-500'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
