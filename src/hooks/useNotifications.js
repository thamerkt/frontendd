import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  // Fetch notifications from the server
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('https://kong-7e283b39dauspilq0.kongcloud.dev/notifications/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`https://kong-7e283b39dauspilq0.kongcloud.dev/notifications/${notificationId}/read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('https://kong-7e283b39dauspilq0.kongcloud.dev/notifications/mark-all-read/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Set up real-time updates using WebSocket
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchNotifications();

    // Set up WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/notifications/');

    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotifications; 