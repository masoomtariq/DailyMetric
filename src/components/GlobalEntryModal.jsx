import { Dialog, DialogPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCreateActivity, useCreateDaylog, useCreateGoal, useCreateTransaction } from '../hooks/useApi';
import { useConfetti } from '../hooks/useConfetti';

const GlobalEntryModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const createActivity = useCreateActivity();
  const createDaylog = useCreateDaylog();
  const createGoal = useCreateGoal();
  const createTransaction = useCreateTransaction();
  const { triggerSuccessConfetti } = useConfetti();

  // Activity form state
  const [activityData, setActivityData] = useState({
    date: new Date().toISOString().split('T')[0],
    activity_type_name: '',
    category: 'habit',
    note: '',
  });

  // Daylog form state
  const [daylogData, setDaylogData] = useState({
    date: new Date().toISOString().split('T')[0],
    bed_time: '',
    wake_time: '',
    notes: '',
  });

  // Goal form state
  const [goalData, setGoalData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    active_status: true,
  });

  // Transaction form state
  const [transactionData, setTransactionData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'expense',
    amount: '',
    note: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === 0) {
      createActivity.mutate(activityData, {
        onSuccess: () => {
          triggerSuccessConfetti();
          setActivityData({
            date: new Date().toISOString().split('T')[0],
            activity_type_name: '',
            category: 'habit',
            note: '',
          });
          onClose();
        },
      });
    } else if (activeTab === 1) {
      createDaylog.mutate(daylogData, {
        onSuccess: () => {
          triggerSuccessConfetti();
          setDaylogData({
            date: new Date().toISOString().split('T')[0],
            bed_time: '',
            wake_time: '',
            notes: '',
          });
          onClose();
        },
      });
    } else if (activeTab === 2) {
      createGoal.mutate(goalData, {
        onSuccess: () => {
          triggerSuccessConfetti();
          setGoalData({
            date: new Date().toISOString().split('T')[0],
            title: '',
            description: '',
            active_status: true,
          });
          onClose();
        },
      });
    } else if (activeTab === 3) {
      createTransaction.mutate(transactionData, {
        onSuccess: () => {
          triggerSuccessConfetti();
          setTransactionData({
            date: new Date().toISOString().split('T')[0],
            category: 'expense',
            amount: '',
            note: '',
          });
          onClose();
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Add New Entry</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tab System */}
          <TabGroup selectedIndex={activeTab} onChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabList className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50 overflow-x-auto">
              <Tab className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium border-b-2 border-transparent focus:outline-none data-[selected]:border-indigo-600 data-[selected]:text-indigo-600 data-[hover]:text-indigo-700 transition-all whitespace-nowrap">
                Activity
              </Tab>
              <Tab className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium border-b-2 border-transparent focus:outline-none data-[selected]:border-indigo-600 data-[selected]:text-indigo-600 data-[hover]:text-indigo-700 transition-all whitespace-nowrap">
                Daylog
              </Tab>
              <Tab className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium border-b-2 border-transparent focus:outline-none data-[selected]:border-indigo-600 data-[selected]:text-indigo-600 data-[hover]:text-indigo-700 transition-all whitespace-nowrap">
                Goal
              </Tab>
              <Tab className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium border-b-2 border-transparent focus:outline-none data-[selected]:border-indigo-600 data-[selected]:text-indigo-600 data-[hover]:text-indigo-700 transition-all whitespace-nowrap">
                Transaction
              </Tab>
            </TabList>

            <TabPanels className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Activity Tab */}
              <TabPanel className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={activityData.date}
                        onChange={(e) => setActivityData({ ...activityData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={activityData.category}
                        onChange={(e) => setActivityData({ ...activityData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="prayer">Prayer</option>
                        <option value="meal">Meal</option>
                        <option value="habit">Habit</option>
                        <option value="exercise">Exercise</option>
                        <option value="productivity">Productivity</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Activity Type</label>
                    <input
                      type="text"
                      value={activityData.activity_type_name}
                      onChange={(e) => setActivityData({ ...activityData, activity_type_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Reading, Running"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                    <textarea
                      value={activityData.note}
                      onChange={(e) => setActivityData({ ...activityData, note: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createActivity.isPending}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createActivity.isPending ? 'Adding...' : 'Add Activity'}
                  </button>
                </form>
              </TabPanel>

              {/* Daylog Tab */}
              <TabPanel className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={daylogData.date}
                      onChange={(e) => setDaylogData({ ...daylogData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bed Time</label>
                      <input
                        type="time"
                        value={daylogData.bed_time}
                        onChange={(e) => setDaylogData({ ...daylogData, bed_time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Wake Time</label>
                      <input
                        type="time"
                        value={daylogData.wake_time}
                        onChange={(e) => setDaylogData({ ...daylogData, wake_time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      value={daylogData.notes}
                      onChange={(e) => setDaylogData({ ...daylogData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createDaylog.isPending}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createDaylog.isPending ? 'Adding...' : 'Add Daylog'}
                  </button>
                </form>
              </TabPanel>

              {/* Goal Tab */}
              <TabPanel className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={goalData.date}
                        onChange={(e) => setGoalData({ ...goalData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        value={goalData.active_status.toString()}
                        onChange={(e) => setGoalData({ ...goalData, active_status: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={goalData.title}
                      onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Learn Spanish"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={goalData.description}
                      onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createGoal.isPending}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createGoal.isPending ? 'Adding...' : 'Add Goal'}
                  </button>
                </form>
              </TabPanel>

              {/* Transaction Tab */}
              <TabPanel className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={transactionData.date}
                        onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={transactionData.category}
                        onChange={(e) => setTransactionData({ ...transactionData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionData.amount}
                      onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 50.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                    <textarea
                      value={transactionData.note}
                      onChange={(e) => setTransactionData({ ...transactionData, note: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createTransaction.isPending}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createTransaction.isPending ? 'Adding...' : 'Add Transaction'}
                  </button>
                </form>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default GlobalEntryModal;