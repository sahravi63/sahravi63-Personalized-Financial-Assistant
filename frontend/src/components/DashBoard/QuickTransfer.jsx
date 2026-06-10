import React, { useState } from 'react';

const CONTACTS = [
  { name: 'Dwight', initials: 'DW' },
  { name: 'Cody', initials: 'CO' },
  { name: 'Brandon', initials: 'BR' },
  { name: 'Floyd', initials: 'FL' },
  { name: 'Devon', initials: 'DV' },
];

const QuickTransfer = () => {
  const [selected, setSelected] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selected || !amount) return;
    setSent(true);
    window.setTimeout(() => {
      setSent(false);
      setAmount('');
      setNote('');
      setSelected('');
    }, 1800);
  };

  return (
    <section className="side-card glass">
      <h3 className="side-card-title">Quick Transaction</h3>
      <div className="qt-contacts">
        {CONTACTS.map((contact) => (
          <button
            type="button"
            key={contact.name}
            className={`qt-contact ${selected === contact.name ? 'qt-contact--selected' : ''}`}
            onClick={() => setSelected(contact.name)}
          >
            <span className="qt-avatar">{contact.initials}</span>
            <span>{contact.name}</span>
          </button>
        ))}
      </div>

      <input
        className="qt-input glass"
        placeholder="Enter amount"
        type="number"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />
      <textarea
        className="qt-input qt-textarea glass"
        placeholder="Add note"
        rows={2}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <button
        type="button"
        className="qt-send-btn"
        onClick={handleSend}
        disabled={!selected || !amount}
      >
        {sent ? 'Sent' : 'Send Money'}
      </button>
    </section>
  );
};

export default QuickTransfer;
