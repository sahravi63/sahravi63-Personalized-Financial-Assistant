import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return password.length >= 8 && regex.test(password);
  };

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/api/reset-password-request', { email });
      setMessage(data.message || 'Check your email for a reset link.');
      setEmail('');
    } catch (error) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to send reset instructions.';
      console.error('Error during password reset request:', error.response?.data || error.message);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage('Password must be at least 8 characters and include at least one number and one special character.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/api/reset-password', { token, newPassword });
      setMessage(data.message || 'Password reset successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Error resetting password:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <div className="reset-password">
        <h1>Reset Password</h1>
        <form onSubmit={handleResetPassword}>
          <input
            className="inputBox"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <input
            className="inputBox"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <button className="appButton" type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div className="reset-password">
      <h1>Reset Password</h1>
      <form onSubmit={handleRequestReset}>
        <input
          className="inputBox"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <button className="appButton" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
