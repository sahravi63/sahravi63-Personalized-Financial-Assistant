import React, { useState } from 'react';
import api from '../../api';

const AddIncome = ({ onAddIncome }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/income', {
        description: description.trim(),
        amount: parseFloat(amount),
        category,
      });
      setDescription('');
      setAmount('');
      setCategory('General');
      setSuccess('Income added successfully!');
      if (onAddIncome) onAddIncome();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add income');
    }
  };

  return (
    <div>
      <h2>Add Income</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} required />
        <input type="number" placeholder="Amount" value={amount} min="0.01" step="0.01"
          onChange={(e) => setAmount(e.target.value)} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {['General','Salary','Freelance','Investment','Gift','Other']
            .map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">Add Income</button>
      </form>
    </div>
  );
};

export default AddIncome;
