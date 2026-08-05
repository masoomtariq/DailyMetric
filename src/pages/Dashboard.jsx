import { useState, useEffect } from 'react';
import { useDashboardData, useTotalBalance, useCreateActivity, useUpdateDaylog, useCreateTransaction } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { ClockIcon, ChartBarIcon, PencilIcon } from '@heroicons/react/24/outline';
import ActivityFormEngine from '../components/ActivityFormEngine';
import TransactionFormEngine from '../components/TransactionFormEngine';

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData(today);
  const { data: balanceData, isLoading: balanceLoading } = useTotalBalance();
  const createActivity = useCreateActivity();
  const createTransaction = useCreateTransaction();
  const updateDaylog = useUpdateDaylog();
  const { error: toastError } = useToast();

  // Quick entry tab state
  const [quickEntryTab, setQuickEntryTab] = useState('activity');

  // Daylog inline editing state
  const [editingDaylog, setEditingDaylog] = useState(false);
  const [daylogForm, setDaylogForm] = useState({
    bed_time: '',
    wake_time: '',
  });

  // Handle errors silently with toast notification
  useEffect(() => {
    if (dashboardError) {
      toastError('Failed to load dashboard data. Using cached values.');
    }
  }, [dashboardError, toastError]);

  // Initialize daylog form when data loads
  useEffect(() => {
    if (dashboardData?.daylog) {
      setDaylogForm({
        bed_time: dashboardData.daylog.bed_time || '',
        wake_time: dashboardData.daylog.wake_time || '',
      });
    }
  }, [dashboardData]);

  const handleDaylogSubmit = () => {
    if (dashboardData?.daylog?.id) {
      updateDaylog.mutate({
        id: dashboardData.daylog.id,
        data: daylogForm,
      }, {
        onSuccess: () => {
          setEditingDaylog(false);
        },
      });
    }
  };

  // Show loading state only during initial load
  if (dashboardLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  const activities = dashboardData?.activities || [];
  const transactions = dashboardData?.transactions || [];
  const totalExpense = dashboardData?.total_expense || 0;
  const totalIncome = dashboardData?.total_income || 0;
  const balance = balanceData?.total_balance || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Today's Dashboard</h1>
          <p className="text-slate-600">{dashboardData?.day || new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
        </div>
        <div className="text-sm text-slate-500">{dashboardData?.date || today}</div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Balance</p>
              <p className="text-2xl font-bold text-slate-900">${balance.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">Today's Sleep</p>
              {editingDaylog ? (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Bed Time</label>
                      <input
                        type="time"
                        value={daylogForm.bed_time}
                        onChange={(e) => setDaylogForm({ ...daylogForm, bed_time: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Wake Time</label>
                      <input
                        type="time"
                        value={daylogForm.wake_time}
                        onChange={(e) => setDaylogForm({ ...daylogForm, wake_time: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDaylogSubmit}
                      disabled={updateDaylog.isPending}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {updateDaylog.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingDaylog(false)}
                      className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-slate-900">
                    {dashboardData?.sleep_time ? dashboardData.sleep_time : 'N/A'}
                  </p>
                  {!dashboardData?.sleep_time && (
                    <button
                      onClick={() => setEditingDaylog(true)}
                      className="mt-1 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Add sleep data
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              {!editingDaylog && (
                <button
                  onClick={() => setEditingDaylog(true)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Productivity Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {dashboardData?.productivity_score || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Entry */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Entry</h2>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setQuickEntryTab('activity')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                quickEntryTab === 'activity'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setQuickEntryTab('transaction')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                quickEntryTab === 'transaction'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transaction
            </button>
          </div>
        </div>
        
        {quickEntryTab === 'activity' && (
          <ActivityFormEngine
            onSubmit={(data) => {
              createActivity.mutate(data, {
                onSuccess: () => {
                  setQuickEntryTab('activity');
                },
              });
            }}
            initialData={{ date: today }}
            isLoading={createActivity.isPending}
          />
        )}
        
        {quickEntryTab === 'transaction' && (
          <TransactionFormEngine
            onSubmit={(data) => {
              createTransaction.mutate(data, {
                onSuccess: () => {
                  setQuickEntryTab('transaction');
                },
              });
            }}
            initialData={{ date: today }}
            isLoading={createTransaction.isPending}
          />
        )}
      </div>

      {/* Today's Activities */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Today's Activities</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No activities logged today. Use the quick entry above or the + button.
            </div>
          ) : (
            activities.slice().reverse().map((activity, index) => (
              <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 capitalize">
                      {activity.category}
                    </span>
                    <span className="font-medium text-slate-900">{activity.activity_type_name}</span>
                  </div>
                  {activity.note && (
                    <span className="text-sm text-slate-500">{activity.note}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Today's Financial Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Today's Financial Summary</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Total Income</p>
            <p className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Expense</p>
            <p className="text-xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
          </div>
        </div>
        {transactions.length > 0 && (
          <div className="divide-y divide-slate-100">
            {transactions.slice().reverse().map((transaction, index) => (
              <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.category === 'income' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    } capitalize`}>
                      {transaction.category}
                    </span>
                    <span className="font-medium text-slate-900">{transaction.note || 'No note'}</span>
                  </div>
                  <span className={`font-semibold ${
                    transaction.category === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.category === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;