import React, { useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const add = () => {
    if (input.trim()) {
      setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
      setInput('');
    }
  };

  const toggle = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const del = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', fontFamily: 'Arial' }}>
      <h1>📋 Todo</h1>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && add()} style={{ flex: 1, padding: 8 }} />
        <button onClick={add} style={{ padding: '8px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
      </div>
      {tasks.map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderBottom: '1px solid #eee' }}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
          <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
          <button onClick={() => del(t.id)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 8px' }}>✕</button>
        </div>
      ))}
      <div style={{ marginTop: 10, color: '#666' }}>✅ {tasks.filter(t => t.done).length} / {tasks.length}</div>
    </div>
  );
}

export default App;