import React, { useMemo, useState } from 'react';

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

export default function Calculators() {
  const [sip, setSip] = useState({ monthly: 5000, rate: 12, years: 10 });
  const [emi, setEmi] = useState({ principal: 500000, rate: 9, years: 5 });
  const [retirement, setRetirement] = useState({ monthly: 10000, rate: 8, years: 25 });

  const sipResult = useMemo(() => {
    const r = sip.rate / 12 / 100;
    const n = sip.years * 12;
    const future = sip.monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return { future, monthly: sip.monthly * n };
  }, [sip]);

  const emiResult = useMemo(() => {
    const r = emi.rate / 12 / 100;
    const n = emi.years * 12;
    const payment = r === 0 ? emi.principal / n : (emi.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { payment, total: payment * n, interest: payment * n - emi.principal };
  }, [emi]);

  const retirementResult = useMemo(() => {
    const r = retirement.rate / 12 / 100;
    const n = retirement.years * 12;
    const future = retirement.monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return { future };
  }, [retirement]);

  return (
    <div style={{ width: '100%', padding: 'clamp(14px, 3vw, 24px)', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
      <h2>Financial Calculators</h2>
      <p style={{ color: '#cbd5e1' }}>Fast formulas for planning, borrowing, and retirement.</p>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        <Card title="SIP Calculator" body={<>
          <Input label="Monthly investment" value={sip.monthly} onChange={(e) => setSip({ ...sip, monthly: Number(e.target.value) })} />
          <Input label="Expected annual return (%)" value={sip.rate} onChange={(e) => setSip({ ...sip, rate: Number(e.target.value) })} />
          <Input label="Years" value={sip.years} onChange={(e) => setSip({ ...sip, years: Number(e.target.value) })} />
          <Result label="Future value" value={money(sipResult.future)} />
          <Result label="Total invested" value={money(sipResult.monthly)} />
        </>} />
        <Card title="EMI Calculator" body={<>
          <Input label="Loan amount" value={emi.principal} onChange={(e) => setEmi({ ...emi, principal: Number(e.target.value) })} />
          <Input label="Annual rate (%)" value={emi.rate} onChange={(e) => setEmi({ ...emi, rate: Number(e.target.value) })} />
          <Input label="Years" value={emi.years} onChange={(e) => setEmi({ ...emi, years: Number(e.target.value) })} />
          <Result label="Monthly EMI" value={money(emiResult.payment)} />
          <Result label="Total payable" value={money(emiResult.total)} />
          <Result label="Total interest" value={money(emiResult.interest)} />
        </>} />
        <Card title="Retirement Planner" body={<>
          <Input label="Monthly contribution" value={retirement.monthly} onChange={(e) => setRetirement({ ...retirement, monthly: Number(e.target.value) })} />
          <Input label="Expected annual return (%)" value={retirement.rate} onChange={(e) => setRetirement({ ...retirement, rate: Number(e.target.value) })} />
          <Input label="Years" value={retirement.years} onChange={(e) => setRetirement({ ...retirement, years: Number(e.target.value) })} />
          <Result label="Projected corpus" value={money(retirementResult.future)} />
        </>} />
      </div>
    </div>
  );
}

function Card({ title, body }) {
  return <article style={cardStyle}><h3 style={{ marginTop: 0 }}>{title}</h3>{body}</article>;
}
function Input({ label, value, onChange }) { return <label style={{ display: 'grid', gap: 4, marginBottom: 8 }}><span style={{ color: '#bfdbfe', fontSize: 13 }}>{label}</span><input value={value} onChange={onChange} style={inputStyle} type="number" /></label>; }
function Result({ label, value }) { return <div style={resultStyle}><strong>{label}</strong><span>{value}</span></div>; }

const cardStyle = { minWidth: 0, background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #334155', borderRadius: 8, padding: 18 };
const inputStyle = { width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', padding: '10px 12px' };
const resultStyle = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: '1px solid #334155', color: '#e5eefb', flexWrap: 'wrap' };
