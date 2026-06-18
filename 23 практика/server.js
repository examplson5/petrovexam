const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const db = new sqlite3.Database('greetings.db');

db.run(`
  CREATE TABLE IF NOT EXISTS greetings (
    id INTEGER PRIMARY KEY,
    text TEXT DEFAULT 'Привет, УКИТ!'
  )
`);

// Добавить запись при первом запуске
db.get("SELECT COUNT(*) as count FROM greetings", (err, row) => {
  if (row.count === 0) {
    db.run("INSERT INTO greetings (text) VALUES ('Привет, УКИТ!')");
  }
});

app.get('/', (req, res) => {
  db.get("SELECT text FROM greetings LIMIT 1", (err, row) => {
    res.render('index', { text: row.text });
  });
});

app.post('/', (req, res) => {
  const newText = req.body.text.trim();
  if (newText) {
    db.run("UPDATE greetings SET text = ?", [newText]);
  }
  res.redirect('/');
});

app.listen(3000, () => console.log('http://localhost:3000'));