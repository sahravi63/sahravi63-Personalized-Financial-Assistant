import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';


const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const { data } = await api.post('/admin/login', { email, password });
    if (data.success) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('adminAccessToken', data.accessToken);
      localStorage.setItem('adminRefreshToken', data.refreshToken || data.accessToken);
      onLogin?.(data);
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  } catch (err) {
    setError('Error during login. Please try again.');
  }
};


  return (
    <div>
      <h1>Admin Login</h1>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AdminLogin;
