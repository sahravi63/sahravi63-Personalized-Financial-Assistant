import React, { useState } from 'react';

const formatMoney = (value = 0) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
    const description = editDescription.trim();
    const amount = Number(editAmount);

    if (!description) {
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    onUpdateIncome(editingId, { description, amount });
    cancelEditing();
  };

  if (incomes.length === 0) {
    return <p className="manage-empty">No income recorded yet.</p>;
  }

  return (
    <ul className="manage-list">
      {incomes.map((income) => (
        <li key={income._id} className="manage-item">
          {editingId === income._id ? (
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
                <span className="manage-item-desc">{income.description}</span>
                <div className="manage-item-meta">
                  {income.category && (
                    <span className="manage-item-category">{income.category}</span>
                  )}
                  {income.date && (
                    <span className="manage-item-date">
                      {new Date(income.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <span className="manage-item-amount manage-item-amount--income">
                +{formatMoney(income.amount)}
              </span>
              <div className="manage-item-actions">
                <button
                  type="button"
                  className="manage-action-btn"
                  onClick={() => startEditing(income)}
                  aria-label={`Edit ${income.description}`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="manage-action-btn manage-action-btn--delete"
                  onClick={() => onDeleteIncome(income._id)}
                  aria-label={`Delete ${income.description}`}
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

export default IncomeList;