const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Подключение к БД (SQLite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Модель (ORM)
const Item = sequelize.define('Item', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

// Синхронизация БД
sequelize.sync();

// CREATE - сохранить данные
app.post('/items', async (req, res) => {
  await Item.create({ name: req.body.name, price: req.body.price });
  res.redirect('/');
});

// READ - извлечь данные
app.get('/', async (req, res) => {
  const items = await Item.findAll();
  res.render('index', { items });
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));