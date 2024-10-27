import React, { useState } from 'react';
import axios from 'axios';

const AddExpense = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User is not authenticated');
        return;
      }

      const expenseData = {
        description: description.trim(),
        amount: parseFloat(amount),
      };

      const response = await axios.post('http://localhost:5000/api/expenses', expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setDescription('');
        setAmount('');
        alert('Expense added successfully!');
        onAddExpense(); // Notify parent component to refresh expenses
      }
    } catch (error) {
      alert('Failed to add expense');
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Add Expense</button>
    </form>
  );
};

export default AddExpense;
