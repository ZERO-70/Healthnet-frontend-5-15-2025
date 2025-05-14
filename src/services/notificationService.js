// Notification service for handling user notifications
const API_BASE_URL = 'https://frozen-sands-51239-b849a8d5756e.herokuapp.com';

// Key for storing last notification fetch timestamp in localStorage
const LAST_FETCH_KEY = 'lastNotificationFetch';
const LAST_SUGGESTION_CHECK_KEY = 'lastSuggestionCheck';

/**
 * Get the timestamp of the last notification fetch
 * @returns {string|null} ISO string timestamp or null if never fetched
 */
export const getLastFetchTimestamp = () => {
  return localStorage.getItem(LAST_FETCH_KEY);
};

/**
 * Set the timestamp of the last notification fetch to current time
 */
export const updateLastFetchTimestamp = () => {
  localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
};

/**
 * Get the timestamp of the last suggestion check
 * @returns {string|null} ISO string timestamp or null if never checked
 */
export const getLastSuggestionCheckTimestamp = () => {
  return localStorage.getItem(LAST_SUGGESTION_CHECK_KEY);
};

/**
 * Set the timestamp of the last suggestion check
 * @param {string} timestamp - ISO string timestamp to set
 */
export const updateLastSuggestionCheckTimestamp = (timestamp) => {
  localStorage.setItem(LAST_SUGGESTION_CHECK_KEY, timestamp);
};

/**
 * Format a timestamp into a human-readable string
 * @param {string} timestamp - ISO string timestamp
 * @returns {string} Formatted date string
 */
export const formatLastFetchTime = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, show time only
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If yesterday, show "Yesterday at time"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise show full date and time
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Fetch the last suggestion update date from the server
 * @returns {Promise<string>} ISO string timestamp of the last suggestion update
 */
export const fetchLastSuggestionUpdateDate = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token missing');
    }

    const response = await fetch(`${API_BASE_URL}/suggestion/lastUpdateDate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch last suggestion update date');
    }
    
    // Check if the response has content before trying to parse it
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.log('Received empty response from server for suggestion update date');
      return new Date().toISOString(); // Return current date as fallback
    }
    
    try {
      // Try to parse the response as JSON
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.warn('Failed to parse suggestion update date response:', parseError);
      return new Date().toISOString(); // Return current date as fallback
    }
  } catch (error) {
    console.error('Error fetching last suggestion update date:', error);
    // Return current date as fallback to avoid breaking the app
    return new Date().toISOString();
  }
};

/**
 * Fetch suggestions for the current patient
 * @returns {Promise<Object>} Suggestion data
 */
export const fetchSuggestionForPatient = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token missing');
    }

    console.log('[DEBUG] Fetching patient suggestions');
    
    // Updated to use getmine endpoint which uses JWT token for identification
    const response = await fetch(`${API_BASE_URL}/suggestion/getmine`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[DEBUG] Suggestion response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggestion');
    }
    
    // Check if the response has content before trying to parse it
    const text = await response.text();
    console.log('[DEBUG] Raw suggestion response:', text);
    
    if (!text || text.trim() === '') {
      console.log('Received empty response from server for patient suggestions');
      return null; // Return null if no suggestions
    }
    
    try {
      // Try to parse the response as JSON
      const parsedData = JSON.parse(text);
      console.log('[DEBUG] Parsed suggestions data type:', Array.isArray(parsedData) ? 'array' : typeof parsedData);
      
      // If we get an array, return the most recent suggestion (first item)
      // If it's an empty array, return null
      if (Array.isArray(parsedData)) {
        console.log('[DEBUG] Received array of suggestions, length:', parsedData.length);
        return parsedData.length > 0 ? parsedData[0] : null;
      }
      
      // Otherwise return the single suggestion object
      return parsedData;
    } catch (parseError) {
      console.warn('Failed to parse suggestion response:', parseError);
      return null; // Return null if parsing fails
    }
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    return null; // Return null instead of throwing to prevent app crashes
  }
};

/**
 * Check for new suggestions and add them to notifications if needed
 * @returns {Promise<boolean>} True if new suggestions were found and added
 */
export const checkAndAddSuggestions = async () => {
  try {
    console.log('[DEBUG] Starting checkAndAddSuggestions');
    
    // Get the last time we checked for suggestions
    const lastCheck = getLastSuggestionCheckTimestamp();
    console.log('[DEBUG] Last check timestamp:', lastCheck);
    
    // Get the last time suggestions were updated on the server
    const lastUpdateDate = await fetchLastSuggestionUpdateDate();
    console.log('[DEBUG] Last update date from server:', lastUpdateDate);
    
    // Always fetch suggestions when the website loads, regardless of timestamp
    console.log('[DEBUG] Fetching suggestions from server');
    
    // Fetch the new suggestion
    const suggestion = await fetchSuggestionForPatient();
    console.log('[DEBUG] Got suggestions:', suggestion);
    
    if (suggestion) {
      // Create a notification from the suggestion
      const notification = {
        id: `suggestion-${suggestion.suggestionId || suggestion.suggestion_id}`, // Handle different property names
        message: suggestion.suggestionText || suggestion.suggestion_text, // Handle different property names
        date: suggestion.createdAt || suggestion.created_at, // Handle different property names
        is_read: false,
        type: 'suggestion'
      };
      
      console.log('[DEBUG] Created notification from suggestion:', notification);
      
      // Replace existing notifications with new ones instead of checking for duplicates
      const notifications = [{...notification, date: new Date().toISOString()}];
      localStorage.setItem('notifications', JSON.stringify(notifications));
      console.log('[DEBUG] Updated notifications with fresh suggestion data');
      
      // Update the last check timestamp to the current server update timestamp
      updateLastSuggestionCheckTimestamp(lastUpdateDate);
      
      return true; // Indicate that we added a new suggestion
    } else {
      console.log('[DEBUG] No suggestion received from server');
      
      // Clear notifications if no suggestions are available
      localStorage.setItem('notifications', JSON.stringify([]));
      console.log('[DEBUG] Cleared notifications as no suggestions are available');
    }
    
    // Update the last check timestamp
    updateLastSuggestionCheckTimestamp(lastUpdateDate);
    
    return false; // No new suggestions added
  } catch (error) {
    console.error('Error checking for suggestions:', error);
    return false;
  }
};

export const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token missing');
    }

    // Instead of fetching from API, get from localStorage since we're using a local store for notifications
    // in this implementation that includes suggestions
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Update the last fetch timestamp
    updateLastFetchTimestamp();
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token missing');
    }

    // For our local implementation, update in localStorage
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, is_read: true };
      }
      return notification;
    });
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token missing');
    }

    // For our local implementation, update all in localStorage
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.map(notification => {
      return { ...notification, is_read: true };
    });
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Add a new notification to the system
 * @param {Object} notification - Notification object to add
 * @returns {Promise<Object>} Updated notifications array
 */
export const addNotification = async (notification) => {
  try {
    // Get existing notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Add the new notification to the beginning
    const updatedNotifications = [notification, ...notifications];
    
    // Save back to localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    return updatedNotifications;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};