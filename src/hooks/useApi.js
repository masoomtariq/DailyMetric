import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://masoomtariq-habit-tracker.hf.space';

// Generic fetch wrapper
const fetchWithAuth = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// Activity Mutations
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/activities/add_activity', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      success('Activity logged successfully!');
    },
    onError: (_err) => {
      toastError('Failed to log activity. Please try again.');
    },
  });
};

// Daylog Mutations
export const useCreateDaylog = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/daylogs/add_daylog', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['daylogs'] });
      success('Daylog saved successfully!');
    },
    onError: (_err) => {
      toastError('Failed to save daylog. Please try again.');
    },
  });
};

export const useUpdateDaylog = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, data, useDate = false }) => {
      const endpoint = useDate 
        ? `/daylogs/update_daylog?daylog_date=${id}`
        : `/daylogs/update_daylog?day_log_id=${id}`;
      return fetchWithAuth(endpoint, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['daylogs'] });
      queryClient.invalidateQueries({ queryKey: ['daylog'] });
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
      success('Daylog updated successfully!');
    },
    onError: (_err) => {
      toastError('Failed to update daylog. Please try again.');
    },
  });
};

// Goal Mutations
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/goals/add_goal', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      success('Goal created successfully!');
    },
    onError: (_err) => {
      toastError('Failed to create goal. Please try again.');
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => fetchWithAuth(`/goals/update_goal/by_id/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      success('Goal updated successfully!');
    },
    onError: (_err) => {
      toastError('Failed to update goal. Please try again.');
    },
  });
};

// Transaction Mutations
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/finance/transaction', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success('Transaction added successfully!');
    },
    onError: (_err) => {
      toastError('Failed to add transaction. Please try again.');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => fetchWithAuth(`/finance/transaction/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
      success('Transaction updated successfully!');
    },
    onError: (_err) => {
      toastError('Failed to update transaction. Please try again.');
    },
  });
};

// Dashboard Query
export const useDashboardData = (date) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['dashboard', date],
    queryFn: () => fetchWithAuth(`/analytics/dashboard?date=${date}`, token),
    enabled: !!token && !!date,
  });
};

// Goals Query
export const useGoals = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['goals'],
    queryFn: () => fetchWithAuth('/goals/get_goal_titles', token),
    enabled: !!token,
  });
};

// Activities Query
export const useActivitiesByDate = (date) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['activities', date],
    queryFn: () => fetchWithAuth(`/activities/by-date/${date}`, token),
    enabled: !!token && !!date,
  });
};

// Finance Query
export const useFinanceData = (year, month, refreshKey = 0) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['finance', year, month, refreshKey],
    queryFn: () => fetchWithAuth(`/finance/transaction_history/${year}/${month}`, token),
    enabled: !!token && !!year && !!month && year !== null && month !== null,
  });
};

// Finance Query with custom date range
export const useFinanceDataByDateRange = (startDate, endDate, refreshKey = 0) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['finance', 'custom', startDate, endDate, refreshKey],
    queryFn: () => {
      if (startDate === 'all' && endDate === 'all') {
        return fetchWithAuth('/finance/transaction_history', token);
      }
      const params = new URLSearchParams();
      if (startDate && startDate !== 'all') params.append('start_date', startDate);
      if (endDate && endDate !== 'all') params.append('end_date', endDate);
      return fetchWithAuth(`/finance/transaction_history?${params.toString()}`, token);
    },
    enabled: !!token && ((startDate !== null && endDate !== null) || (startDate === 'all' && endDate === 'all')),
  });
};

export const useTotalBalance = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['totalBalance'],
    queryFn: () => fetchWithAuth('/finance/total_balance', token),
    enabled: !!token,
  });
};

// Tracker Query
export const useTrackerData = (startDate, endDate, refreshKey = 0) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['tracker', startDate, endDate, refreshKey],
    queryFn: () => {
      if (startDate === 'all' && endDate === 'all') {
        return fetchWithAuth('/analytics/tracker', token);
      }
      return fetchWithAuth(`/analytics/tracker?start_date=${startDate}&end_date=${endDate}`, token);
    },
    enabled: !!token && ((startDate !== null && endDate !== null) || (startDate === 'all' && endDate === 'all')),
  });
};

// Daylog by Date Query
export const useDaylogByDate = (date) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['daylog', date],
    queryFn: () => fetchWithAuth(`/daylogs/by_date/${date}`, token),
    enabled: !!token && !!date,
  });
};