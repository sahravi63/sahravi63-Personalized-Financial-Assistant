import React from 'react';
import { Link } from 'react-router-dom';

const Nav = ({ isLoggedIn, isAdmin, onLogout }) => {
  return (
    <nav className="dummy header" aria-label="Primary navigation">
      <ul className="nav-ul">
        {isLoggedIn ? (
          <>
            {isAdmin ? (
              <>
                <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
                <li><Link to="/users">Users</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/mainpage">Main</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </>
            )}
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li>
              <button type="button" className="nav-button" onClick={onLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
