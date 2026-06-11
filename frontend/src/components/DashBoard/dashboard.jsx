import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import MonthlyFinanceChart from './chart';
import NotificationsPanel from './NotificationsPanel';
import QuickTransfer from './QuickTransfer';
import RemindersPanel from './RemindersPanel';
import TasksPanel from './TasksPanel';
import './dashboard.css';

const formatMoney = (value = 0, options = {}) => {
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    ...options,
    minimumFractionDigits: Math.min(minimumFractionDigits, maximumFractionDigits),
    maximumFractionDigits,
  });
};


const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [period, setPeriod] = useState('Last 6 months');

  const monthsMap = useMemo(() => ({
    'Last 3 months': 3,
    'Last 6 months': 6,
    'Last 12 months': 12,
  }), []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get(`/api/summary?months=${monthsMap[period] || 6}`);
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      }
    };

    fetchSummary();
  }, [monthsMap, period]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [expensesRes, incomesRes] = await Promise.all([
          api.get('/api/expenses'),
          api.get('/api/income'),
        ]);

        const combined = [
          ...expensesRes.data.map((item) => ({ ...item, amount: -Math.abs(Number(item.amount) || 0), type: 'Expense' })),
          ...incomesRes.data.map((item) => ({ ...item, amount: Math.abs(Number(item.amount) || 0), type: 'Income' })),
        ]
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 8);

        setTransactions(combined);
      } catch (err) {
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, []);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    setInsights('');
    try {
      const { data } = await api.get('/api/insights');
      setInsights(data.insight);
    } catch (err) {
      setInsights('Could not load insights. Please try again later.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const stats = useMemo(() => {
    if (!summary) return [];

    const currentIncome = summary.incomeTotals?.slice(-1)[0] || 0;
    const previousIncome = summary.incomeTotals?.slice(-2, -1)[0] || 0;
    const currentExpense = summary.expenseTotals?.slice(-1)[0] || 0;
    const previousExpense = summary.expenseTotals?.slice(-2, -1)[0] || 0;
    const currentSavings = currentIncome - currentExpense;
    const previousSavings = previousIncome - previousExpense;

    const pctChange = (current, previous) => {
      if (previous === 0) return current === 0 ? '0%' : current > 0 ? '+100%' : '-100%';
      return `${current >= previous ? '+' : ''}${(((current - previous) / previous) * 100).toFixed(0)}%`;
    };

    const savings = summary.totalIncome - summary.totalExpenses;

    return [
      { label: 'Income', value: summary.totalIncome, change: pctChange(currentIncome, previousIncome), tone: currentIncome >= previousIncome ? 'up' : 'down' },
      { label: 'Expense', value: summary.totalExpenses, change: pctChange(currentExpense, previousExpense), tone: currentExpense <= previousExpense ? 'up' : 'down' },
      { label: 'Savings', value: savings, change: pctChange(currentSavings, previousSavings), tone: currentSavings >= previousSavings ? 'up' : 'down' },
    ];
  }, [summary]);

  if (error) return <p className="dash-error">{error}</p>;
  if (!summary) return <div className="dash-loading">Loading dashboard...</div>;

  const balance = Math.max(summary.netSavings, 0);
  const available = Math.max(summary.totalIncome * 0.8, 0);
  const creditLimit = Math.max(summary.totalIncome * 3.5, 5000);

  return (
    <main className="dash-root">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Empower your finances with simplified insights.</p>
        </div>

        <div className="dash-header-right">
          <label className="dash-search glass">
            <span>Search</span>
            <input aria-label="Search transactions" placeholder="Find activity" />
          </label>
          <button
            type="button"
            className="dash-notif-btn glass"
            onClick={() => setShowNotifications((value) => !value)}
            aria-label="Toggle notifications"
          >
            N
            <span className="notif-dot" />
          </button>
        </div>
      </header>

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      <section className="dash-stats" aria-label="Financial summary">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card glass">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{formatMoney(stat.value)}</p>
            <p className={`stat-change stat-change--${stat.tone}`}>
              {stat.change} from last month
            </p>
          </article>
        ))}
      </section>

      <section className="dash-grid">
        <div className="dash-col-main">
          <article className="dash-card glass">
            <div className="dash-card-header">
              <h2>My Balance Analytics</h2>
              <select
                className="period-select glass"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <MonthlyFinanceChart
              labels={summary.labels}
              incomeTotals={summary.incomeTotals}
              expenseTotals={summary.expenseTotals}
              type="line"
            />
          </article>

          <article className="dash-card glass">
            <div className="dash-card-header">
              <h2>Money Flow</h2>
              <select className="period-select glass" defaultValue="Last 6 months">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
              </select>
            </div>
            <MonthlyFinanceChart
              labels={summary.labels}
              incomeTotals={summary.incomeTotals}
              expenseTotals={summary.expenseTotals}
              type="bar"
            />
          </article>

          <article className="dash-card glass">
            <div className="dash-card-header">
              <h2>Transaction History</h2>
              <select className="period-select glass" defaultValue="All transactions">
                <option>All transactions</option>
                <option>Income</option>
                <option>Expenses</option>
              </select>
            </div>
            <TransactionTable transactions={transactions} />
          </article>

          <article className="dash-card glass insights-card">
            <h2>AI Financial Insights</h2>
            {insights ? (
              <div className="insights-body">
                {insights.split('\n').map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="insights-btn"
                onClick={fetchInsights}
                disabled={loadingInsights}
              >
                {loadingInsights ? 'Generating...' : 'Get Personalised Advice'}
              </button>
            )}
          </article>
        </div>

        <aside className="dash-col-side" aria-label="Financial tools">
          <section className="balance-card glass">
            <div className="balance-card-top">
              <div className="bc-chip">FS</div>
              <div className="bc-payments">
                <span>Pay</span>
                <span>G Pay</span>
              </div>
            </div>
            <p className="bc-number">4556 5642 0695 5168</p>
            <p className="bc-name">Fin Scope Account</p>
            <p className="bc-brand">VISA</p>

            <div className="balance-info">
              <div>
                <p className="bi-label">My Balance</p>
                <p className="bi-value">{formatMoney(balance)}</p>
              </div>
              <div className="bi-right">
                <p>Available: <strong>{formatMoney(available, { maximumFractionDigits: 0 })}</strong></p>
                <p>Credit limit: <strong>{formatMoney(creditLimit, { maximumFractionDigits: 0 })}</strong></p>
              </div>
            </div>
          </section>

          <QuickTransfer />
          <RemindersPanel />
          <TasksPanel />
        </aside>
      </section>
    </main>
  );
};

const TransactionTable = ({ transactions = [] }) => (
  <div className="txn-table-wrap">
    <table className="txn-table">
      <thead>
        <tr>
          <th><span className="sr-only">Select</span></th>
          <th>Name</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.length === 0 ? (
          <tr>
            <td colSpan="7" className="dash-empty">No recent transactions found.</td>
          </tr>
        ) : transactions.map((transaction) => (
          <tr key={`${transaction.type}-${transaction._id || transaction.description}-${transaction.date}`}>
            <td><input type="checkbox" aria-label={`Select ${transaction.description}`} /></td>
            <td>{transaction.description}</td>
            <td className={transaction.amount > 0 ? 'txn-pos' : 'txn-neg'}>
              {transaction.amount > 0 ? '+' : '-'}
              {formatMoney(Math.abs(transaction.amount))}
            </td>
            <td>{transaction.type}</td>
            <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '—'}</td>
            <td>
              <span className="status-chip chip-success">Success</span>
            </td>
            <td>
              <button type="button" className="txn-action" aria-label={`Open ${transaction.description} actions`}>
                ...
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Dashboard;
