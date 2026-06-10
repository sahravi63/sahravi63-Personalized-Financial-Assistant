import React, { useState } from 'react';
import api from '../../api';

const AddExpense = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/expenses', {
        description: description.trim(),
        amount: parseFloat(amount),
        category,
      });
      setDescription('');
      setAmount('');
      setCategory('General');
      onAddExpense();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      <input type="text" placeholder="Description" value={description}
        onChange={(e) => setDescription(e.target.value)} required />
      <input type="number" placeholder="Amount" value={amount} min="0.01" step="0.01"
        onChange={(e) => setAmount(e.target.value)} required />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {['General','Food','Transport','Housing','Entertainment','Healthcare','Education','Other']
          .map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Add Expense</button>
    </form>
  );
};

export default AddExpense;
