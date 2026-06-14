import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import AddExpense from './AddExpense';
import ExpenseList from './ExpenseList';
import AddIncome from './AddIncome';
import IncomeList from './IncomeList';
import './main.css';

const formatMoney = (value = 0) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MainPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchExpenses(), fetchIncomes()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const totalIncome = useMemo(
    () => incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0),
    [incomes]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0),
    [expenses]
  );
  const net = totalIncome - totalExpenses;

  return (
    <main className="manage-root">
      <header className="manage-header">
        <div>
          <h1 className="manage-title">Manage Transactions</h1>
          <p className="manage-sub">Add, edit, and review your income and expenses.</p>
        </div>
      </header>

      {error && <p className="manage-error">{error}</p>}

      {loading ? (
        <div className="manage-loading">Loading transactions...</div>
      ) : (
        <>
          <section className="manage-stats" aria-label="Transaction summary">
            <article className="manage-stat-card glass">
              <p className="manage-stat-label">Total Income</p>
              <p className="manage-stat-value manage-stat-value--income">
                {formatMoney(totalIncome)}
              </p>
            </article>
            <article className="manage-stat-card glass">
              <p className="manage-stat-label">Total Expenses</p>
              <p className="manage-stat-value manage-stat-value--expense">
                {formatMoney(totalExpenses)}
              </p>
            </article>
            <article className="manage-stat-card glass">
              <p className="manage-stat-label">Net</p>
              <p
                className={`manage-stat-value ${
                  net >= 0 ? 'manage-stat-value--net-positive' : 'manage-stat-value--net-negative'
                }`}
              >
                {formatMoney(net)}
              </p>
            </article>
          </section>

          <section className="manage-grid">
            <article className="manage-card manage-card--income glass">
              <div className="manage-card-header">
                <h2>Income</h2>
                <span className="manage-card-total">{incomes.length} entries</span>
              </div>

              <button
                type="button"
                className={`manage-toggle-btn ${
                  showAddIncome ? 'manage-toggle-btn--cancel' : 'manage-toggle-btn--income'
                }`}
                onClick={() => setShowAddIncome((value) => !value)}
              >
                <span className="manage-toggle-icon">{showAddIncome ? '×' : '+'}</span>
                {showAddIncome ? 'Cancel' : 'Add Income'}
              </button>

              {showAddIncome && (
                <AddIncome
                  onAddIncome={() => {
                    fetchIncomes();
                    setShowAddIncome(false);
                  }}
                />
              )}

              <div className="manage-list-scroll">
                <IncomeList
                  incomes={incomes}
                  onUpdateIncome={handleUpdateIncome}
                  onDeleteIncome={handleDeleteIncome}
                />
              </div>
            </article>

            <article className="manage-card manage-card--expense glass">
              <div className="manage-card-header">
                <h2>Expenses</h2>
                <span className="manage-card-total">{expenses.length} entries</span>
              </div>

              <button
                type="button"
                className={`manage-toggle-btn ${
                  showAddExpense ? 'manage-toggle-btn--cancel' : 'manage-toggle-btn--expense'
                }`}
                onClick={() => setShowAddExpense((value) => !value)}
              >
                <span className="manage-toggle-icon">{showAddExpense ? '×' : '+'}</span>
                {showAddExpense ? 'Cancel' : 'Add Expense'}
              </button>

              {showAddExpense && (
                <AddExpense
                  onAddExpense={() => {
                    fetchExpenses();
                    setShowAddExpense(false);
                  }}
                />
              )}

              <div className="manage-list-scroll">
                <ExpenseList
                  expenses={expenses}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
};

export default MainPage;