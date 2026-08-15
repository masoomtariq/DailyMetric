import { ViewColumnsIcon } from '@heroicons/react/24/outline';

const BoardView = ({ activities }) => {
  // Group activities by goal_name
  const groupedByGoal = activities.reduce((groups, activity) => {
    const goalName = activity.goal_name || 'No Goal';
    if (!groups[goalName]) {
      groups[goalName] = [];
    }
    groups[goalName].push(activity);
    return groups;
  }, {});

  // Sort goals alphabetically, but keep "No Goal" at the end
  const sortedGoals = Object.keys(groupedByGoal).sort((a, b) => {
    if (a === 'No Goal') return 1;
    if (b === 'No Goal') return -1;
    return a.localeCompare(b);
  });

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      prayer: 'bg-purple-100 text-purple-700',
      meal: 'bg-orange-100 text-orange-700',
      exercise: 'bg-green-100 text-green-700',
      work: 'bg-blue-100 text-blue-700',
      sleep: 'bg-indigo-100 text-indigo-700',
      default: 'bg-slate-100 text-slate-700',
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <ViewColumnsIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Activities to Display</h3>
        <p className="text-slate-600">There are no activities for the selected date range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Board View</h3>
      </div>
      
      <div className="p-4 sm:p-6">
        {/* Horizontal scrollable container */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {sortedGoals.map((goalName) => (
            <div
              key={goalName}
              className="flex-shrink-0 min-w-[280px] sm:min-w-[300px] md:min-w-[320px] snap-start"
            >
              {/* Goal Column Header */}
              <div className="bg-slate-50 rounded-t-lg px-4 py-3 border border-slate-200 border-b-0">
                <h4 className="font-semibold text-slate-900 text-sm truncate">
                  {goalName}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {groupedByGoal[goalName].length} {groupedByGoal[goalName].length === 1 ? 'activity' : 'activities'}
                </p>
              </div>

              {/* Activity Cards */}
              <div className="bg-white rounded-b-lg border border-slate-200 space-y-2 p-3 max-h-[600px] overflow-y-auto">
                {groupedByGoal[goalName].map((activity, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    {/* Category Badge */}
                    <div className="mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(activity.category)}`}>
                        {activity.category}
                      </span>
                    </div>

                    {/* Activity Name */}
                    <h5 className="font-medium text-slate-900 text-sm mb-1">
                      {activity.activity_type_name}
                    </h5>

                    {/* Note with line clamping */}
                    {activity.note && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                        {activity.note}
                      </p>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(activity.date || activity.entry_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardView;