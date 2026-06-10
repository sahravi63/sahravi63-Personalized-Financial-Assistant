import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const ResetPassword = () => {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/api/reset-password-request', { email });
      setMessage(data.message || 'Password reset instructions sent to your email.');
    } catch (error) {
      console.error('Error during password reset request:', error.response?.data || error.message);
      setMessage('Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/api/reset-password', { token, newPassword });
      setMessage(data.message || 'Password reset successfully.');
      setNewPassword('');
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
