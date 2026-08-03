import { useState } from 'react';
import { useTotalBalance, useFinanceData, useFinanceDataByDateRange } from '../hooks/useApi';
import { CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel } from '@headlessui/react';
import { EmptyTransactionState } from '../components/EmptyState';

const Finance = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // Start with null to prevent auto-fetch
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
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

  const { data: balanceData } = useTotalBalance();
  const { data: financeDataMonth, isLoading: financeLoadingMonth, error: financeErrorMonth } = useFinanceData(selectedYear, selectedMonth, refreshKey);
  const { data: financeDataCustom, isLoading: financeLoadingCustom, error: financeErrorCustom } = useFinanceDataByDateRange(
    useCustomRange ? customStartDate : null,
    useCustomRange ? customEndDate : null,
    refreshKey
  );

  // Debug: Log the fetched data
  console.log('Finance Data Debug:', {
    selectedYear,
    selectedMonth,
    useCustomRange,
    financeDataMonth,
    financeDataCustom,
    isLoading: financeLoadingMonth || financeLoadingCustom,
    error: financeErrorMonth || financeErrorCustom,
    dataType: typeof (useCustomRange ? financeDataCustom : financeDataMonth),
    isArray: Array.isArray(useCustomRange ? financeDataCustom : financeDataMonth)
  });

  // Use appropriate data source based on range type
  const sourceData = useCustomRange ? financeDataCustom : financeDataMonth;
  const sourceLoading = useCustomRange ? financeLoadingCustom : financeLoadingMonth;
  const sourceError = useCustomRange ? financeErrorCustom : financeErrorMonth;

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

  // Debug: Log the processed data
  console.log('Processed Finance Data:', {
    financeData,
    transactionsArray,
    monthlyIncome,
    monthlyExpense,
    isArray: Array.isArray(financeData),
    length: financeData?.length,
    rawResponseKeys: financeDataMonth ? Object.keys(financeDataMonth) : []
  });

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

  // Show loading state for finance data only when date range is selected
  if (sourceLoading && (selectedYear && selectedMonth || useCustomRange)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading finance data...</div>
      </div>
    );
  }

  // Show error state for finance data only when date range is selected
  if (sourceError && (selectedYear && selectedMonth || useCustomRange)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error loading finance data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
          <p className="text-slate-600">Financial tracking and transactions</p>
        </div>
      </div>

      {/* Date Range Selection Prompt - Show when no range is selected */}
      {!selectedYear && !selectedMonth && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center">
            <CurrencyDollarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Select a Time Period</h2>
            <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">Choose a month and year to view your financial transactions</p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setSelectedYear(currentYear);
                  setSelectedMonth(currentMonth);
                }}
                className="px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm sm:text-base"
              >
                Current Month ({months.find(m => m.value === currentMonth)?.label} {currentYear})
              </button>
              <button
                onClick={() => {
                  setSelectedYear(currentYear);
                  setSelectedMonth(currentMonth === 1 ? 12 : currentMonth - 1);
                }}
                className="px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm sm:text-base"
              >
                Previous Month
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Selector - Only show when date range is selected */}
      {selectedYear && selectedMonth && (
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
            <button
              onClick={() => {
                setSelectedYear(null);
                setSelectedMonth(null);
                setUseCustomRange(false);
              }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 underline sm:ml-4"
            >
              Change Period
            </button>
          </div>
          
          {/* Month/Year Selection */}
          {!useCustomRange ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]"
                >
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
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-w-[120px] sm:min-w-[150px]"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          
          {/* Custom Date Range Selection - Always visible for easy access */}
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
              Apply Custom Range
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Current Range Display - Only show when date range is selected */}
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

      {/* Summary Cards - Only show when date range is selected */}
      {selectedYear && selectedMonth && (
        <>
        {/* Debug Info - Remove in production */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">Debug Info:</h4>
          <div className="text-xs sm:text-sm text-yellow-700 space-y-1">
            <p>Selected Year: {selectedYear}</p>
            <p>Selected Month: {selectedMonth}</p>
            <p>Use Custom Range: {useCustomRange ? 'Yes' : 'No'}</p>
            <p>Custom Start Date: {customStartDate}</p>
            <p>Custom End Date: {customEndDate}</p>
            <p>Loading: {sourceLoading ? 'Yes' : 'No'}</p>
            <p>Error: {sourceError ? sourceError.message : 'None'}</p>
            <p>Raw Data Type: {typeof sourceData}</p>
            <p>Raw Is Array: {Array.isArray(sourceData) ? 'Yes' : 'No'}</p>
            <p>Raw Response Keys: {sourceData ? Object.keys(sourceData).join(', ') : 'None'}</p>
            <p>Transactions Array Length: {transactionsArray.length}</p>
            <p>Processed Data Length: {financeData.length}</p>
            <p>Monthly Income: ₨ {monthlyIncome.toFixed(2)}</p>
            <p>Monthly Expense: ₨ {monthlyExpense.toFixed(2)}</p>
            <p>Raw Data Sample: {JSON.stringify(sourceData).substring(0, 300)}...</p>
          </div>
        </div>

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
        </>
      )}

      {/* Transactions List - Only show when date range is selected */}
      {selectedYear && selectedMonth && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 sm:p-6 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              Transactions - {useCustomRange 
                ? `${customStartDate} to ${customEndDate}` 
                : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
              }
            </h3>
          </div>
          {(!financeData || !Array.isArray(financeData) || financeData.length === 0) ? (
            <div className="p-4 sm:p-6">
              <EmptyTransactionState />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="divide-y divide-slate-100 min-w-[320px] sm:min-w-0">
                {financeData.slice().reverse().map((transaction, index) => {
                  // Handle both transaction objects and potential array structures
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
          )}
        </div>
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