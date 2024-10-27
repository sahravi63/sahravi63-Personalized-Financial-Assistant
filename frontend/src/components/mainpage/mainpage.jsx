import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User is not authenticated');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(response.data);
    } catch (error) {
      alert('Failed to fetch expenses');
      console.error(error.response?.data || error.message);
    }
  };

  const fetchIncomes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User is not authenticated');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/income', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIncomes(response.data);
    } catch (error) {
      alert('Failed to fetch incomes');
      console.error(error.response?.data || error.message);
    }
  };

  const handleAddExpense = () => {
    fetchExpenses(); // Refresh expenses after adding
  };

  const handleAddIncome = () => {
    fetchIncomes(); // Refresh incomes after adding
  };

  const handleUpdateIncome = async (id, updatedIncome) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/income/${id}`, updatedIncome, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchIncomes(); // Refresh incomes after update
    } catch (error) {
      alert('Failed to update income');
      console.error(error.response?.data || error.message);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/income/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchIncomes(); // Refresh incomes after deletion
    } catch (error) {
      alert('Failed to delete income');
      console.error(error.response?.data || error.message);
    }
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((acc, income) => acc + income.amount, 0);
  };

  const calculateTotalExpense = () => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  };

  return (
    <div className="mainPage">
      <h1>Main Page</h1>
      
      <div className="totals">
        <h2>Total Income: ${calculateTotalIncome()}</h2>
        <h2>Total Expenses: ${calculateTotalExpense()}</h2>
      </div>

      {/* Income Box */}
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
        {showAddIncome && <AddIncome onAddIncome={handleAddIncome} />}
      </div>

      {/* Expense Box */}
      <div className="expense-box">
        <h2>Expenses</h2>
        <ExpenseList expenses={expenses} onDelete={fetchExpenses} />
        <button onClick={() => setShowAddExpense(!showAddExpense)}>
          {showAddExpense ? 'Cancel' : 'Add Expense'}
        </button>
        {showAddExpense && <AddExpense onAddExpense={handleAddExpense} />}
      </div>
    </div>
  );
};

export default MainPage;
