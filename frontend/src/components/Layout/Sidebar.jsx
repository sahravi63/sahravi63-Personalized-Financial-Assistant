import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: 'DB' },
  { label: 'Manage', to: '/mainpage', icon: 'MG' },
  { label: 'Profile', to: '/profile', icon: 'PF' },
  { label: 'Cards', to: '/dashboard', icon: 'CD' },
  { label: 'Activity', to: '/activity', icon: 'AC' },
  { label: 'Budgets', to: '/budgets', icon: 'BD' },
  { label: 'Goals', to: '/goals', icon: 'GL' },
  { label: 'Calculators', to: '/calculators', icon: 'CL' },
  { label: 'Investment', to: '/investment', icon: 'IV' },
];

const Sidebar = ({ user, onLogout }) => (
  <aside className="sidebar glass">
    <div className="sidebar-logo">
      <span className="logo-mark">PFA</span>
      <span className="logo-text">Financial Assistance</span>
    </div>

    <nav className="sidebar-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={`${item.label}-${item.to}`}
          to={item.to}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
          }
        >
          <span className="sidebar-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="sidebar-user">
      <div className="sidebar-avatar">
        {(user?.username || user?.email || 'U').slice(0, 2).toUpperCase()}
      </div>
      <div className="sidebar-user-text">
        <span>{user?.username || 'Account'}</span>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>
    </div>

    <div className="sidebar-upgrade glass">
      <div className="upgrade-icon">PRO</div>
      <p className="upgrade-title">Upgrade Pro</p>
      <p className="upgrade-sub">Unlock premium financial planning tools.</p>
      <button type="button" className="upgrade-btn">Upgrade Now</button>
    </div>
  </aside>
);

export default Sidebar;
