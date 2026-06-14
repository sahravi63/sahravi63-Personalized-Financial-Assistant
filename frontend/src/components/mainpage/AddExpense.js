import React, { useState } from 'react';
import api from '../../api';

const AddExpense = ({ onAddExpense }) => {
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
      await api.post('/api/expenses', {
        description: description.trim(),
        amount: parseFloat(amount),
        category,
      });
      setDescription('');
      setAmount('');
      setCategory('General');
      setSuccess('Expense added successfully!');
      if (onAddExpense) onAddExpense();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  };

  return (
    <form className="manage-form" onSubmit={handleSubmit}>
      <h3>New Expense</h3>
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
        {['General', 'Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Education', 'Other'].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {error && <p className="manage-form-error">{error}</p>}
      {success && <p className="manage-form-success">{success}</p>}
      <button type="submit" className="manage-submit-btn manage-submit-btn--expense">
        Add Expense
      </button>
    </form>
  );
};

export default AddExpense;