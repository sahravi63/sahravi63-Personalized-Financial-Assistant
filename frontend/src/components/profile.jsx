import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './profile.css';

/**
 * Build a full image URL from a stored path or absolute URL.
 * Backend stores paths like "uploads/1234567890.jpg".
 * baseURL is already e.g. "http://localhost:8080" (no trailing slash).
 */
const getProfileImageUrl = (profilePic) => {
  if (!profilePic) return '';
  if (/^https?:\/\//i.test(profilePic)) return profilePic;
  // Normalise backslashes (Windows paths from multer on Windows)
  const normalised = profilePic.replace(/\\/g, '/');
  return `${api.defaults.baseURL}/${normalised}`;
};

/** Return up-to-two uppercase initials for an avatar fallback. */
const getInitials = (name, username) => {
  const source = name || username || '?';
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
};

const ProfileComponent = ({ user: propUser, onLogout }) => {
  const [userName,   setUserName]     = useState('');
  const [username,   setUsername]     = useState(''); // read-only display
  const [email,      setEmail]        = useState(''); // read-only display
  const [file,       setFile]         = useState(null);
  const [previewUrl, setPreviewUrl]   = useState('');
  const [message,    setMessage]      = useState({ text: '', type: '' }); // type: 'success'|'error'
  const [loading,    setLoading]      = useState(true);
  const [saving,     setSaving]       = useState(false);
  const navigate = useNavigate();

  /* ── Fetch profile on mount ── */
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/current-user');
        const safeUser = data || {};
        const initialName = safeUser.name || propUser?.name || '';
        const initialUsername = safeUser.username || propUser?.username || '';
        const initialEmail = safeUser.email || propUser?.email || '';
        const picUrl = getProfileImageUrl(safeUser.profilePic || propUser?.profilePic);

        setUserName(initialName);
        setUsername(initialUsername);
        setEmail(initialEmail);
        setPreviewUrl(picUrl || '');
      } catch (error) {
        setMessage({ text: 'Failed to load profile.', type: 'error' });
        console.error('fetchProfile error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── File selection → local preview ── */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    // Revoke previous object URL to free memory
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setMessage({ text: '', type: '' });
  };

  /* ── Save profile ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('name', userName.trim());
    if (file) formData.append('profilePic', file);

    try {
      const { data } = await api.post('/api/updateProfile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = data.user;
      setUserName(updated?.name || userName);
      const newPicUrl = getProfileImageUrl(updated?.profilePic);
      if (newPicUrl) setPreviewUrl(newPicUrl);
      setFile(null);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
      console.error('updateProfile error:', error.response?.data || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/', { replace: true });
  };

  /* ── Render ── */
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <span className="profile-spinner" aria-label="Loading" />
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-card__header">
          <h2 className="profile-card__title">My Profile</h2>
          <p className="profile-card__sub">Manage your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-card__body">
          {/* Avatar section */}
          <div className="profile-avatar-col">
            <div className="profile-avatar-wrap">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`${userName || username}'s avatar`}
                  className="profile-avatar__img"
                  onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="profile-avatar__initials" aria-hidden="true">
                  {getInitials(userName, username)}
                </div>
              )}
              {/* Invisible real input, triggered by styled label */}
              <input
                id="profile-pic-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="profile-file-input--hidden"
                aria-label="Upload profile picture"
              />
              <label htmlFor="profile-pic-input" className="profile-avatar__change-btn">
                Change Photo
              </label>
            </div>
            {file && (
              <p className="profile-avatar__filename" title={file.name}>
                {file.name.length > 24 ? file.name.slice(0, 21) + '…' : file.name}
              </p>
            )}
          </div>

          {/* Details section */}
          <div className="profile-details-col">
            {/* Read-only username */}
            {username && (
              <div className="profile-field">
                <label className="profile-field__label">Username</label>
                <input
                  type="text"
                  value={username}
                  readOnly
                  className="profile-field__input profile-field__input--readonly"
                  aria-label="Username (read-only)"
                />
              </div>
            )}

            {/* Read-only email */}
            {email && (
              <div className="profile-field">
                <label className="profile-field__label">Email</label>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="profile-field__input profile-field__input--readonly"
                  aria-label="Email (read-only)"
                />
              </div>
            )}

            {/* Editable display name */}
            <div className="profile-field">
              <label className="profile-field__label" htmlFor="profile-name">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="profile-field__input"
                placeholder="Enter your display name"
                maxLength={60}
                required
              />
            </div>

            {/* Message feedback */}
            {message.text && (
              <p className={`profile-message profile-message--${message.type}`} role="status">
                {message.text}
              </p>
            )}

            {/* Action buttons */}
            <div className="profile-actions">
              <button
                type="submit"
                className="profile-btn profile-btn--save"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="profile-btn profile-btn--logout"
              >
                Logout
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileComponent;