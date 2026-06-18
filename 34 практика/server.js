const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let events = [], id = 1;

app.get('/', (req, res) => res.render('index', { events }));

app.get('/new', (req, res) => res.render('form', { e: null }));

app.post('/new', (req, res) => {
  const { title, date, time, location, guests, desc } = req.body;
  events.push({ id: id++, title, date, time, location, desc, guests: guests ? guests.split(',').map(g => g.trim()) : [] });
  res.redirect('/');
});

app.get('/:id', (req, res) => {
  const e = events.find(ev => ev.id == req.params.id);
  e ? res.render('detail', { e }) : res.redirect('/');
});

app.get('/:id/edit', (req, res) => {
  const e = events.find(ev => ev.id == req.params.id);
  e ? res.render('form', { e }) : res.redirect('/');
});

app.post('/:id/edit', (req, res) => {
  const e = events.find(ev => ev.id == req.params.id);
  if (e) { const { title, date, time, location, guests, desc } = req.body;
    Object.assign(e, { title, date, time, location, desc, guests: guests ? guests.split(',').map(g => g.trim()) : [] }); }
  res.redirect('/');
});

app.post('/:id/delete', (req, res) => {
  events = events.filter(e => e.id != req.params.id);
  res.redirect('/');
});

app.post('/:id/guest', (req, res) => {
  const e = events.find(ev => ev.id == req.params.id);
  if (e && req.body.guest?.trim()) e.guests.push(req.body.guest.trim());
  res.redirect('/' + req.params.id);
});

app.post('/:id/guest/:guest/delete', (req, res) => {
  const e = events.find(ev => ev.id == req.params.id);
  if (e) e.guests = e.guests.filter(g => g !== req.params.guest);
  res.redirect('/' + req.params.id);
});

app.listen(3000);