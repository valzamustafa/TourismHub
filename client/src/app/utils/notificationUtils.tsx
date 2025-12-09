export const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  if (typeof window !== 'undefined' && (window as any).showToastNotification) {
    (window as any).showToastNotification({ title, message, type });
  } else {

    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  }
};

export const updateNotificationCount = (increment: number = 1) => {
  try {
    const currentCount = parseInt(localStorage.getItem('notificationCount') || '0');
    const newCount = Math.max(0, currentCount + increment);
    localStorage.setItem('notificationCount', newCount.toString());
    
   
    const event = new CustomEvent('notification-count-updated', { 
      detail: { count: newCount } 
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error updating notification count:', error);
  }
};


export const getNotificationCount = (): number => {
  try {
    return parseInt(localStorage.getItem('notificationCount') || '0');
  } catch {
    return 0;
  }
};


export const clearAllNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5224/api/notifications', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      localStorage.setItem('notificationCount', '0');
      const event = new CustomEvent('notification-count-updated', { 
        detail: { count: 0 } 
      });
      window.dispatchEvent(event);
      return true;
    }
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
  return false;
};