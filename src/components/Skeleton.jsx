// Skeleton Loader Components
// These provide loading states while React Query fetches data

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
  </div>
);

export const SkeletonMetricCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-8 bg-slate-200 rounded w-3/4"></div>
  </div>
);

export const SkeletonTableRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
    <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
    <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="px-6 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
  </tr>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="bg-slate-50 border-b border-slate-200 p-4 animate-pulse">
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
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonTableRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonActivity = () => (
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

export const SkeletonCalendar = () => (
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

export const SkeletonBoard = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="min-w-[300px] bg-slate-50 rounded-xl p-4 border border-slate-200 animate-pulse">
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

export const SkeletonHeatmap = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="mb-4">
      <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
      <div className="flex items-center gap-2">
        <div className="h-3 bg-slate-200 rounded w-8"></div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-3 h-3 bg-slate-200 rounded-sm"></div>
          ))}
        </div>
        <div className="h-3 bg-slate-200 rounded w-8"></div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {Array.from({ length: 53 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={`${weekIndex}-${dayIndex}`} className="w-3 h-3 bg-slate-200 rounded-sm"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);