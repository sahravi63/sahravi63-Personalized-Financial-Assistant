import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import './activity.css';

const PAYMENT_MODES = ['UPI', 'ATM Card', 'Credit Card'];
const UPI_OPTIONS = ['GPay', 'Google Pay', 'PhonePe', 'Paytm'];

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const Activity = () => {
  const [type, setType] = useState('expense');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [provider, setProvider] = useState('GPay');
  const [upiId, setUpiId] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const [expensesRes, incomesRes] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/income'),
      ]);
      setExpenses(expensesRes.data || []);
      setIncomes(incomesRes.data || []);
    } catch (err) {
      setError('Failed to load activity data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const summary = useMemo(() => {
    const dailyExpenseTotals = expenses.reduce((acc, item) => {
      const key = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown';
      acc[key] = (acc[key] || 0) + Number(item.amount || 0);
      return acc;
    }, {});

    const dailyIncomeTotals = incomes.reduce((acc, item) => {
      const key = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown';
      acc[key] = (acc[key] || 0) + Number(item.amount || 0);
      return acc;
    }, {});

    return { dailyExpenseTotals, dailyIncomeTotals };
  }, [expenses, incomes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        description: description.trim() || `${paymentMode} ${provider} payment`,
        amount: Number(amount),
        category: `${paymentMode} • ${provider}`,
        paymentMethod: paymentMode,
        paymentProvider: provider,
        upiId: paymentMode === 'UPI' ? upiId.trim() : '',
        cardHolder: paymentMode !== 'UPI' ? cardHolder.trim() : '',
        cardLast4: paymentMode !== 'UPI' ? cardLast4.trim() : '',
        date,
      };

      if (type === 'expense') {
        await api.post('/api/expenses', payload);
        setSuccess('Expense added successfully to your activity log.');
      } else {
        await api.post('/api/income', payload);
        setSuccess('Income added successfully to your activity log.');
      }

      setAmount('');
      setDescription('');
      setDate('');
      setUpiId('');
      setCardHolder('');
      setCardLast4('');
      await fetchActivity();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to add this activity.');
    }
  };

  return (
    <section className="activity-page">
      <header className="activity-header">
        <div>
          <p className="activity-eyebrow">Activity Hub</p>
          <h1>Track UPI, ATM, and credit card transactions</h1>
          <p className="activity-subtitle">Add every transaction here and keep daily expenses and income organised.</p>
        </div>
      </header>

      <div className="activity-grid">
        <article className="activity-card glass">
          <h2>Add Activity</h2>
          <form onSubmit={handleSubmit} className="activity-form">
            <label>
              Type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label>
              Payment mode
              <select value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value); setProvider(e.target.value === 'UPI' ? 'GPay' : 'Visa'); }}>
                {PAYMENT_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
              </select>
            </label>

            <label>
              Provider / Card
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                {paymentMode === 'UPI' ? UPI_OPTIONS : ['Visa', 'MasterCard', 'SBI Card', 'HDFC Card'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label>
              Amount
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>

            <label>
              Description
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Grocery payment" />
            </label>

            {paymentMode === 'UPI' ? (
              <label>
                UPI ID
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okhdfcbank" />
              </label>
            ) : (
              <>
                <label>
                  Card Holder
                  <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="John Doe" />
                </label>
                <label>
                  Last 4 Digits
                  <input type="text" inputMode="numeric" maxLength="4" value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))} placeholder="4321" />
                </label>
              </>
            )}

            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <button type="submit" className="activity-btn">Add to {type === 'expense' ? 'Expenses' : 'Income'}</button>
            {error && <p className="activity-error">{error}</p>}
            {success && <p className="activity-success">{success}</p>}
          </form>
        </article>

        <article className="activity-card glass">
          <h2>Daily Totals</h2>
          <div className="summary-list">
            {Object.entries(summary.dailyExpenseTotals).length === 0 && Object.entries(summary.dailyIncomeTotals).length === 0 ? (
              <p className="activity-empty">No activity yet. Add a payment or income above.</p>
            ) : (
              <>
                {Object.entries(summary.dailyExpenseTotals).map(([day, value]) => (
                  <div key={`expense-${day}`} className="summary-row">
                    <strong>{day}</strong>
                    <span className="expense-total">Expenses: {formatMoney(value)}</span>
                  </div>
                ))}
                {Object.entries(summary.dailyIncomeTotals).map(([day, value]) => (
                  <div key={`income-${day}`} className="summary-row">
                    <strong>{day}</strong>
                    <span className="income-total">Income: {formatMoney(value)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </article>
      </div>

      <div className="activity-grid activity-grid--two">
        <article className="activity-card glass">
          <h2>Recent Expenses</h2>
          {loading ? <p>Loading…</p> : expenses.length === 0 ? <p className="activity-empty">No expenses added yet.</p> : (
            <ul className="activity-list">
              {expenses.map((item) => (
                <li key={item._id} className="activity-item">
                  <div>
                    <strong>{item.description}</strong>
                    <p>{item.category || 'General'} • {formatDate(item.date)}</p>
                  </div>
                  <span className="expense-badge">-{formatMoney(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="activity-card glass">
          <h2>Recent Income</h2>
          {loading ? <p>Loading…</p> : incomes.length === 0 ? <p className="activity-empty">No income records added yet.</p> : (
            <ul className="activity-list">
              {incomes.map((item) => (
                <li key={item._id} className="activity-item">
                  <div>
                    <strong>{item.description}</strong>
                    <p>{item.category || 'General'} • {formatDate(item.date)}</p>
                  </div>
                  <span className="income-badge">+{formatMoney(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
};

export default Activity;
