const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Создать папку uploads
const fs = require('fs');
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Эндпоинт для загрузки
app.post('/upload', upload.single('photo'), (req, res) => {
  res.json({ message: 'Фото загружено', file: req.file.filename });
});

// Просмотр загруженных фото
app.use('/files', express.static('./uploads'));

app.listen(3000, () => console.log('Сервер на http://localhost:3000'));