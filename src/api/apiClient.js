const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://habit-tracker-mfmf.onrender.com';
const REFRESH_ENDPOINT = import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || '/auth/refresh';

let refreshPromise = null;
let sessionExpiredHandler = null;

export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

const clearSession = () => {
  if (sessionExpiredHandler) sessionExpiredHandler();
};

const isRefreshRequest = (endpoint) => endpoint.endsWith(REFRESH_ENDPOINT);

const refreshAccessToken = async (baseUrl) => {
  const response = await fetch(`${baseUrl}${REFRESH_ENDPOINT}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = new Error(`Token refresh failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response;
};

const getRefreshPromise = (baseUrl) => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(baseUrl).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const apiRequest = async (endpoint, options = {}, config = {}) => {
  const baseUrl = config.baseUrl || DEFAULT_API_BASE;
  const requestUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  if (refreshPromise && !config.skipAuthRetry && !config.hasRetried && !isRefreshRequest(endpoint)) {
    await refreshPromise;
  }

  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(requestUrl, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status !== 401 || config.skipAuthRetry || isRefreshRequest(endpoint)) {
    return response;
  }

  if (config.hasRetried) {
    clearSession();
    return response;
  }

  try {
    await getRefreshPromise(baseUrl);
  } catch (error) {
    clearSession();
    throw error;
  }

  return apiRequest(endpoint, options, { ...config, baseUrl, hasRetried: true });
};

export const apiJson = async (endpoint, options = {}, config = {}) => {
  const response = await apiRequest(endpoint, options, config);
  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};
