import { ChevronDownIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatTimeToAMPM, formatTimeForDisplay } from '../utils/timeUtils';

const AccordionHeader = ({ title, summary, open, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between gap-4 p-5 text-left"
    aria-expanded={open}
  >
    <span>
      <span className="block text-base font-semibold text-slate-900">{title}</span>
      <span className="mt-1 block text-sm text-slate-500">{summary}</span>
    </span>
    <ChevronDownIcon className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
  </button>
);

const Field = ({ label, value, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
    <input
      type="time"
      value={formatTimeForDisplay(value)}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  </label>
);

const ActionRow = ({ onCancel, onSave, saving }) => (
  <div className="flex justify-end gap-2 pt-2">
    <button type="button" onClick={onCancel} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
      Cancel
    </button>
    <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
      {saving ? 'Saving...' : 'Save'}
    </button>
  </div>
);

export const TodayLogSection = ({ domain }) => {
  const {
    daylog,
    sleepOpen,
    setSleepOpen,
    noteOpen,
    setNoteOpen,
    sleepMode,
    setSleepMode,
    noteMode,
    setNoteMode,
    sleepForm,
    setSleepForm,
    noteForm,
    setNoteForm,
    sleepError,
    noteError,
    saveSleep,
    saveNote,
    sleepSaving,
    noteSaving,
  } = domain;

  const sleepSummary = daylog.duration !== null ? `${Number(daylog.duration).toFixed(1)}h` : 'Incomplete sleep data';
  const noteSummary = daylog.note ? daylog.note.split('\n')[0].slice(0, 90) : 'No note added today';

  return (
    <section className="space-y-3" aria-labelledby="today-log-heading">
      <h2 id="today-log-heading" className="text-lg font-semibold text-slate-900">Today's Log</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AccordionHeader title="Today's Sleep" summary={sleepSummary} open={sleepOpen} onClick={() => setSleepOpen(!sleepOpen)} />
        {sleepOpen && (
          <div className="border-t border-slate-200 p-5">
            {sleepMode === 'view' ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div><p className="text-xs text-slate-500">Yesterday's Bed</p><p className="font-medium text-slate-800">{formatTimeToAMPM(daylog.yesterdayBed)}</p></div>
                <div><p className="text-xs text-slate-500">Today's Wake</p><p className="font-medium text-slate-800">{formatTimeToAMPM(daylog.todayWake)}</p></div>
                <div><p className="text-xs text-slate-500">Today's Bed</p><p className="font-medium text-slate-800">{formatTimeToAMPM(daylog.todayBed)}</p></div>
                <button type="button" onClick={() => setSleepMode('edit')} className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:col-span-3">
                  <PencilIcon className="h-4 w-4" /> Enter or update sleep
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Yesterday's Bed" value={sleepForm.yesterdayBed} onChange={(value) => setSleepForm({ ...sleepForm, yesterdayBed: value })} />
                  <Field label="Today's Wake" value={sleepForm.todayWake} onChange={(value) => setSleepForm({ ...sleepForm, todayWake: value })} />
                  <Field label="Today's Bed" value={sleepForm.todayBed} onChange={(value) => setSleepForm({ ...sleepForm, todayBed: value })} />
                </div>
                {sleepError && <p className="text-sm text-red-600" role="alert">{sleepError}</p>}
                <ActionRow onCancel={() => setSleepMode('view')} onSave={saveSleep} saving={sleepSaving} />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AccordionHeader title="Today's Note" summary={noteSummary} open={noteOpen} onClick={() => setNoteOpen(!noteOpen)} />
        {noteOpen && (
          <div className="border-t border-slate-200 p-5">
            {noteMode === 'view' ? (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap text-sm text-slate-700">{daylog.note || 'No note added today'}</p>
                <button type="button" onClick={() => setNoteMode(daylog.note ? 'edit' : 'create')} className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  <PencilIcon className="h-4 w-4" /> {daylog.note ? 'Update note' : 'Add note'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea value={noteForm} onChange={(event) => setNoteForm(event.target.value)} rows="5" placeholder="Add a note for today" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                {noteError && <p className="text-sm text-red-600" role="alert">{noteError}</p>}
                <ActionRow onCancel={() => setNoteMode('view')} onSave={saveNote} saving={noteSaving} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
