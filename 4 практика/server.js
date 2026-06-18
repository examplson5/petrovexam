const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Подключение к БД
const db = new sqlite3.Database('database.db');

// Создание таблицы
db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Добавление тестовых данных (если таблица пуста)
db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
  if (row.count === 0) {
    db.run("INSERT INTO items (name) VALUES ('Элемент 1')");
    db.run("INSERT INTO items (name) VALUES ('Элемент 2')");
    db.run("INSERT INTO items (name) VALUES ('Элемент 3')");
  }
});

// Главная страница — отображение списка
app.get('/', (req, res) => {
  db.all("SELECT * FROM items ORDER BY id DESC", (err, rows) => {
    res.render('index', { items: rows });
  });
});

// Добавление нового элемента
app.post('/add', (req, res) => {
  const { name } = req.body;
  if (name && name.trim()) {
    db.run("INSERT INTO items (name) VALUES (?)", [name.trim()]);
  }
  res.redirect('/');
});

// Удаление элемента
app.get('/delete/:id', (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", [req.params.id]);
  res.redirect('/');
});

app.listen(3000, () => console.log('Сервер: http://localhost:3000'));