import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminDashboard = () => {
  const navigate = useNavigate(); // Use navigate instead of history
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState('');

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (!refreshToken) return false;

    try {
      const response = await api.post('/admin/refresh-token', { token: refreshToken });
      if (response.data.accessToken) {
        localStorage.setItem('adminAccessToken', response.data.accessToken);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      return false;
    }
  }, []); // No dependencies for refreshToken

  // Function to verify token and fetch dashboard data
  const verifyTokenAndFetchData = useCallback(async (retried = false) => {
    const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    try {
      await api.get('/admin/dashboard');
      setLoading(false); // Data fetched successfully
    } catch (err) {
      if (err.response?.status === 403 && !retried) {
        const refreshed = await refreshToken();
        if (refreshed) {
          await verifyTokenAndFetchData(true);
        } else {
          navigate('/admin-login');
        }
      } else {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    }
  }, [navigate, refreshToken]); // Include navigate and refreshToken as dependencies

  useEffect(() => {
    verifyTokenAndFetchData();
  }, [verifyTokenAndFetchData]); // Use verifyTokenAndFetchData as the dependency

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Render other admin-specific content here */}
    </div>
  );
};

export default AdminDashboard;
