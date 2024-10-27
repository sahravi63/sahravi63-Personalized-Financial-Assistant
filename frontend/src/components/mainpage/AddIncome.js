import React, { useState } from 'react';

const AddIncome = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId'); // Get userId from localStorage

    if (!userId) {
      setError('User not logged in or session expired.');
      setSuccess('');
      return;
    }

    // Basic validation
    if (!amount || !description) {
      setError('Amount and description are required.');
      setSuccess('');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/income', {
        method: 'POST',
        body: JSON.stringify({ amount, description }), // No need to send userId
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use JWT token if needed
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Income added:', result);
        setSuccess('Income added successfully!'); // Success message
        setError(''); // Clear any previous error
        setAmount(''); // Reset amount input
        setDescription(''); // Reset description input
      } else {
        setError(result.error || 'Failed to add income.');
        setSuccess(''); // Clear any previous success message
      }
    } catch (error) {
      console.error('Error adding income:', error);
      setError('An error occurred. Please try again.');
      setSuccess(''); // Clear any previous success message
    }
  };

  return (
    <div>
      <h2>Add Income</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number" // Use number type for amount input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required // HTML5 required attribute for basic validation
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          required // HTML5 required attribute for basic validation
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">Add Income</button>
      </form>
    </div>
  );
};

export default AddIncome;
