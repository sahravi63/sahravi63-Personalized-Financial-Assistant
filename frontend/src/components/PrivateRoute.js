import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, isLoggedIn, redirectTo = '/login' }) => {
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
