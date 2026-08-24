import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiJson } from '../api/apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://masoomtariq-habit-tracker.hf.space';

export const getApiErrorMessage = (error) => {
  const status = error?.status || error?.response?.status;
  return status ? `API request failed (${status})` : 'API request failed (network error)';
};

// Generic fetch wrapper
const fetchWithAuth = async (endpoint, options = {}) => {
  return apiJson(endpoint, options, { baseUrl: API_BASE });
};

// Activity Mutations
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/activities/add_activity', {
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
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/daylogs/add_daylog', {
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
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, data, useDate = false }) => {
      const endpoint = useDate 
        ? `/daylogs/update_daylog?daylog_date=${id}`
        : `/daylogs/update_daylog?day_log_id=${id}`;
      return fetchWithAuth(endpoint, {
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
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/goals/add_goal', {
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
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => fetchWithAuth(`/goals/update_goal/by_id/${id}`, {
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
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: (data) => fetchWithAuth('/finance/transaction', {
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
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => fetchWithAuth(`/finance/transaction/${id}`, {
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
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['dashboard', date],
    queryFn: () => fetchWithAuth(`/analytics/dashboard?date=${date}`),
    enabled: !!isAuthenticated && !!date,
  });
};

// Goals Query
export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => fetchWithAuth('/goals/get_goal_titles'),
    enabled: false,
  });
};

// Activities Query
export const useActivitiesByDate = (date) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['activities', date],
    queryFn: () => fetchWithAuth(`/activities/by-date/${date}`),
    enabled: !!isAuthenticated && !!date,
  });
};

// Finance Query
export const useFinanceData = (year, month, refreshKey = 0) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['finance', year, month, refreshKey],
    queryFn: () => fetchWithAuth(`/finance/transaction_history/${year}/${month}`),
    enabled: !!isAuthenticated && !!year && !!month && year !== null && month !== null,
  });
};

// Finance Query with custom date range
export const useFinanceDataByDateRange = (startDate, endDate, refreshKey = 0) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['finance', 'custom', startDate, endDate, refreshKey],
    queryFn: () => {
      if (startDate === 'all' && endDate === 'all') {
        return fetchWithAuth('/finance/transaction_history');
      }
      const params = new URLSearchParams();
      if (startDate && startDate !== 'all') params.append('start_date', startDate);
      if (endDate && endDate !== 'all') params.append('end_date', endDate);
      return fetchWithAuth(`/finance/transaction_history?${params.toString()}`);
    },
    enabled: !!isAuthenticated && (startDate !== null && endDate !== null),
  });
};

export const useTotalBalance = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['totalBalance'],
    queryFn: () => fetchWithAuth('/finance/total_balance'),
    enabled: !!isAuthenticated,
  });
};

// Tracker Query
export const useTrackerData = (startDate, endDate, refreshKey = 0) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['tracker', startDate, endDate, refreshKey],
    queryFn: () => {
      if (startDate === 'all' && endDate === 'all') {
        return fetchWithAuth('/analytics/tracker');
      }
      return fetchWithAuth(`/analytics/tracker?start_date=${startDate}&end_date=${endDate}`);
    },
    enabled: !!isAuthenticated && (startDate !== null && endDate !== null),
  });
};

// Daylog by Date Query
export const useDaylogByDate = (date) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['daylog', date],
    queryFn: () => fetchWithAuth(`/daylogs/by_date/${date}`),
    enabled: !!isAuthenticated && !!date,
  });
};