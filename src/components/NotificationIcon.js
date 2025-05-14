import React, { useState, useEffect } from 'react';
import { FiBell, FiInfo, FiMessageSquare } from 'react-icons/fi';
import { 
  fetchNotifications, 
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getLastFetchTimestamp,
  formatLastFetchTime
} from '../services/notificationService';
import '../styles/NotificationIcon.css';

// Helper to get current user's role from localStorage.homeData
const getUserRole = () => {
  const homeData = localStorage.getItem('homeData');
  if (!homeData) return '';
  try {
    const parsed = JSON.parse(homeData);
    return parsed.role || parsed.userRole || parsed.user?.role || '';
  } catch {
    const lower = homeData.toLowerCase();
    if (lower.includes('patient')) return 'PATIENT';
    if (lower.includes('doctor')) return 'DOCTOR';
    if (lower.includes('staff')) return 'STAFF';
    if (lower.includes('admin')) return 'ADMIN';
    return '';
  }
};

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(getLastFetchTimestamp());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        setIsLoading(true);
        const rawData = await fetchNotifications();
        const role = getUserRole();
        // Exclude patient advice suggestions for non-patient portals
        const filtered = rawData.filter(n => !(n.type === 'suggestion' && role !== 'PATIENT'));
        setNotifications(filtered);
        setUnreadCount(filtered.filter(notification => !notification.is_read).length);
        
        // Update the last fetch time from localStorage
        setLastFetchTime(getLastFetchTimestamp());
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    getNotifications();

    // Poll for new notifications every 30 seconds
    const intervalId = setInterval(getNotifications, 30000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      setError('Failed to update notifications');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, is_read: true };
        }
        return notification;
      });
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Failed to update notification');
    }
  };

  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      const rawData = await fetchNotifications();
      const role = getUserRole();
      const filtered = rawData.filter(n => !(n.type === 'suggestion' && role !== 'PATIENT'));
      setNotifications(filtered);
      setUnreadCount(filtered.filter(notification => !notification.is_read).length);
      setLastFetchTime(getLastFetchTimestamp());
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
      setError('Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="notification-wrapper">
      <div className="notifications-icon" onClick={toggleNotifications}>
        <FiBell />
        {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
      </div>

      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button 
              className="refresh-button" 
              onClick={refreshNotifications}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          
          {error && <div className="notification-error">{error}</div>}
          
          <div className="last-fetch-info">
            <FiInfo className="info-icon" />
            <span>Last checked: {formatLastFetchTime(lastFetchTime)}</span>
          </div>
          
          {isLoading ? (
            <div className="loading-indicator">Loading...</div>
          ) : notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${notification.type === 'suggestion' ? 'suggestion' : ''}`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  {notification.type === 'suggestion' && (
                    <FiMessageSquare className="notification-type-icon" />
                  )}
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span>{new Date(notification.date).toLocaleString()}</span>
                    {notification.type === 'suggestion' && (
                      <span className="suggestion-label">Health Suggestion</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-notifications">No notifications</p>
          )}
          
          {unreadCount > 0 && (
            <button 
              className="mark-read-button" 
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;