import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('role') === 'admin');

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }}>
      {children}
    </UserContext.Provider>
  );
};
