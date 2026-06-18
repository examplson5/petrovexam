const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// База данных
const db = new sqlite3.Database('users.db');
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Главная (защищенная)
app.get('/', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.send(`Привет, ${req.session.username}! <a href="/logout">Выйти</a>`);
});

// Регистрация
app.get('/register', (req, res) => {
  res.send(`
    <form method="post">
      <input name="username" placeholder="Логин" required>
      <input name="password" type="password" placeholder="Пароль" required>
      <button>Зарегистрироваться</button>
    </form>
    <a href="/login">Вход</a>
  `);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], (err) => {
    if (err) return res.send('Пользователь уже существует');
    res.redirect('/login');
  });
});

// Вход
app.get('/login', (req, res) => {
  res.send(`
    <form method="post">
      <input name="username" placeholder="Логин" required>
      <input name="password" type="password" placeholder="Пароль" required>
      <button>Войти</button>
    </form>
    <a href="/register">Регистрация</a>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.send('Неверные данные');
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/');
  });
});

// Выход
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(3000, () => console.log('http://localhost:3000'));