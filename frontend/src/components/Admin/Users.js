import React, { useEffect, useState } from 'react';
import api from '../../api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then((response) => {
        setUsers(response.data || []);
      })
      .catch((error) => {
        setError('Failed to fetch users.');
        console.error('Error fetching users:', error.response?.data || error.message);
      });
  }, []);

  return (
    <div>
      <h1>Users List</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user._id || user.id}>
            {user.username || user.name || 'Unnamed User'} ({user.email}) - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
