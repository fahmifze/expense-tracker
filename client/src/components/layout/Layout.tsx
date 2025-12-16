import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'D' },
  { path: '/expenses', label: 'Expenses', icon: 'E' },
  { path: '/income', label: 'Income', icon: 'I' },
  { path: '/budget', label: 'Budget', icon: 'B' },
  { path: '/stocks', label: 'Stocks', icon: 'S' },
  { path: '/portfolio', label: 'Portfolio', icon: '$' },
  { path: '/news', label: 'News', icon: 'N' },
  { path: '/recurring', label: 'Recurring', icon: 'R' },
  { path: '/categories', label: 'Categories', icon: 'C' },
  { path: '/profile', label: 'Profile', icon: 'P' },
];

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Finance Hub
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/profile"
              className={`hidden sm:block hover:text-primary-600 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
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
            <div className={`rounded-xl shadow-sm border p-2 transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    location.pathname === item.path
                      ? isDark
                        ? 'bg-primary-900/30 text-primary-400 font-medium'
                        : 'bg-primary-50 text-primary-700 font-medium'
                      : isDark
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t px-4 py-2 z-40 transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-around">
              {navItems.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                    location.pathname === item.path
                      ? isDark ? 'text-primary-400' : 'text-primary-600'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
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
