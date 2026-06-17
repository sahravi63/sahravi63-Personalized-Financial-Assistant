import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const verifyTokenAndFetchData = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    try {
      await api.get('/admin/dashboard');
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/admin-login');
      } else {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    }
  }, [navigate]);

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
