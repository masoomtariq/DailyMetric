/**
 * Formats time string to include seconds and handles empty strings
 * @param {string} timeStr - Time string in HH:MM or HH:MM:SS format
 * @returns {string|null} - Formatted time string with seconds or null if empty
 */
export const formatTimeWithSeconds = (timeStr) => {
  if (!timeStr || timeStr.trim() === '') return null;
  if (timeStr.split(':').length === 2) return timeStr + ':00';
  return timeStr;
};

/**
 * Formats time string for display (removes seconds if present)
 * @param {string} timeStr - Time string in HH:MM:SS or HH:MM format
 * @returns {string} - Time string in HH:MM format or empty string if null
 */
export const formatTimeForDisplay = (timeStr) => {
  if (!timeStr || timeStr.trim() === '') return '';
  return timeStr.split(':').slice(0, 2).join(':');
};

/**
 * Formats time string to AM/PM format
 * @param {string} timeString - Time string in HH:MM or HH:MM:SS format
 * @returns {string} - Time in AM/PM format or 'Not set' if empty
 */
export const formatTimeToAMPM = (timeString) => {
  if (!timeString || timeString.trim() === '') return 'Not set';
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};
