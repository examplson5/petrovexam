const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const products = [
    { id: 1, name: 'iPhone 15' },
    { id: 2, name: 'Samsung S24' }
];

let reviews = [
    { id: 1, productId: 1, author: 'Алексей', text: 'Отлично!', rating: 5, date: '2026-06-18' }
];

app.get('/', (req, res) => res.render('index', { products }));

app.get('/product/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    const productReviews = reviews.filter(r => r.productId == product.id);
    const avg = productReviews.length ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1) : 0;
    res.render('product', { product, reviews: productReviews, avg });
});

app.post('/product/:id/review', (req, res) => {
    const { author, text, rating } = req.body;
    reviews.push({ id: Date.now(), productId: parseInt(req.params.id), author, text, rating: parseInt(rating), date: new Date().toISOString().split('T')[0] });
    res.redirect(`/product/${req.params.id}`);
});

app.get('/review/delete/:id', (req, res) => {
    const review = reviews.find(r => r.id == req.params.id);
    reviews = reviews.filter(r => r.id != req.params.id);
    res.redirect(`/product/${review.productId}`);
});

app.listen(3000, () => console.log('http://localhost:3000'));