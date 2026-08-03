import { TrackerProvider, useTracker } from '../context/TrackerContext';
import { useTrackerData } from '../hooks/useApi';
import { CalendarIcon, TableCellsIcon, QueueListIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { EmptyDateRangeState } from '../components/EmptyState';

// Move dateRangeOptions outside component to avoid recreation on renders
const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const viewOptions = [
  { value: 'feed', label: 'Feed', icon: QueueListIcon },
  { value: 'table', label: 'Table', icon: TableCellsIcon },
  { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { value: 'board', label: 'Board', icon: Squares2X2Icon },
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
  <div className="flex gap-4 overflow-x-auto pb-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="min-w-[300px] bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4 pb-2 border-b border-slate-200"></div>
        {Array.from({ length: 3 }).map((_, activityIndex) => (
          <div key={activityIndex} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-2">
            <div className="h-4 bg-slate-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    ))}
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

// Board View Component
const BoardView = ({ activities }) => {
  const activitiesByGoal = activities.reduce((acc, activity) => {
    const goalName = activity.goal_name || 'No Goal';
    if (!acc[goalName]) acc[goalName] = [];
    acc[goalName].push(activity);
    return acc;
  }, {});
  
  const goalNames = Object.keys(activitiesByGoal);
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
      {goalNames.length === 0 ? (
        <div className="w-full bg-white rounded-xl border border-slate-200 p-6">
          <EmptyDateRangeState />
        </div>
      ) : (
        goalNames.map(goalName => (
          <div key={goalName} className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] bg-slate-50 rounded-xl p-4 border border-slate-200 snap-start">
            <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 text-sm sm:text-base">
              {goalName}
            </h3>
            <div className="space-y-2">
              {activitiesByGoal[goalName].map((activity, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 capitalize">
                      {activity.category}
                    </span>
                    <span className="font-medium text-slate-900 text-sm">{activity.activity_type_name}</span>
                  </div>
                  {activity.note && <p className="text-xs text-slate-600 line-clamp-2">{activity.note}</p>}
                  <p className="text-xs text-slate-400 mt-1">{activity.date || activity.entry_date}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Heatmap View Component (GitHub-style contribution graph)
const HeatmapView = ({ activities, daylogs, startDate, endDate }) => {
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = activity.date || activity.entry_date;
    if (!acc[date]) acc[date] = 0;
    acc[date]++;
    return acc;
  }, {});
  
  const daylogsByDate = daylogs.reduce((acc, daylog) => {
    if (daylog.date) acc[daylog.date] = daylog;
    return acc;
  }, {});
  
  // Calculate intensity score for each day
  const calculateIntensity = (date, activityCount, daylog) => {
    let score = activityCount;
    if (daylog) {
      const productivity = daylog.productivity_score || 0;
      score += productivity / 2; // Normalize productivity score
    }
    return Math.min(Math.floor(score), 4); // Cap at 4 for color mapping
  };
  
  // Generate date range for the year
  const dateRange = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const activityCount = activitiesByDate[dateStr] || 0;
    const daylog = daylogsByDate[dateStr];
    const intensity = calculateIntensity(dateStr, activityCount, daylog);
    
    dateRange.push({
      date: dateStr,
      intensity,
      activityCount,
      hasDaylog: !!daylog
    });
  }
  
  // Group by weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < dateRange.length; i += 7) {
    weeks.push(dateRange.slice(i, i + 7));
  }
  
  // Color mapping based on intensity
  const getColorClass = (intensity) => {
    switch (intensity) {
      case 0: return 'bg-slate-100';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-300';
      case 3: return 'bg-green-400';
      case 4: return 'bg-green-600';
      default: return 'bg-slate-100';
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Activity Intensity</h4>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColorClass(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${getColorClass(day.intensity)} hover:ring-2 hover:ring-indigo-300 cursor-pointer`}
                  title={`${day.date}: ${day.activityCount} activities${day.hasDaylog ? ' + daylog' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-600">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
    </div>
  );
};

const TrackerContent = () => {
  const { currentDateRange, setCurrentDateRange, activeView, setActiveView, getDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, refreshCustomRange, refreshKey } = useTracker();
  const { start, end } = getDateRange();
  // Only fetch data if both start and end dates are available
  const { data: trackerData, isLoading, error } = useTrackerData(start, end, refreshKey);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Show loading state only when date range is selected
  if (isLoading && currentDateRange) {
    return (
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
    );
  }

  // Show error state only when date range is selected
  if (error && currentDateRange) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error loading tracker data</div>
      </div>
    );
  }

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

      {/* Date Range Selection Prompt - Show when no range is selected */}
      {!currentDateRange && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center">
            <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Select a Date Range</h2>
            <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">Choose a time period to view your activities and analytics</p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3">
              {dateRangeOptions.slice(0, 6).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentDateRange(option.value)}
                  className="px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm sm:text-base"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar - Only show when date range is selected */}
      {currentDateRange && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Date Range Section */}
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Date Range:</label>
                <select
                  value={currentDateRange}
                  onChange={(e) => setCurrentDateRange(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-[150px]"
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setCurrentDateRange(null)}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Change
                </button>
              </div>
            
            {/* Custom Date Range Inputs - Always visible for easy access */}
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
                Apply Custom Range
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
          {currentDateRange === 'custom' ? (
            <span className="text-indigo-600 font-medium">
              Custom range: {start} to {end}
            </span>
          ) : (
            <span>{start} to {end}</span>
          )}
        </div>
      </div>
      )}

      {/* Stats Summary - Only show when data is available */}
      {currentDateRange && (
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
      )}

      {/* View Content - Only show when date range is selected */}
      {currentDateRange && (
        <>
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
                  {currentDateRange === 'this_year' ? 'Yearly Heatmap' : 'Calendar View'} - {start} to {end}
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                {currentDateRange === 'this_year' ? (
                  <HeatmapView 
                    activities={activities} 
                    daylogs={trackerData?.daylogs || []}
                    startDate={new Date(start)}
                    endDate={new Date(end)}
                  />
                ) : (
                  <CalendarView 
                    activities={activities} 
                    daylogs={trackerData?.daylogs || []}
                    startDate={new Date(start)}
                    onDayClick={(day) => {
                      setSelectedDay(day);
                      setIsDrawerOpen(true);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {activeView === 'board' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Board View - Goals Focus</h3>
              </div>
              <div className="p-4 sm:p-6">
                <BoardView activities={activities} />
              </div>
            </div>
          )}
        </>
      )}

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