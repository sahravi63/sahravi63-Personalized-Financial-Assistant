import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../Nav';
import Footer from '../Footer/Footer';

const Layout = ({ isLoggedIn, user, isAdmin, onLogout }) => {
  return (
    <div className="App">
      <Nav isLoggedIn={isLoggedIn} user={user} isAdmin={isAdmin} onLogout={onLogout} />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
