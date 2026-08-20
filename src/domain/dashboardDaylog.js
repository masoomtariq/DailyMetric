import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardData, useDaylogByDate, useUpdateDaylog } from '../hooks/useApi';

const dateKey = (date) => date.toISOString().split('T')[0];

export const getDashboardDateKeys = (date = new Date()) => {
  const today = dateKey(date);
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);

  return { today, yesterday: dateKey(previousDate) };
};

const formatTime = (time) => {
  if (!time) return '';
  return time.split(':').length === 2 ? `${time}:00` : time;
};

const getValue = (source, ...keys) => keys.reduce((value, key) => value || source?.[key], '');

export const normalizeDashboardDaylog = (dashboardData, yesterdayDaylog, todayDaylog) => ({
  duration: dashboardData?.sleep_duration ?? null,
  yesterdayBed: getValue(dashboardData, 'yesterday_bed_time') || yesterdayDaylog?.bed_time || '',
  todayWake: getValue(dashboardData, 'wake_time') || todayDaylog?.wake_time || '',
  todayBed: getValue(dashboardData, 'bed_time') || todayDaylog?.bed_time || '',
  note: getValue(dashboardData, 'note', 'notes') || getValue(todayDaylog, 'note', 'notes'),
});

export const useDashboardDaylog = () => {
  const { today, yesterday } = getDashboardDateKeys();
  const dashboardQuery = useDashboardData(today);
  const yesterdayQuery = useDaylogByDate(yesterday);
  const todayQuery = useDaylogByDate(today);
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

  const daylog = normalizeDashboardDaylog(
    dashboardQuery.data,
    yesterdayQuery.data,
    todayQuery.data,
  );

  useEffect(() => {
    setSleepForm({
      yesterdayBed: formatTime(daylog.yesterdayBed),
      todayWake: formatTime(daylog.todayWake),
      todayBed: formatTime(daylog.todayBed),
    });
    setNoteForm(daylog.note || '');
  }, [daylog.yesterdayBed, daylog.todayWake, daylog.todayBed, daylog.note]);

  const refresh = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['dashboard', today], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['daylog', today], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['daylog', yesterday], type: 'active' }),
    ]);
  };

  const update = (date, data) => updateDaylog.mutateAsync({
    id: date,
    data: { date, ...data },
    useDate: true,
  });

  const saveSleep = async () => {
    setSleepError('');
    try {
      await update(yesterday, { bed_time: formatTime(sleepForm.yesterdayBed) || null });
      await update(today, { wake_time: formatTime(sleepForm.todayWake) || null });
      await update(today, { bed_time: formatTime(sleepForm.todayBed) || null });
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
