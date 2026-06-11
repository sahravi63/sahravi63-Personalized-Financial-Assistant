import React, { useEffect, useState } from 'react';
import api from '../../api';

const statusColors = {
  Completed: { background: 'rgba(74, 222, 128, 0.16)', color: '#4ade80' },
  Transferred: { background: 'rgba(96, 165, 250, 0.16)', color: '#60a5fa' },
  Pending: { background: 'rgba(251, 191, 36, 0.16)', color: '#fbbf24' },
};

const NotificationsPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/api/dashboard/notifications');
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
  <>
    <button
      type="button"
      className="notif-overlay"
      onClick={onClose}
      aria-label="Close notifications"
    />
    <section className="notif-panel glass" aria-label="Notifications">
      <div className="notif-header">
        <h3>Notifications</h3>
        <button type="button" onClick={onClose} className="notif-close" aria-label="Close notifications">
          x
        </button>
      </div>
      <div className="notif-list">
        {notifications.map((notification) => {
          const statusStyle = statusColors[notification.status] || statusColors.Pending;
          return (
            <article key={notification._id || notification.id} className="notif-item">
              <div className="notif-avatar">{notification.avatar}</div>
              <div className="notif-body">
                <p className="notif-name">{notification.title}</p>
                <p className="notif-msg">{notification.message}</p>
                <div className="notif-footer">
                  <span className="notif-time">{notification.timeLabel}</span>
                  <span className="notif-status" style={statusStyle}>
                    {notification.status}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <button type="button" className="notif-view-all">View all notifications</button>
    </section>
  </>
  );
};

export default NotificationsPanel;
