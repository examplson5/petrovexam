import React, { useState, useEffect } from 'react';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  // Загрузка данных при старте
  useEffect(() => {
    const data = [
      'Apple iPhone 15',
      'Samsung Galaxy S24',
      'Google Pixel 8',
      'Xiaomi Mi 14',
      'OnePlus 12',
      'Sony Xperia 1 V',
      'Motorola Edge 40',
      'Nothing Phone 2'
    ];
    setItems(data);
  }, []);

  // Поиск при изменении searchTerm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = items.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 300); // Задержка для оптимизации

    return () => clearTimeout(timer);
  }, [searchTerm, items]);

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Поиск</h2>
      <input
        type="text"
        placeholder="Введите запрос..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '70%', padding: 8 }}
      />
      
      <div style={{ marginTop: 20 }}>
        {loading && <div>Загрузка...</div>}
        {!loading && searchTerm.trim() && results.length === 0 && (
          <div>Ничего не найдено</div>
        )}
        {!loading && results.map((item, index) => (
          <div key={index} style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;