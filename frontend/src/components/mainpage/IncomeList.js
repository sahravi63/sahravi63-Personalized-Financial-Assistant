import React, { useState } from 'react';

const IncomeList = ({ incomes = [], onUpdateIncome, onDeleteIncome }) => {
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const startEditing = (income) => {
    setEditingId(income._id);
    setEditDescription(income.description || '');
    setEditAmount(income.amount || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription('');
    setEditAmount('');
  };

  const handleUpdate = () => {
    onUpdateIncome(editingId, {
      description: editDescription.trim(),
      amount: Number(editAmount),
    });
    cancelEditing();
  };

  if (incomes.length === 0) {
    return <p>No incomes found.</p>;
  }

  return (
    <ul className="transaction-list">
      {incomes.map((income) => (
        <li key={income._id} className="transaction-item">
          {editingId === income._id ? (
            <div className="transaction-edit">
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Amount"
              />
              <button type="button" onClick={handleUpdate}>Save</button>
              <button type="button" onClick={cancelEditing}>Cancel</button>
            </div>
          ) : (
            <div className="transaction-row">
              <span>
                {income.description}: ${Number(income.amount).toFixed(2)}
                {income.date && ` on ${new Date(income.date).toLocaleDateString()}`}
              </span>
              <div className="transaction-actions">
                <button type="button" onClick={() => startEditing(income)}>Edit</button>
                <button type="button" onClick={() => onDeleteIncome(income._id)}>Delete</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default IncomeList;
