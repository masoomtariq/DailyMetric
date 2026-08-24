const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://masoomtariq-habit-tracker.hf.space';
const REFRESH_ENDPOINT = import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || '/auth/refresh';

let accessToken = null;
let refreshPromise = null;
let sessionExpiredHandler = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

const clearSession = () => {
  accessToken = null;
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

  const data = await response.json();
  const token = data.access_token || data.accessToken || data.token;
  if (!token) throw new Error('Token refresh response did not include an access token');
  accessToken = token;
  return token;
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
    try {
      await refreshPromise;
    } catch (error) {
      throw error;
    }
  }

  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(requestUrl, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status !== 401 || config.skipAuthRetry || isRefreshRequest(endpoint) || config.hasRetried) {
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
