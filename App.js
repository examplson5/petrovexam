import React, { useState } from 'react';

function App() {
  const [color, setColor] = useState('black');

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h1 style={{ color: color }}>Привет, мир!</h1>
      <button 
        onClick={() => setColor(color === 'black' ? 'red' : 'black')}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Сменить цвет
      </button>
    </div>
  );
}

export default App;