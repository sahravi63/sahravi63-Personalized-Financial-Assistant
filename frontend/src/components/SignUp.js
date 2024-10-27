import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';

const PasswordField = ({ value, onChange, placeholder, showPassword, toggleVisibility }) => (
  <div className="passwordWrapper">
    <input
      className='inputBox'
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    <button type="button" onClick={toggleVisibility} className="toggleButton">
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
);

const SignUp = () => {
  const [username, setUsername] = useState(""); // Change name to username
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  // Password validation: At least 8 characters, 1 special character, 1 number
  const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return password.length >= 8 && regex.test(password);
  }

  // Email validation
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  // Form submission handler
  const COLLECTDATA = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and include at least one special character and one number");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(""); // Clear error

    // Log form data for debugging
    console.warn(username, email, password); // Change name to username

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),  // Use "username" instead of "name"
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();
      console.log("Server Response:", result);

      if (response.ok) {
        console.log("Registration successful:", result);
        navigate('/login');  // Redirect to login page on success
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Registration failed. Please try again.");
    }
  }

  const redirectToLogin = () => navigate('/login');

  return (
    <div className='register'>
      <h1>Create New Account</h1>
      <input
        className='inputBox'
        type="text"
        value={username} // Change name to username
        onChange={(e) => setUsername(e.target.value)} // Change name to username
        placeholder='Enter Username' // Update placeholder
      />
      <input
        className='inputBox'
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter Email'
      />
      <PasswordField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Enter Password'
        showPassword={showPassword}
        toggleVisibility={togglePasswordVisibility}
      />
      <PasswordField
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder='Confirm Password'
        showPassword={showConfirmPassword}
        toggleVisibility={toggleConfirmPasswordVisibility}
      />
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button onClick={COLLECTDATA} className='appButton' type='button'>
        Register
      </button>
      <div className="auth-buttons">
        <button onClick={redirectToLogin} className='appButton' type='button'>
          Login
        </button>
      </div>
    </div>
  );
};

export default SignUp;
