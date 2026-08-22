import { Dialog, DialogPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCreateActivity, useCreateDaylog, useCreateGoal, useCreateTransaction } from '../hooks/useApi';
import { useConfetti } from '../hooks/useConfetti';
import { formatTimeWithSeconds } from '../utils/timeUtils';
import ActivityFormEngine from './ActivityFormEngine';
import TransactionFormEngine from './TransactionFormEngine';

const GlobalEntryModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const createActivity = useCreateActivity();
  const createDaylog = useCreateDaylog();
  const createGoal = useCreateGoal();
  const createTransaction = useCreateTransaction();
  const { triggerSuccessConfetti } = useConfetti();

  // Daylog form state
  const [daylogData, setDaylogData] = useState({
    date: new Date().toISOString().split('T')[0],
    bed_time: '',
    wake_time: '',
    sleep_time: '',
    notes: '',
  });

  // Goal form state
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    active_status: true,
  });

  const handleDaylogSubmit = (e) => {
    e.preventDefault();

    // onSubmit interceptor: if sleep_time is blank, calculate from bed_time + 15 minutes
    let submitData = { ...daylogData };
    if (!submitData.sleep_time && submitData.bed_time && submitData.bed_time.trim() !== '') {
      const [hours, minutes] = submitData.bed_time.split(':');
      const bedTimeDate = new Date();
      bedTimeDate.setHours(parseInt(hours), parseInt(minutes) + 15);
      const calculatedTime = bedTimeDate.toTimeString().slice(0, 5);
      submitData.sleep_time = calculatedTime;
    }

    // Format time fields to include seconds and handle empty strings
    submitData = {
      ...submitData,
      bed_time: formatTimeWithSeconds(submitData.bed_time),
      wake_time: formatTimeWithSeconds(submitData.wake_time),
      sleep_time: formatTimeWithSeconds(submitData.sleep_time),
    };

    createDaylog.mutate(submitData, {
      onSuccess: () => {
        triggerSuccessConfetti();
        setDaylogData({
          date: new Date().toISOString().split('T')[0],
          bed_time: '',
          wake_time: '',
          sleep_time: '',
          notes: '',
        });
        onClose();
      },
    });
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    
    // Auto-generate current date in background payload
    const submitData = {
      ...goalData,
      date: new Date().toISOString().split('T')[0],
      active_status: true, // Always set to true by default
    };

    createGoal.mutate(submitData, {
      onSuccess: () => {
        triggerSuccessConfetti();
        setGoalData({
          title: '',
          description: '',
          active_status: true,
        });
        onClose();
      },
    });
  };

  const handleActivitySubmit = (data) => {
    createActivity.mutate(data, {
      onSuccess: () => {
        triggerSuccessConfetti();
        onClose();
      },
    });
  };

  const handleTransactionSubmit = (data) => {
    createTransaction.mutate(data, {
      onSuccess: () => {
        triggerSuccessConfetti();
        onClose();
      },
    });
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
                <ActivityFormEngine
                  onSubmit={handleActivitySubmit}
                  isLoading={createActivity.isPending}
                />
              </TabPanel>

              {/* Daylog Tab */}
              <TabPanel className="space-y-6">
                <form onSubmit={handleDaylogSubmit} className="space-y-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sleep Time (optional)</label>
                    <input
                      type="time"
                      value={daylogData.sleep_time}
                      onChange={(e) => setDaylogData({ ...daylogData, sleep_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Auto-calculated from bed time if left blank"
                    />
                    <p className="text-xs text-slate-500 mt-1">If left blank, will be automatically set to bed time + 15 minutes</p>
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
                <form onSubmit={handleGoalSubmit} className="space-y-4">
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
                <TransactionFormEngine
                  onSubmit={handleTransactionSubmit}
                  isLoading={createTransaction.isPending}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default GlobalEntryModal;