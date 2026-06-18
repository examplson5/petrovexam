const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.static('public'));

const SECRET = 'your_secret_key';
const db = new sqlite3.Database('users.db');

// Создание таблицы
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// ========== МАРШРУТЫ ==========

// Регистрация
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Пользователь уже существует' });
    res.json({ message: '✅ Регистрация успешна' });
  });
});

// Вход (получение JWT)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверные данные' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Защищённый маршрут (проверка JWT)
app.get('/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Токен отсутствует' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ message: `👋 Привет, ${decoded.username}!`, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Неверный или просроченный токен' });
  }
});

// Защищённый маршрут (только для теста)
app.get('/protected', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Токен отсутствует' });

  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, SECRET);
    res.json({ message: '🔒 Доступ разрешён' });
  } catch (error) {
    res.status(401).json({ error: 'Неверный или просроченный токен' });
  }
});

app.listen(3000, () => console.log('🚀 http://localhost:3000'));