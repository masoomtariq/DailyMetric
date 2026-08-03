import { PlusIcon, CalendarIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  type = 'default'
}) => {
  const getIcon = () => {
    if (Icon) return Icon;
    switch (type) {
      case 'activity':
        return PlusIcon;
      case 'daylog':
        return DocumentTextIcon;
      case 'calendar':
        return CalendarIcon;
      case 'finance':
        return CurrencyDollarIcon;
      default:
        return CalendarIcon;
    }
  };

  const DisplayIcon = getIcon();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-slate-100 rounded-full p-4 mb-4">
        <DisplayIcon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-center mb-6 max-w-md">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export const EmptyActivityState = () => (
  <EmptyState
    title="No activities yet"
    description="Start tracking your habits by logging your first activity. You can track prayers, meals, exercises, and more."
    type="activity"
  />
);

export const EmptyDaylogState = () => (
  <EmptyState
    title="No daylogs yet"
    description="Create your first daylog to track your sleep patterns and daily productivity."
    type="daylog"
  />
);

export const EmptyTransactionState = () => (
  <EmptyState
    title="No transactions yet"
    description="Start tracking your finances by adding your first income or expense."
    type="finance"
  />
);

export const EmptyDateRangeState = () => (
  <EmptyState
    title="No data for this period"
    description="There are no activities logged for the selected date range. Try a different range or log some activities."
    type="calendar"
  />
);