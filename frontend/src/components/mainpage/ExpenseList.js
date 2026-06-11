import React, { useState } from 'react';

const ExpenseList = ({ expenses = [], onUpdateExpense, onDeleteExpense }) => {
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const startEditing = (expense) => {
    setEditingId(expense._id);
    setEditDescription(expense.description || '');
    setEditAmount(expense.amount || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription('');
    setEditAmount('');
  };

  const handleUpdate = () => {
    const description = editDescription.trim();
    const amount = Number(editAmount);

    if (!description) {
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    onUpdateExpense(editingId, { description, amount });
    cancelEditing();
  };

  if (expenses.length === 0) {
    return <p>No expenses found.</p>;
  }

  return (
    <ul className="transaction-list">
      {expenses.map((expense) => (
        <li key={expense._id} className="transaction-item">
          {editingId === expense._id ? (
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
                {expense.description}: ${Number(expense.amount).toFixed(2)}
                {expense.date && ` on ${new Date(expense.date).toLocaleDateString()}`}
              </span>
              <div className="transaction-actions">
                <button type="button" onClick={() => startEditing(expense)}>Edit</button>
                <button type="button" onClick={() => onDeleteExpense(expense._id)}>Delete</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;
