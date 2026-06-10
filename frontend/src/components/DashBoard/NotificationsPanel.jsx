import React from 'react';

const NOTIFICATIONS = [
  { id: 1, name: 'Michael Dew', msg: 'Your transfer of $120 is complete.', time: '8 mins ago', status: 'Completed', avatar: 'MD' },
  { id: 2, name: 'Jessica Wallet', msg: 'Payment for $580 was transferred.', time: '16 mins ago', status: 'Transferred', avatar: 'JW' },
  { id: 3, name: 'Amanda Shaw', msg: 'Payment request for $95 is pending.', time: '20 mins ago', status: 'Pending', avatar: 'AS' },
  { id: 4, name: 'Aditi Tak', msg: 'Request for $180 received.', time: '1 hr ago', status: 'Pending', avatar: 'AT' },
];

const statusColors = {
  Completed: { background: 'rgba(74, 222, 128, 0.16)', color: '#4ade80' },
  Transferred: { background: 'rgba(96, 165, 250, 0.16)', color: '#60a5fa' },
  Pending: { background: 'rgba(251, 191, 36, 0.16)', color: '#fbbf24' },
};

const NotificationsPanel = ({ onClose }) => (
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
        {NOTIFICATIONS.map((notification) => {
          const statusStyle = statusColors[notification.status] || statusColors.Pending;
          return (
            <article key={notification.id} className="notif-item">
              <div className="notif-avatar">{notification.avatar}</div>
              <div className="notif-body">
                <p className="notif-name">{notification.name}</p>
                <p className="notif-msg">{notification.msg}</p>
                <div className="notif-footer">
                  <span className="notif-time">{notification.time}</span>
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

export default NotificationsPanel;
