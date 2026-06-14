import React, { useState } from 'react';

const formatMoney = (value = 0) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
    return <p className="manage-empty">No expenses recorded yet.</p>;
  }

  return (
    <ul className="manage-list">
      {expenses.map((expense) => (
        <li key={expense._id} className="manage-item">
          {editingId === expense._id ? (
            <div className="manage-edit-row">
              <input
                type="text"
                className="manage-input"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="manage-input manage-input--amount"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Amount"
              />
              <div className="manage-edit-actions">
                <button type="button" className="manage-save-btn" onClick={handleUpdate}>
                  Save
                </button>
                <button type="button" className="manage-cancel-btn" onClick={cancelEditing}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="manage-item-row">
              <div className="manage-item-main">
                <span className="manage-item-desc">{expense.description}</span>
                <div className="manage-item-meta">
                  {expense.category && (
                    <span className="manage-item-category">{expense.category}</span>
                  )}
                  {expense.date && (
                    <span className="manage-item-date">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <span className="manage-item-amount manage-item-amount--expense">
                -{formatMoney(expense.amount)}
              </span>
              <div className="manage-item-actions">
                <button
                  type="button"
                  className="manage-action-btn"
                  onClick={() => startEditing(expense)}
                  aria-label={`Edit ${expense.description}`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="manage-action-btn manage-action-btn--delete"
                  onClick={() => onDeleteExpense(expense._id)}
                  aria-label={`Delete ${expense.description}`}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;