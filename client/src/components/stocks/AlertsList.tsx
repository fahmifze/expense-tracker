import { useTheme } from '../../context/ThemeContext';
import { useAlerts, useUpdateAlert, useDeleteAlert } from '../../hooks/useStocks';
import { PriceAlert } from '../../types/stock.types';

interface AlertsListProps {
  activeOnly?: boolean;
  onCreateAlert?: () => void;
}

export default function AlertsList({ activeOnly = false, onCreateAlert }: AlertsListProps) {
  const { isDark } = useTheme();
  const { data, isLoading, error } = useAlerts(activeOnly);
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();

  if (isLoading) {
    return (
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          Failed to load alerts
        </p>
      </div>
    );
  }

  const alerts = data?.alerts || [];

  const handleToggleActive = (alert: PriceAlert) => {
    updateAlert.mutate({
      alertId: alert.id,
      data: { isActive: !alert.isActive },
    });
  };

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Price Alerts
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {alerts.filter(a => a.isActive && !a.isTriggered).length} active
          </p>
        </div>
        {onCreateAlert && (
          <button
            onClick={onCreateAlert}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Alert
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center">
          <svg
            className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            No price alerts
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Create an alert to get notified when a stock hits your target price
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 transition-colors ${
                !alert.isActive ? (isDark ? 'bg-gray-800/50' : 'bg-gray-50') : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.isTriggered
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : alert.conditionType === 'above'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {alert.isTriggered ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={alert.conditionType === 'above' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {alert.symbol}
                      </span>
                      {alert.isTriggered && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                          Triggered
                        </span>
                      )}
                      {!alert.isActive && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                        }`}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {alert.conditionType === 'above' ? 'Above' : 'Below'} ${alert.targetPrice.toFixed(2)}
                      {alert.currentPrice && (
                        <span className="ml-2">
                          (Current: ${alert.currentPrice.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(alert)}
                    className={`p-1.5 rounded transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={alert.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {alert.isActive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => deleteAlert.mutate(alert.id)}
                    className={`p-1.5 rounded transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                        : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                    }`}
                    title="Delete alert"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
