import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardData, useTotalBalance, useCreateActivity } from '../hooks/useApi';
import { PlusIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData(today);
  const { data: balanceData, isLoading: balanceLoading } = useTotalBalance();
  const createActivity = useCreateActivity();

  // Quick activity form state
  const [quickActivity, setQuickActivity] = useState({
    activity_type_name: '',
    category: 'habit',
  });

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    createActivity.mutate({
      date: today,
      ...quickActivity,
    }, {
      onSuccess: () => {
        setQuickActivity({ activity_type_name: '', category: 'habit' });
      },
    });
  };

  if (dashboardLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-slate-600 max-w-md">
            {dashboardError.message || 'There was a problem loading your dashboard data. This might be due to a network issue or server maintenance.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            to="/tracker"
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-center"
          >
            Go to Tracker
          </Link>
          <Link
            to="/finance"
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-center"
          >
            Go to Finance
          </Link>
        </div>
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
              <PlusIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Today's Sleep</p>
              <p className="text-2xl font-bold text-slate-900">
                {dashboardData?.sleep_time ? dashboardData.sleep_time : 'N/A'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
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

      {/* Quick Activity Entry */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Activity Log</h2>
        <form onSubmit={handleQuickSubmit} className="flex gap-4">
          <input
            type="text"
            value={quickActivity.activity_type_name}
            onChange={(e) => setQuickActivity({ ...quickActivity, activity_type_name: e.target.value })}
            placeholder="Activity name (e.g., Reading, Running)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <select
            value={quickActivity.category}
            onChange={(e) => setQuickActivity({ ...quickActivity, category: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="prayer">Prayer</option>
            <option value="meal">Meal</option>
            <option value="habit">Habit</option>
            <option value="exercise">Exercise</option>
            <option value="productivity">Productivity</option>
          </select>
          <button
            type="submit"
            disabled={createActivity.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {createActivity.isPending ? 'Adding...' : 'Add'}
          </button>
        </form>
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