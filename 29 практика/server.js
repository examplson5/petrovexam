const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// База данных
const db = new sqlite3.Database('users.db');
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT
)`);

// Стратегия Passport
passport.use(new LocalStrategy(async (username, password, done) => {
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Неверный логин' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: 'Неверный пароль' });
    return done(null, user);
  });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => done(err, user));
});

// ========== МАРШРУТЫ ==========

// Главная (защищена)
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.send(`
    <h1>Привет, ${req.user.username}!</h1>
    <a href="/logout">Выйти</a>
  `);
});

// Регистрация
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hash],
    (err) => {
      if (err) return res.send('Пользователь уже существует');
      res.redirect('/login');
    }
  );
});

// Вход
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

// Выход
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

app.listen(3000, () => console.log('http://localhost:3000'));