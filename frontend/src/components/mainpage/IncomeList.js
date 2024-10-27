import React, { useState } from 'react';

const IncomeList = ({ incomes, onUpdateIncome, onDeleteIncome }) => {
  const [incomeToEdit, setIncomeToEdit] = useState(null);
  const [newAmount, setNewAmount] = useState('');

  const handleEditClick = (income) => {
    setIncomeToEdit(income);
    setNewAmount(income.amount); // Pre-fill the amount for editing
  };

  const handleUpdate = () => {
    if (incomeToEdit) {
      onUpdateIncome(incomeToEdit._id, { ...incomeToEdit, amount: newAmount });
      setIncomeToEdit(null);
      setNewAmount('');
    }
  };
  

  return (
    <div>
      <ul>
        {incomes.map((income) => (
          <li key={income._id}>
            {income.description}: ${income.amount} on {new Date(income.date).toLocaleDateString()}
            <button onClick={() => handleEditClick(income)}>Edit</button>
            <button onClick={() => onDeleteIncome(income._id)}>Delete</button>
          </li>
        ))}
      </ul>
      {incomeToEdit && (
        <div>
          <h4>Editing Income</h4>
          <input 
            type="number" 
            value={newAmount} 
            onChange={(e) => setNewAmount(e.target.value)} 
          />
          <button onClick={handleUpdate}>Update</button>
          <button onClick={() => setIncomeToEdit(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default IncomeList;
