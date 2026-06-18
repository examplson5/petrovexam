const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

let transactions = [
  { id: 1, type: 'income', amount: 50000, category: 'Зарплата', date: '2026-06-18', desc: 'Зарплата' },
  { id: 2, type: 'expense', amount: 3000, category: 'Еда', date: '2026-06-17', desc: 'Продукты' },
  { id: 3, type: 'expense', amount: 1500, category: 'Транспорт', date: '2026-06-16', desc: 'Такси' }
];
let nextId = 4;

app.get('/', (req, res) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const categories = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  let rows = '';
  const sorted = transactions.slice().reverse();
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const typeLabel = t.type === 'income' ? 'Доход' : 'Расход';
    const color = t.type === 'income' ? '#28a745' : '#dc3545';
    rows += `
      <tr>
        <td>${t.date}</td>
        <td><span style="padding:3px 10px;border-radius:12px;font-size:12px;background:${t.type === 'income' ? '#d4edda' : '#f8d7da'};color:${t.type === 'income' ? '#155724' : '#721c24'}">${typeLabel}</span></td>
        <td>${t.category}</td>
        <td>${t.desc || '-'}</td>
        <td style="color:${color}">${t.amount}</td>
        <td>
          <form method="POST" action="/delete/${t.id}" style="display:inline;">
            <button style="background:#dc3545;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;" onclick="return confirm('Удалить?')">✕</button>
          </form>
        </td>
      </tr>
    `;
  }

  let catHtml = '';
  const catKeys = Object.keys(categories);
  for (let i = 0; i < catKeys.length; i++) {
    const cat = catKeys[i];
    catHtml += `
      <div style="background:white;padding:10px 15px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:inline-block;">
        <span style="font-weight:bold;">${cat}:</span>
        <span style="color:#dc3545;">${categories[cat]}</span>
      </div>
    `;
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Финансы</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial; max-width: 900px; margin: 30px auto; padding: 20px; background: #f5f5f5; }
      h1 { text-align: center; margin-bottom: 20px; }
      .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
      .stat { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .stat .num { font-size: 24px; font-weight: bold; }
      .income { color: #28a745; }
      .expense { color: #dc3545; }
      .balance { color: #007bff; }
      .form { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: end; }
      .form label { font-size: 14px; display: block; margin-bottom: 3px; }
      .form input, .form select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      .form button { padding: 8px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
      table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
      th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
      th { background: #f8f9fa; }
      .categories { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
    </style>
  </head>
  <body>
    <h1>💰 Финансы</h1>

    <div class="stats">
      <div class="stat"><div>💰 Баланс</div><div class="num balance">${balance} ₽</div></div>
      <div class="stat"><div>📈 Доходы</div><div class="num income">${totalIncome} ₽</div></div>
      <div class="stat"><div>📉 Расходы</div><div class="num expense">${totalExpense} ₽</div></div>
    </div>

    <div class="categories">${catHtml}</div>

    <form class="form" method="POST" action="/add">
      <div>
        <label>Тип</label>
        <select name="type">
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>
      </div>
      <div>
        <label>Сумма</label>
        <input name="amount" type="number" required>
      </div>
      <div>
        <label>Категория</label>
        <input name="category" placeholder="Зарплата, Еда..." required>
      </div>
      <div>
        <label>Дата</label>
        <input name="date" type="date" required>
      </div>
      <div>
        <label>Описание</label>
        <input name="desc" placeholder="Описание">
      </div>
      <button type="submit">➕ Добавить</button>
    </form>

    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Тип</th>
          <th>Категория</th>
          <th>Описание</th>
          <th>Сумма</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
  </html>
  `;

  res.send(html);
});

app.post('/add', (req, res) => {
  const { type, amount, category, date, desc } = req.body;
  transactions.push({
    id: nextId++,
    type,
    amount: Number(amount),
    category,
    date,
    desc: desc || ''
  });
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  transactions = transactions.filter(t => t.id != req.params.id);
  res.redirect('/');
});

app.listen(3000, () => console.log('http://localhost:3000'));