import { TrackerProvider, useTracker } from '../context/TrackerContext';
import { getApiErrorMessage, useTrackerData, useUpdateDaylog } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { CalendarIcon, TableCellsIcon, QueueListIcon, PencilIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { EmptyDateRangeState } from '../components/EmptyState';
import BoardView from '../components/BoardView';
import { formatTimeWithSeconds } from '../utils/timeUtils';

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
  { value: 'board', label: 'Board', icon: ViewColumnsIcon },
];

// Inline Skeleton Components
const SkeletonActivity = () => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
    <div className="h-3 bg-slate-200 rounded w-32"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    <div className="bg-slate-50 border-b border-slate-200 p-4">
      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
    </div>
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 text-slate-700">
        <tr>
          <th className="px-6 py-3 font-medium"><div className="h-4 bg-slate-200 rounded w-16"></div></th>
          <th className="px-6 py-3 font-medium"><div className="h-4 bg-slate-200 rounded w-20"></div></th>
          <th className="px-6 py-3 font-medium"><div className="h-4 bg-slate-200 rounded w-24"></div></th>
          <th className="px-6 py-3 font-medium"><div className="h-4 bg-slate-200 rounded w-16"></div></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index}>
            <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
            <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
            <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
            <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonCalendar = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="grid grid-cols-7 gap-2 mb-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="h-4 bg-slate-200 rounded"></div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, index) => (
        <div key={index} className="aspect-square bg-slate-200 rounded-lg"></div>
      ))}
    </div>
  </div>
);

