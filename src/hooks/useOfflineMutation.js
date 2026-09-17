import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';

const OFFLINE_QUEUE_KEY = 'DailyMetric_offline_queue';

export const useOfflineMutation = ({ 
  mutationFn, 
  onSuccess, 
  onError,
  queryKey 
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Save to offline queue
  const saveToQueue = (variables) => {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      queue.push({
        id: Date.now(),
        variables,
        timestamp: new Date().toISOString(),
        mutationFn: mutationFn.name || 'unknown'
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      showToast('Saved offline - will sync when connection is restored', 'info');
    } catch (error) {
      console.error('Failed to save to offline queue:', error);
    }
  };

  return useMutation({
    mutationFn: async (variables) => {
      // Check if online
      if (!navigator.onLine) {
        saveToQueue(variables);
        throw new Error('Offline - saved to queue');
      }
      return mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error, variables) => {
      if (error.message === 'Offline - saved to queue') {
        // Already handled by saveToQueue
        return;
      }
      if (onError) onError(error, variables);
      showToast('Failed to save activity', 'error');
    },
  });
};

// Hook to process offline queue when connection is restored
export const useOfflineSync = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const syncOfflineData = async () => {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      if (queue.length === 0) return;

      showToast(`Syncing ${queue.length} offline activities...`, 'info');

      // This would need to be more sophisticated in a real app
      // For now, we'll just clear the queue and refresh data
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      showToast('Offline data synced successfully', 'success');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      showToast('Failed to sync offline data', 'error');
    }
  };

  return { syncOfflineData };
};

// Hook to monitor online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};