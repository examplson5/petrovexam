const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Данные в памяти
let tasks = [
  { id: 1, text: 'Изучить Node.js', done: false },
  { id: 2, text: 'Сделать Todo List', done: false }
];
let nextId = 3;

// Маршруты
app.get('/', (req, res) => {
  res.render('index', { tasks });
});

app.post('/add', (req, res) => {
  const text = req.body.text?.trim();
  if (text) {
    tasks.push({ id: nextId++, text, done: false });
  }
  res.redirect('/');
});

app.post('/toggle/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) task.done = !task.done;
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.redirect('/');
});

app.post('/edit/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) task.text = req.body.text?.trim() || task.text;
  res.redirect('/');
});

app.listen(3000, () => console.log('http://localhost:3000'));