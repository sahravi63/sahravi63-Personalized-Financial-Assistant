import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return; // Validate before making request

    setLoading(true); // Start loading
    setError(''); // Clear previous errors

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorResult = await response.json();
        setError(errorResult.error || 'Login failed. Please try again.');
        setLoading(false); // Stop loading
        return;
      }
  
      const result = await response.json();
      console.log('Login successful:', result);
      onLogin(result); // Pass user data to parent component

      // Store token in localStorage for future authenticated requests
      localStorage.setItem('token', result.token);

      navigate('/mainpage'); // Redirect to main page after login
    } catch (error) {
      console.error('Error during login:', error);
      setError('Login failed. Please check your network and try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  return (
    <div className='login'>
      <h1>Login</h1>
      <input 
        className='inputBox' 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter Email'
      />
      <div className="passwordWrapper">
        <input 
          className='inputBox' 
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter Password'
        />
        <button type="button" onClick={togglePasswordVisibility} className="toggleButton">
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button 
        onClick={handleLogin} 
        className='appButton' 
        type='button' 
        disabled={loading} // Disable button when loading
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        <Link to="/reset-password">Forgot Password?</Link>
      </p>
    </div>
  );
};

export default Login;
