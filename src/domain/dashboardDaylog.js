import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardData, useUpdateDaylog } from '../hooks/useApi';
import { formatTimeWithSeconds } from '../utils/timeUtils';

const dateKey = (date) => date.toISOString().split('T')[0];

export const getDashboardDateKeys = (date = new Date()) => {
  const today = dateKey(date);
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);

  return { today, yesterday: dateKey(previousDate) };
};

const formatTime = (time) => {
  return formatTimeWithSeconds(time) || '';
};

const getValue = (source, ...keys) => keys.reduce((value, key) => value || source?.[key], '');

export const normalizeDashboardDaylog = (dashboardData) => ({
  duration: dashboardData?.sleep_duration ?? null,
  yesterdayBed: getValue(dashboardData, 'yesterday_bed_time') || '',
  todayWake: getValue(dashboardData, 'wake_time') || '',
  todayBed: getValue(dashboardData, 'bed_time') || '',
  note: getValue(dashboardData, 'note', 'notes') || '',
});

export const useDashboardDaylog = () => {
  const { today, yesterday } = getDashboardDateKeys();
  const dashboardQuery = useDashboardData(today);
  const updateDaylog = useUpdateDaylog();
  const queryClient = useQueryClient();
  const [sleepOpen, setSleepOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [sleepMode, setSleepMode] = useState('view');
  const [noteMode, setNoteMode] = useState('view');
  const [sleepForm, setSleepForm] = useState({ yesterdayBed: '', todayWake: '', todayBed: '' });
  const [noteForm, setNoteForm] = useState('');
  const [sleepError, setSleepError] = useState('');
  const [noteError, setNoteError] = useState('');

  const daylog = normalizeDashboardDaylog(dashboardQuery.data);

  useEffect(() => {
    setSleepForm({
      yesterdayBed: formatTime(daylog.yesterdayBed),
      todayWake: formatTime(daylog.todayWake),
      todayBed: formatTime(daylog.todayBed),
    });
    setNoteForm(daylog.note || '');
  }, [daylog.yesterdayBed, daylog.todayWake, daylog.todayBed, daylog.note]);

  const refresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['dashboard', today], type: 'active' });
  };

  const update = (date, data) => updateDaylog.mutateAsync({
    id: date,
    data: { date, ...data },
    useDate: true,
  });

  const saveSleep = async () => {
    setSleepError('');
    try {
      await update(yesterday, { bed_time: formatTimeWithSeconds(sleepForm.yesterdayBed) });
      await update(today, { wake_time: formatTimeWithSeconds(sleepForm.todayWake) });
      await update(today, { bed_time: formatTimeWithSeconds(sleepForm.todayBed) });
      await refresh();
      setSleepMode('view');
    } catch {
      setSleepError('Sleep update failed. Refresh and try again.');
      await refresh();
    }
  };

  const saveNote = async () => {
    setNoteError('');
    try {
      await update(today, { notes: noteForm.trim() || null });
      await refresh();
      setNoteMode('view');
    } catch {
      setNoteError('Note update failed. Refresh and try again.');
      await refresh();
    }
  };

  return {
    today,
    dashboardData: dashboardQuery.data,
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
    sleepSaving: updateDaylog.isPending,
    noteSaving: updateDaylog.isPending,
    dashboardLoading: dashboardQuery.isLoading,
    dashboardError: dashboardQuery.error,
  };
};
