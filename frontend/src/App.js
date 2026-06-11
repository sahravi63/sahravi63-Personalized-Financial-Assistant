import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Nav from './components/Nav';
import Footer from './components/Footer/Footer';
import Sidebar from './components/Layout/Sidebar';
import SignUp from './components/SignUp';
import Login from './components/Login/Login';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import DashBoard from './components/DashBoard/dashboard';
import MainPage from './components/mainpage/mainpage';
import Profile from './components/profile';
import Home from './components/Home/homepage';
import Users from './components/Admin/Users';
import ResetPassword from './components/ResetPassword';

function AppShell({ isLoggedIn, setIsLoggedIn, user, setUser, isAdmin, setIsAdmin, handleLogin, handleLogout }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const showSidebar = isLoggedIn && !isAdmin && !isHomePage;

  return (
    <div className={`App ${showSidebar ? 'App--with-sidebar' : ''}`}>
      {showSidebar ? (
        <Sidebar user={user} onLogout={handleLogout} />
      ) : !isHomePage ? (
        <Nav isLoggedIn={isLoggedIn} user={user} isAdmin={isAdmin} onLogout={handleLogout} />
      ) : null}
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={isLoggedIn && !isAdmin ? <DashBoard /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/dashboard"
            element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" />}
          />
          <Route
            path="/mainpage"
            element={isLoggedIn ? <MainPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isLoggedIn && !isAdmin ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/admin-login"
            element={!isLoggedIn ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/admin/dashboard" />}
          />
          <Route
            path="/users"
            element={isLoggedIn && isAdmin ? <Users /> : <Navigate to="/" />}
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact-us" element={<h1>Contact Us</h1>} />
          <Route path="*" element={<h1>404 - Not Found</h1>} />
        </Routes>
      </div>
      {!showSidebar && !isHomePage && <Footer />}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('role') === 'admin');

  const handleLogin = (userData) => {
    const loggedInUser = userData.user || userData.admin || userData;
    const role = loggedInUser?.role || userData.role || 'user';

    setIsLoggedIn(true);
    setUser(loggedInUser);
    setIsAdmin(role === 'admin');
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('role', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppShell
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        user={user}
        setUser={setUser}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

export default App;
