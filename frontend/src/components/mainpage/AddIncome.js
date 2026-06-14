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
    <form className="manage-form" onSubmit={handleSubmit}>
      <h3>New Income</h3>
      <div className="manage-form-row">
        <input
          type="text"
          className="manage-input"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          className="manage-input"
          placeholder="Amount"
          value={amount}
          min="0.01"
          step="0.01"
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <select className="manage-select" value={category} onChange={(e) => setCategory(e.target.value)}>
        {['General', 'Salary', 'Freelance', 'Investment', 'Gift', 'Other'].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {error && <p className="manage-form-error">{error}</p>}
      {success && <p className="manage-form-success">{success}</p>}
      <button type="submit" className="manage-submit-btn manage-submit-btn--income">
        Add Income
      </button>
    </form>
  );
};

export default AddIncome;