const SkeletonBoard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="flex gap-4 overflow-x-auto">
      {Array.from({ length: 3 }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 min-w-[280px] sm:min-w-[300px] md:min-w-[320px]">
          <div className="bg-slate-100 rounded-t-lg px-4 py-3 border border-slate-200 border-b-0 mb-2">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, cardIndex) => (
              <div key={cardIndex} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Calendar View Component
const CalendarView = ({ activities, daylogs, onDayClick, startDate }) => {
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const currentYear = startDate.getFullYear();
  const currentMonth = startDate.getMonth();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);
  
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = activity.date || activity.entry_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});
  
  const daylogsByDate = daylogs.reduce((acc, daylog) => {
    if (daylog.date) acc[daylog.date] = daylog;
    return acc;
  }, {});
  
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: null, isEmpty: true });
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      day,
      date: dateStr,
      activities: activitiesByDate[dateStr] || [],
      hasDaylog: !!daylogsByDate[dateStr],
      isEmpty: false
    });
  }
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-slate-600">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((cell, index) => (
          <div
            key={index}
            onClick={() => !cell.isEmpty && onDayClick(cell.date)}
            className={`
              aspect-square rounded-lg border-2 p-1 sm:p-2 flex flex-col items-center justify-center cursor-pointer transition-all
              ${cell.isEmpty 
                ? 'border-transparent bg-transparent' 
                : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50'
              }
            `}
          >
            {!cell.isEmpty && (
              <>
                <span className="text-xs sm:text-sm font-medium text-slate-900">{cell.day}</span>
                <div className="flex gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                  {cell.activities.length > 0 && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" title={`${cell.activities.length} activities`} />
                  )}
                  {cell.hasDaylog && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" title="Daylog logged" />
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackerContent = () => {
  const { currentDateRange, setCurrentDateRange, activeView, setActiveView, getDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, refreshCustomRange, refreshKey } = useTracker();
  const { start, end } = getDateRange();
  // Only fetch data if both start and end dates are available
  const { data: trackerData, isLoading, error } = useTrackerData(start, end, refreshKey);
  const { error: toastError } = useToast();
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDaylogDate, setEditingDaylogDate] = useState(null);
  const [isDaylogDrawerOpen, setIsDaylogDrawerOpen] = useState(false);
  const [daylogForm, setDaylogForm] = useState({
    bed_time: '',
    wake_time: '',
  });
  const updateDaylog = useUpdateDaylog();

  // Update custom date inputs based on selection
  useEffect(() => {
    if (currentDateRange === 'all' && trackerData?.start_date && trackerData?.end_date) {
      setCustomStartDate(trackerData.start_date);
      setCustomEndDate(trackerData.end_date);
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
  }, [currentDateRange, trackerData?.start_date, trackerData?.end_date]);

  useEffect(() => {
    if (error && currentDateRange) {
      toastError(getApiErrorMessage(error));
    }
  }, [error, currentDateRange]);

  // Initialize daylog form when editing
  const handleEditDaylog = (date) => {
    const daylog = trackerData?.daylogs?.find(d => d.date === date);
    setDaylogForm({
      bed_time: daylog?.bed_time || '',
      wake_time: daylog?.wake_time || '',
    });
    setEditingDaylogDate(date);
    setIsDaylogDrawerOpen(true);
  };

  const handleDaylogSubmit = () => {
    const daylog = trackerData?.daylogs?.find(d => d.date === editingDaylogDate);
    if (daylog?.id) {
      updateDaylog.mutate({
        id: daylog.id,
        data: {
          date: editingDaylogDate,
          bed_time: formatTimeWithSeconds(daylogForm.bed_time),
          wake_time: formatTimeWithSeconds(daylogForm.wake_time),
        },
      }, {
        onSuccess: () => {
          setIsDaylogDrawerOpen(false);
          setEditingDaylogDate(null);
        },
      });
    }
  };

  const activities = trackerData?.activities || [];

  // Group activities by date for feed view
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.date || activity.entry_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tracker</h1>
          <p className="text-slate-600">Analytics and historical data</p>
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
      </div>

      {/* Loading State - Skeletons only in data container when fetching */}
      {isLoading && currentDateRange && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          {activeView === 'feed' && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonActivity key={index} />
              ))}
            </div>
          )}
          {activeView === 'table' && <SkeletonTable />}
          {activeView === 'calendar' && <SkeletonCalendar />}
          {activeView === 'board' && <SkeletonBoard />}
        </div>
      )}

      {/* Data Container - Empty when no date range selected */}
      {!currentDateRange && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Date Range</h3>
          <p className="text-slate-600">Choose a date range above to view your activities and analytics</p>
        </div>
      )}

      {/* Data Container - Show content when date range is selected and not loading */}
      {currentDateRange && !isLoading && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Days</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{trackerData?.total_days || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Productivity Hours</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{trackerData?.total_productivity_hours?.toFixed(1) || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Avg Sleep Duration</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{trackerData?.average_sleep_duration?.toFixed(1) || 0}h</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Activities</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{activities.length}</p>
            </div>
          </div>

          {/* View Content */}
          {activeView === 'feed' && (
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(groupedActivities).length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                  <EmptyDateRangeState />
                </div>
              ) : (
                Object.entries(groupedActivities)
                  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                  .map(([date, dayActivities]) => (
                    <div key={date} className="bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <button
                          onClick={() => handleEditDaylog(date)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title="Edit Daylog"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {dayActivities.map((activity, index) => (
                          <div key={index} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 capitalize">
                                  {activity.category}
                                </span>
                                <span className="font-medium text-slate-900 text-sm">{activity.activity_type_name}</span>
                              </div>
                              {activity.note && (
                                <span className="text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-none">{activity.note}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeView === 'table' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">All Activities</h3>
              </div>
              {activities.length === 0 ? (
                <div className="p-6">
                  <EmptyDateRangeState />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left mobile-stack-table">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Date</th>
                        <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Category</th>
                        <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Activity</th>
                        <th className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activities.slice().reverse().map((activity, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm" data-label="Date">{activity.date || activity.entry_date}</td>
                          <td className="px-4 sm:px-6 py-2 sm:py-3 capitalize text-xs sm:text-sm" data-label="Category">{activity.category}</td>
                          <td className="px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm" data-label="Activity">{activity.activity_type_name}</td>
                          <td className="px-4 sm:px-6 py-2 sm:py-3 text-slate-500 text-xs sm:text-sm" data-label="Note">{activity.note || '-'}</td>
                        </tr>
                      ))}
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
                <CalendarView 
                  activities={activities} 
                  daylogs={trackerData?.daylogs || []}
                  startDate={currentDateRange === 'all' ? new Date() : new Date(start)}
                  onDayClick={(day) => {
                    setSelectedDay(day);
                    setIsDrawerOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {activeView === 'board' && (
            <BoardView activities={activities} />
          )}

        </>
      )}

      {/* Daylog Edit Drawer */}
      <Dialog open={isDaylogDrawerOpen} onClose={() => setIsDaylogDrawerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-end">
          <DialogPanel className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit Daylog</h2>
              <button
                onClick={() => setIsDaylogDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingDaylogDate || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bed Time</label>
                <input
                  type="time"
                  value={daylogForm.bed_time}
                  onChange={(e) => setDaylogForm({ ...daylogForm, bed_time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wake Time</label>
                <input
                  type="time"
                  value={daylogForm.wake_time}
                  onChange={(e) => setDaylogForm({ ...daylogForm, wake_time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDaylogSubmit}
                  disabled={updateDaylog.isPending}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {updateDaylog.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsDaylogDrawerOpen(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Day Detail Drawer */}
      <Dialog open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-end">
          <DialogPanel className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{selectedDay}</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            {selectedDay && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Activities</h3>
                  {activities
                    .filter(a => (a.date || a.entry_date) === selectedDay)
                    .map((activity, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 capitalize">
                            {activity.category}
                          </span>
                          <span className="font-medium text-slate-900">{activity.activity_type_name}</span>
                        </div>
                        {activity.note && <p className="text-sm text-slate-600">{activity.note}</p>}
                      </div>
                    ))}
                  {activities.filter(a => (a.date || a.entry_date) === selectedDay).length === 0 && (
                    <p className="text-slate-500 text-sm">No activities logged for this day.</p>
                  )}
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

const Tracker = () => {
  return (
    <TrackerProvider>
      <TrackerContent />
    </TrackerProvider>
  );
};

export default Tracker;