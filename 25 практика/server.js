const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

let analysisData = [];

// Главная
app.get('/', (req, res) => {
  res.render('index', { data: analysisData, stats: getStats(analysisData) });
});

// Загрузка CSV
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.redirect('/');
  
  const content = fs.readFileSync(req.file.path, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  analysisData = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, h, i) => {
      obj[h] = isNaN(values[i]) ? values[i] : Number(values[i]);
      return obj;
    }, {});
  });
  
  fs.unlinkSync(req.file.path);
  res.redirect('/');
});

// Статистика
function getStats(data) {
  if (data.length === 0) return null;
  
  const keys = Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
  const stats = {};
  
  keys.forEach(key => {
    const values = data.map(d => d[key]).filter(v => !isNaN(v));
    if (values.length === 0) return;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];
    
    stats[key] = { min, max, avg, median, count: values.length };
  });
  
  return stats;
}

app.listen(3000, () => console.log('http://localhost:3000'));