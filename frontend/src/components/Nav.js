import React from 'react';
import { Link } from 'react-router-dom';

const Nav = ({ isLoggedIn, user, isAdmin }) => {
  return (
    <div>
      <ul className='dummy header'>
      <ul className="nav-ul">
        {isLoggedIn ? (
          isAdmin ? (
            <>
              <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
              <li><Link to="/users">Users</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
              <li><Link to="/more">More</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/mainpage">Main</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
              <li><Link to="/more">More</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/mainpage">Main</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </>
          )
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/SignUp">Sign Up</Link></li>
            <li><Link to="/Login">Login</Link></li>
          </>
        )}
      </ul>
      </ul>
    </div>
  );
};

export default Nav;
