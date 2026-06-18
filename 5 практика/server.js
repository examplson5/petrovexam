const express = require('express');
const app = express();

app.use(express.static('public'));

// Данные для поиска
const data = [
    'Apple iPhone 15',
    'Samsung Galaxy S24',
    'Google Pixel 8',
    'Xiaomi Mi 14',
    'OnePlus 12',
    'Sony Xperia 1 V'
];

// API для поиска
app.get('/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const results = data.filter(item => 
        item.toLowerCase().includes(query)
    );
    res.json(results);
});

app.listen(3000, () => console.log('http://localhost:3000'));