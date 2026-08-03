import { createContext, useContext, useState } from 'react';

const TrackerContext = createContext(null);

export const TrackerProvider = ({ children }) => {
  const [currentDateRange, setCurrentDateRange] = useState(null); // Start with null to prevent auto-fetch
  const [activeView, setActiveView] = useState('feed'); // feed, table, calendar, board
  const [customStartDate, setCustomStartDate] = useState(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const getDateRange = () => {
    // Return null if no date range is selected
    if (!currentDateRange) {
      return { start: null, end: null };
    }

    const today = new Date();
    const start = new Date();
    const end = new Date();

    switch (currentDateRange) {
      case 'today':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'this_week':
        start.setDate(today.getDate() - today.getDay());
        end.setDate(today.getDate() + (6 - today.getDay()));
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      case 'this_month':
        start.setDate(1);
        end.setMonth(today.getMonth() + 1);
        end.setDate(0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      case 'this_year':
        start.setMonth(0);
        start.setDate(1);
        end.setMonth(11);
        end.setDate(31);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      case 'last_7_days':
        start.setDate(today.getDate() - 7);
        return {
          start: start.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'last_30_days':
        start.setDate(today.getDate() - 30);
        return {
          start: start.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'custom':
        return {
          start: customStartDate || today.toISOString().split('T')[0],
          end: customEndDate || today.toISOString().split('T')[0],
        };
      default:
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
    }
  };

  const refreshCustomRange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <TrackerContext.Provider
      value={{
        currentDateRange,
        setCurrentDateRange,
        activeView,
        setActiveView,
        getDateRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        refreshCustomRange,
        refreshKey,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};