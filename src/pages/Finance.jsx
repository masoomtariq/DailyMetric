import { useState } from 'react';
import { useTotalBalance, useFinanceData, useFinanceDataByDateRange } from '../hooks/useApi';
import { CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, CalendarIcon, TableCellsIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel } from '@headlessui/react';
import { EmptyTransactionState } from '../components/EmptyState';

const Finance = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // Start with null to prevent auto-fetch
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeView, setActiveView] = useState('feed'); // feed, table, calendar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const viewOptions = [
    { value: 'feed', label: 'Feed', icon: QueueListIcon },
    { value: 'table', label: 'Table', icon: TableCellsIcon },
    { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ];

  const { data: balanceData } = useTotalBalance();
  const { data: financeDataMonth, isLoading: financeLoadingMonth, error: financeErrorMonth } = useFinanceData(selectedYear, selectedMonth, refreshKey);
  const { data: financeDataCustom, isLoading: financeLoadingCustom, error: financeErrorCustom } = useFinanceDataByDateRange(
    useCustomRange ? customStartDate : null,
    useCustomRange ? customEndDate : null,
    refreshKey
  );

  // Handle errors silently
  if (financeErrorMonth || financeErrorCustom) {
    console.error('Error loading finance data:', financeErrorMonth || financeErrorCustom);
  }

  // Use appropriate data source based on range type
  const sourceData = useCustomRange ? financeDataCustom : financeDataMonth;
  const sourceLoading = useCustomRange ? financeLoadingCustom : financeLoadingMonth;

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
  const financeData = transactionsArray;
  
  // Recalculate income/expense based on filtered data
  const monthlyIncome = (financeData || [])
    .filter(t => t && t.category === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const monthlyExpense = (financeData || [])
    .filter(t => t && t.category === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = [2024, 2025, 2026, 2027];

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const balance = balanceData?.total_balance || 0;

  // Group transactions by date for feed view
  const groupedTransactions = financeData?.reduce((groups, transaction) => {
    const date = transaction.date || transaction.created_at;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {}) || {};

  // Calculate daily net balance for calendar view
  const calculateDailyNetBalance = (date) => {
    const dayTransactions = financeData?.filter(t => (t.date || t.created_at) === date) || [];
    const income = dayTransactions.filter(t => t.category === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = dayTransactions.filter(t => t.category === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return income - expense;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
          <p className="text-slate-600">Financial tracking and transactions</p>
        </div>
      </div>

      {/* Date Range Selector - Always visible at top */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Range Type Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Range Type:</label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setUseCustomRange(false)}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  !useCustomRange
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month/Year
              </button>
              <button
                onClick={() => setUseCustomRange(true)}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  useCustomRange
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>
          
          {/* Month/Year Selection */}
          {!useCustomRange ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Year:</label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Month:</label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-w-[120px] sm:min-w-[150px]"
                >
                  <option value="">Select month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          
          {/* Custom Date Range Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-indigo-900">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm bg-white min-w-[120px] sm:min-w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-indigo-900">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm bg-white min-w-[120px] sm:min-w-[140px]"
              />
            </div>
            <button
              className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
              onClick={() => {
                setUseCustomRange(true);
                setRefreshKey(prev => prev + 1);
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

      {/* Current Range Display */}
      {selectedYear && selectedMonth && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-sm text-slate-600">
            {useCustomRange ? (
              <span className="text-indigo-600 font-medium">
                Custom range: {customStartDate} to {customEndDate}
              </span>
            ) : (
              <span>
                Showing: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading State - Skeletons only in data container when fetching */}
      {sourceLoading && (selectedYear && selectedMonth || useCustomRange) && (
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
      {!selectedYear && !selectedMonth && !useCustomRange && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CurrencyDollarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Time Period</h3>
          <p className="text-slate-600">Choose a date range above to view your financial transactions</p>
        </div>
      )}

      {/* Data Container - Show content when date range is selected and not loading */}
      {(selectedYear && selectedMonth || useCustomRange) && !sourceLoading && (
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
            {(!financeData || !Array.isArray(financeData) || financeData.length === 0) ? (
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financeData.slice().reverse().map((transaction, index) => {
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
                Calendar View - {useCustomRange ? `${customStartDate} to ${customEndDate}` : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-center text-slate-500">
                <p>Calendar view implementation pending - showing basic transaction list</p>
                <div className="mt-4 space-y-2">
                  {financeData?.slice(0, 5).map((transaction, index) => {
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
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* Edit Drawer */}
      <Dialog open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
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
                    defaultValue={selectedTransaction.date}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    defaultValue={selectedTransaction.category}
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
                    defaultValue={selectedTransaction.amount}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Note</label>
                  <textarea
                    defaultValue={selectedTransaction.note}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    rows="3"
                  />
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default Finance;