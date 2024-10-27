import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileComponent = ({ onLogout }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/profile') // Adjust this endpoint as needed
      .then(response => {
        const { name, profilePicture } = response.data;
        setUserName(name);
        setProfilePic(profilePicture ? profilePicture : 'default-avatar.png');
      })
      .catch(error => console.error('Error fetching user data:', error));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', userName);
    if (file) {
      formData.append('profilePicture', file);
    }

    try {
      await axios.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2 className="profile-title">Profile</h2>
      <div className="profile-content">
        <div className="profile-picture-section">
          <img
            src={profilePic}
            alt="Profile"
            className="profile-picture"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
        <div className="profile-details-section">
          <label className="profile-label"><strong>User Name:</strong></label>
          <input
            type="text"
            value={userName}
            onChange={handleUserNameChange}
            className="profile-input"
          />
        </div>
      </div>
      <div className="profile-buttons">
        <button type="submit" className="profile-button save-button">
          Save Changes
        </button>
        <button type="button" onClick={handleLogout} className="profile-button logout-button">
          Logout
        </button>
      </div>
    </form>
  );
};

export default ProfileComponent;
