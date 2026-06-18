const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Товары
const products = [
    { id: 1, name: 'iPhone 15', price: 99990, category: 'Смартфоны', rating: 4.8 },
    { id: 2, name: 'Samsung Galaxy S24', price: 89990, category: 'Смартфоны', rating: 4.7 },
    { id: 3, name: 'Google Pixel 8', price: 79990, category: 'Смартфоны', rating: 4.6 },
    { id: 4, name: 'MacBook Pro 14', price: 199990, category: 'Ноутбуки', rating: 4.9 },
    { id: 5, name: 'Dell XPS 13', price: 149990, category: 'Ноутбуки', rating: 4.5 },
    { id: 6, name: 'Sony WH-1000XM5', price: 34990, category: 'Наушники', rating: 4.8 },
    { id: 7, name: 'AirPods Pro 2', price: 24990, category: 'Наушники', rating: 4.7 },
    { id: 8, name: 'iPad Air', price: 59990, category: 'Планшеты', rating: 4.6 }
];

// Категории
const categories = [...new Set(products.map(p => p.category))];

// Главная - список с фильтром
app.get('/', (req, res) => {
    const category = req.query.category || '';
    const search = req.query.search || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
    const sort = req.query.sort || 'name';
    
    let filtered = products.filter(p => {
        const matchCategory = category ? p.category === category : true;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchPrice = p.price >= minPrice && p.price <= maxPrice;
        return matchCategory && matchSearch && matchPrice;
    });
    
    // Сортировка
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    res.render('index', { products: filtered, categories, category, search, minPrice, maxPrice, sort });
});

app.listen(3000, () => console.log('http://localhost:3000'));