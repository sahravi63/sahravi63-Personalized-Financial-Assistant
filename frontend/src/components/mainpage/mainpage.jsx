import React, { useState, useEffect } from 'react';
import api from '../../api';
import AddExpense from './AddExpense';
import ExpenseList from './ExpenseList';
import AddIncome from './AddIncome';
import IncomeList from './IncomeList';
import './main.css';

const MainPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/api/expenses');
      setExpenses(data);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error(err.response?.data || err.message);
    }
  };

  const fetchIncomes = async () => {
    try {
      const { data } = await api.get('/api/income');
      setIncomes(data);
    } catch (err) {
      setError('Failed to fetch incomes');
      console.error(err.response?.data || err.message);
    }
  };

  const handleUpdateIncome = async (id, updatedIncome) => {
    try {
      await api.put(`/api/income/${id}`, updatedIncome);
      fetchIncomes();
    } catch (err) {
      setError('Failed to update income');
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await api.delete(`/api/income/${id}`);
      fetchIncomes();
    } catch (err) {
      setError('Failed to delete income');
    }
  };

  const handleUpdateExpense = async (id, updatedExpense) => {
    try {
      await api.put(`/api/expenses/${id}`, updatedExpense);
      fetchExpenses();
    } catch (err) {
      setError('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const totalIncome   = incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="mainPage">
      <h1>My Finances</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="totals">
        <h2>Total Income: ${totalIncome.toFixed(2)}</h2>
        <h2>Total Expenses: ${totalExpenses.toFixed(2)}</h2>
        <h2>Net: ${(totalIncome - totalExpenses).toFixed(2)}</h2>
      </div>

      <div className="income-box">
        <h2>Incomes</h2>
        <IncomeList
          incomes={incomes}
          onUpdateIncome={handleUpdateIncome}
          onDeleteIncome={handleDeleteIncome}
        />
        <button onClick={() => setShowAddIncome(!showAddIncome)}>
          {showAddIncome ? 'Cancel' : 'Add Income'}
        </button>
        {showAddIncome && <AddIncome onAddIncome={fetchIncomes} />}
      </div>

      <div className="expense-box">
        <h2>Expenses</h2>
        <ExpenseList
          expenses={expenses}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
        />
        <button onClick={() => setShowAddExpense(!showAddExpense)}>
          {showAddExpense ? 'Cancel' : 'Add Expense'}
        </button>
        {showAddExpense && <AddExpense onAddExpense={fetchExpenses} />}
      </div>
    </div>
  );
};

export default MainPage;
