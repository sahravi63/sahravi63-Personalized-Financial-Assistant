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

const MOCK_TRANSACTIONS = [
  { name: 'Salary', amount: 5000, type: 'Transfer', date: '06/01/26', status: 'Success' },
  { name: 'Rent', amount: -1200, type: 'Transfer', date: '06/01/26', status: 'Success' },
  { name: 'Amazon', amount: -120, type: 'Visa', date: '06/02/26', status: 'Success' },
  { name: 'Netflix', amount: -15.99, type: 'MasterCard', date: '06/04/26', status: 'In progress' },
];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [period, setPeriod] = useState('Last 6 months');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/api/summary');
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      }
    };

    fetchSummary();
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
    const savings = summary.totalIncome - summary.totalExpenses;

    return [
      { label: 'Income', value: summary.totalIncome, change: '+8%', tone: 'up' },
      { label: 'Expense', value: summary.totalExpenses, change: '-6%', tone: 'down' },
      { label: 'Savings', value: savings, change: '+8%', tone: savings >= 0 ? 'up' : 'down' },
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
            <TransactionTable />
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

const TransactionTable = () => (
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
        {MOCK_TRANSACTIONS.map((transaction) => (
          <tr key={`${transaction.name}-${transaction.date}`}>
            <td><input type="checkbox" aria-label={`Select ${transaction.name}`} /></td>
            <td>{transaction.name}</td>
            <td className={transaction.amount > 0 ? 'txn-pos' : 'txn-neg'}>
              {transaction.amount > 0 ? '+' : '-'}
              {formatMoney(Math.abs(transaction.amount))}
            </td>
            <td>{transaction.type}</td>
            <td>{transaction.date}</td>
            <td>
              <span className={`status-chip ${transaction.status === 'Success' ? 'chip-success' : 'chip-pending'}`}>
                {transaction.status}
              </span>
            </td>
            <td>
              <button type="button" className="txn-action" aria-label={`Open ${transaction.name} actions`}>
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
