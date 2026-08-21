import { useState, useEffect } from 'react';
import { getApiErrorMessage, useTotalBalance, useFinanceDataByDateRange, useUpdateTransaction } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, CalendarIcon, TableCellsIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel } from '@headlessui/react';
import { EmptyTransactionState } from '../components/EmptyState';

// Move dateRangeOptions outside component to avoid recreation on renders
const dateRangeOptions = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const viewOptions = [
  { value: 'feed', label: 'Feed', icon: QueueListIcon },
  { value: 'table', label: 'Table', icon: TableCellsIcon },
  { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

const Finance = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // Start with null to prevent auto-fetch
  const [currentDateRange, setCurrentDateRange] = useState(null);
  const [activeView, setActiveView] = useState('feed'); // feed, table, calendar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    date: '',
    category: 'expense',
    amount: '',
    note: '',
    details: {},
  });
  const updateTransaction = useUpdateTransaction();
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

  // Helper function to get date range based on selection
  const getDateRange = () => {
    if (!currentDateRange) {
      return { start: null, end: null };
    }

    // For 'all' option, return special values to indicate no date filtering
    if (currentDateRange === 'all') {
      return { start: 'all', end: 'all' };
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
      case 'last_month':
        start.setMonth(today.getMonth() - 1);
        start.setDate(1);
        end.setMonth(today.getMonth());
        end.setDate(0);
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

  const { start, end } = getDateRange();

  const { data: balanceData, error: balanceError } = useTotalBalance();
  const { data: financeData, isLoading: financeLoading, error: financeError } = useFinanceDataByDateRange(
    start,
    end,
    refreshKey
  );
  const { error: toastError } = useToast();

  // Update custom date inputs based on selection
  useEffect(() => {
    if (currentDateRange === 'all' && financeData?.start_date && financeData?.end_date) {
      setCustomStartDate(financeData.start_date);
      setCustomEndDate(financeData.end_date);
    } else if (currentDateRange && currentDateRange !== 'all' && currentDateRange !== 'custom') {
      const today = new Date();
      const start = new Date();
      const end = new Date();
      let clientStart, clientEnd;

      switch (currentDateRange) {
        case 'today':
          clientStart = today.toISOString().split('T')[0];
          clientEnd = today.toISOString().split('T')[0];
          break;
        case 'this_week':
          start.setDate(today.getDate() - today.getDay());
          end.setDate(today.getDate() + (6 - today.getDay()));
          clientStart = start.toISOString().split('T')[0];
          clientEnd = end.toISOString().split('T')[0];
          break;
        case 'this_month':
          start.setDate(1);
          end.setMonth(today.getMonth() + 1);
          end.setDate(0);
          clientStart = start.toISOString().split('T')[0];
          clientEnd = end.toISOString().split('T')[0];
          break;
        case 'this_year':
          start.setMonth(0);
          start.setDate(1);
          end.setMonth(11);
          end.setDate(31);
          clientStart = start.toISOString().split('T')[0];
          clientEnd = end.toISOString().split('T')[0];
          break;
        case 'last_month':
          start.setMonth(today.getMonth() - 1);
          start.setDate(1);
          end.setMonth(today.getMonth());
          end.setDate(0);
          clientStart = start.toISOString().split('T')[0];
          clientEnd = end.toISOString().split('T')[0];
          break;
        case 'last_7_days':
          start.setDate(today.getDate() - 7);
          clientStart = start.toISOString().split('T')[0];
          clientEnd = today.toISOString().split('T')[0];
          break;
        default:
          clientStart = today.toISOString().split('T')[0];
          clientEnd = today.toISOString().split('T')[0];
      }

      if (clientStart && clientEnd) {
        setCustomStartDate(clientStart);
        setCustomEndDate(clientEnd);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDateRange, financeData?.start_date, financeData?.end_date]);

  useEffect(() => {
    if (financeError) {
      toastError(getApiErrorMessage(financeError));
    }
  }, [financeError]);

  useEffect(() => {
    if (balanceError) {
      toastError(getApiErrorMessage(balanceError));
    }
  }, [balanceError]);

  // Use the data from the date range query
  const sourceData = financeData;
  const sourceLoading = financeLoading;

  // Handle different API response structures
  let transactionsArray = [];
  
  if (Array.isArray(sourceData)) {
    // Direct array response
    transactionsArray = sourceData;
  } else if (sourceData && typeof sourceData === 'object') {
    // Object response - look for common keys that might contain the array
    if (Array.isArray(sourceData.transactions)) {
      transactionsArray = sourceData.transactions;
    } else if (Array.isArray(sourceData.data)) {
      transactionsArray = sourceData.data;
    } else if (Array.isArray(sourceData.results)) {
      transactionsArray = sourceData.results;
    } else if (Array.isArray(sourceData.items)) {
      transactionsArray = sourceData.items;
    } else {
      // Try to find any array property in the object
      const arrayKey = Object.keys(sourceData).find(key => 
        Array.isArray(sourceData[key])
      );
      if (arrayKey) {
        transactionsArray = sourceData[arrayKey];
      } else {
        console.warn('No array found in API response:', sourceData);
      }
    }
  }

  // Use transactions directly - no additional filtering needed for custom range
  const processedFinanceData = transactionsArray;
  
  // Recalculate income/expense based on filtered data - only if data is loaded
  const monthlyIncome = (!sourceLoading && processedFinanceData) 
    ? processedFinanceData.filter(t => t && t.category === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    : 0;
  
  const monthlyExpense = (!sourceLoading && processedFinanceData)
    ? processedFinanceData.filter(t => t && t.category === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    : 0;

  const handleEditClick = (transaction) => {
    setTransactionForm({
      date: transaction.date || transaction.created_at || '',
      category: transaction.category || 'expense',
      amount: transaction.amount || '',
      note: transaction.note || transaction.description || '',
      details: transaction.details || {},
    });
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const handleTransactionSubmit = () => {
    if (selectedTransaction?.id) {
      updateTransaction.mutate({
        id: selectedTransaction.id,
        data: {
          date: transactionForm.date,
          category: transactionForm.category,
          amount: parseFloat(transactionForm.amount),
          note: transactionForm.note,
          details: transactionForm.details,
        },
      }, {
        onSuccess: () => {
          setIsDrawerOpen(false);
          setSelectedTransaction(null);
        },
      });
    }
  };

  const balance = balanceData?.total_balance || 0;

  // Group transactions by date for feed view - only if data is loaded
  const groupedTransactions = (!sourceLoading && processedFinanceData)
    ? processedFinanceData.reduce((groups, transaction) => {
        const date = transaction.date || transaction.created_at;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
      }, {})
    : {};

  // Calculate daily net balance for calendar view - only if data is loaded
  const calculateDailyNetBalance = (date) => {
    if (!processedFinanceData) return 0;
    const dayTransactions = processedFinanceData.filter(t => (t.date || t.created_at) === date) || [];
    const income = dayTransactions.filter(t => t.category === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = dayTransactions.filter(t => t.category === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return income - expense;
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
          <p className="text-slate-600">Financial tracking and transactions</p>
        </div>
      </div>

      {/* Date Range Selector - Always visible at top */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Date Range Section */}
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Date Range:</label>
              <select
                value={currentDateRange || ''}
                onChange={(e) => setCurrentDateRange(e.target.value || null)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-[150px]"
              >
                <option value="">Select range</option>
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          
          {/* Custom Date Range Inputs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-indigo-900">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white min-w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-indigo-900">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white min-w-[140px]"
              />
            </div>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              onClick={() => {
                setCurrentDateRange('custom');
                refreshCustomRange();
              }}
            >
              Search
            </button>
          </div>
          </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setActiveView(option.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === option.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* Date Range Display */}
      <div className="mt-3 text-sm text-slate-500">
        {currentDateRange ? (
          <span className="text-indigo-600 font-medium">
            {currentDateRange === 'all' ? 'All data' : 
             currentDateRange === 'custom' ? `Custom range: ${start} to ${end}` : `${start} to ${end}`}
          </span>
        ) : (
          <span>No date range selected</span>
        )}
      </div>

      {/* Loading State - Skeletons only in data container when fetching */}
      {sourceLoading && currentDateRange && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-slate-200 rounded mb-2"></div>
            ))}
          </div>
        </div>
      )}

      {/* Data Container - Empty when no date range selected */}
      {!currentDateRange && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Time Period</h3>
          <p className="text-slate-600">Choose a date range above to view your financial transactions</p>
        </div>
      )}

      {/* Data Container - Show content when date range is selected and not loading */}
      {currentDateRange && !sourceLoading && (
        <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Total Balance</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">₨ {balance.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Monthly Income</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">₨ {monthlyIncome.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                <ArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Monthly Expenses</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">₨ {monthlyExpense.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
                <ArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Content */}
        {activeView === 'feed' && (
          <div className="space-y-3 sm:space-y-4">
            {Object.keys(groupedTransactions).length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                <EmptyTransactionState />
              </div>
            ) : (
              Object.entries(groupedTransactions)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, dayTransactions]) => (
                  <div key={date} className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {dayTransactions.map((transaction, index) => {
                        const tx = Array.isArray(transaction) ? transaction[0] : transaction;
                        if (!tx) return null;
                        
                        return (
                          <div key={index} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  tx.category === 'income' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                } capitalize`}>
                                  {tx.category || 'Unknown'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 text-sm sm:text-base truncate">{tx.note || tx.description || 'No description'}</p>
                                  <p className="text-xs sm:text-sm text-slate-500">{tx.date || tx.created_at || 'No date'}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                                <span className={`font-semibold text-sm sm:text-base ${
                                  tx.category === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {tx.category === 'income' ? '+' : '-'}₨ {Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => handleEditClick(tx)}
                                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeView === 'table' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">All Transactions</h3>
            </div>
            {(!processedFinanceData || !Array.isArray(processedFinanceData) || processedFinanceData.length === 0) ? (
              <div className="p-6">
                <EmptyTransactionState />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Date</th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Type</th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Category</th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Amount</th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedFinanceData.slice().reverse().map((transaction, index) => {
                      const tx = Array.isArray(transaction) ? transaction[0] : transaction;
                      if (!tx) return null;
                      
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">{tx.date || tx.created_at || 'No date'}</td>
                          <td className="px-4 sm:px-6 py-2 sm:py-3 capitalize text-xs sm:text-sm">{tx.category || 'Unknown'}</td>
                          <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">{tx.note || tx.description || 'No description'}</td>
                          <td className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm ${
                            tx.category === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.category === 'income' ? '+' : '-'}₨ {Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}
                          </td>
                          <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                            <button
                              onClick={() => handleEditClick(tx)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                Calendar View - {currentDateRange === 'all' ? 'All data' : `${start} to ${end}`}
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-center text-slate-500">
                <p>Calendar view implementation pending - showing basic transaction list</p>
                <div className="mt-4 space-y-2">
                  {processedFinanceData && processedFinanceData.length > 0 ? (
                    processedFinanceData.slice(0, 5).map((transaction, index) => {
                      const tx = Array.isArray(transaction) ? transaction[0] : transaction;
                      if (!tx) return null;
                      const netBalance = calculateDailyNetBalance(tx.date || tx.created_at);
                      return (
                        <div key={index} className={`p-3 rounded-lg border ${netBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <p className="text-sm font-medium">{tx.date || tx.created_at}</p>
                          <p className={`text-sm ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Net: ₨ {netBalance.toFixed(2)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-400">No transactions to display</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>

      {/* Edit Drawer */}
      <Dialog open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30"></div>
        <div className="fixed inset-0 flex items-center justify-end">
          <DialogPanel className="w-full max-w-md bg-white h-full shadow-xl p-4 sm:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Transaction</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {selectedTransaction && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Note</label>
                  <textarea
                    value={transactionForm.note}
                    onChange={(e) => setTransactionForm({ ...transactionForm, note: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTransactionSubmit}
                    disabled={updateTransaction.isPending}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
                  >
                    {updateTransaction.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default Finance;