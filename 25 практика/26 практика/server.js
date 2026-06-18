const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Настройка транспорта (для Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ваш_email@gmail.com',    // Замени на свой
        pass: 'ваш_пароль_приложения'   // Пароль приложения, не обычный!
    }
});

// ========== МАРШРУТЫ ==========

// Форма для отправки
app.get('/', (req, res) => {
    res.render('index');
});

// API: отправка письма
app.post('/send', async (req, res) => {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    try {
        const info = await transporter.sendMail({
            from: 'ваш_email@gmail.com',
            to: to,
            subject: subject,
            text: message,
            html: `<h3>${subject}</h3><p>${message}</p>`
        });
        
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка отправки: ' + error.message });
    }
});

app.listen(3000, () => console.log('🚀 Сервер: http://localhost:3000'));