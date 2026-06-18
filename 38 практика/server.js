const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Данные пользователя
let user = {
  name: 'Алексей',
  age: 25,
  weight: 75,
  height: 180,
  calories: 0,
  steps: 0,
  water: 0,
  workouts: []
};

// Тренировки
const workouts = [
  { id: 1, name: '🏃 Бег', calories: 300, duration: '30 мин' },
  { id: 2, name: '🏋️ Силовая', calories: 250, duration: '40 мин' },
  { id: 3, name: '🧘 Йога', calories: 150, duration: '30 мин' },
  { id: 4, name: '🚴 Велосипед', calories: 400, duration: '45 мин' },
  { id: 5, name: '🏊 Плавание', calories: 350, duration: '30 мин' }
];

// Советы по питанию
const tips = [
  '🥗 Ешьте больше овощей и фруктов',
  '💧 Пейте 2-3 литра воды в день',
  '🍗 Употребляйте достаточно белка',
  '🌾 Замените белый хлеб на цельнозерновой',
  '🥑 Добавьте полезные жиры (орехи, авокадо)',
  '🍽️ Ешьте небольшими порциями 5 раз в день'
];

app.get('/', (req, res) => {
  const bmi = (user.weight / ((user.height/100) ** 2)).toFixed(1);
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>ЗОЖ Приложение</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial; max-width: 1000px; margin: 30px auto; padding: 20px; background: #f0f8f0; }
      h1 { text-align: center; color: #2e7d32; margin-bottom: 20px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px; }
      .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .card h3 { color: #2e7d32; margin-bottom: 10px; }
      .stat { font-size: 28px; font-weight: bold; color: #2e7d32; }
      .stat-label { color: #666; font-size: 14px; }
      .workout-btn { display: inline-block; padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 5px; }
      .workout-btn:hover { background: #388e3c; }
      .tip { padding: 10px; background: #e8f5e9; border-radius: 8px; margin: 5px 0; }
      .form { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
      .form input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex: 1; min-width: 100px; }
      .form button { padding: 8px 20px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; }
      .form button:hover { background: #388e3c; }
      .log { padding: 8px; border-bottom: 1px solid #eee; }
      .log-date { color: #666; font-size: 12px; }
      .clear-btn { background: #dc3545; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; }
      .clear-btn:hover { background: #c82333; }
    </style>
  </head>
  <body>
    <h1>💪 Здоровый образ жизни</h1>
    
    <div class="grid">
      <div class="card">
        <h3>👤 Профиль</h3>
        <p><strong>${user.name}</strong>, ${user.age} лет</p>
        <p>Вес: ${user.weight} кг | Рост: ${user.height} см</p>
        <p>BMI: <strong>${bmi}</strong> ${bmi < 18.5 ? '(Недостаток веса)' : bmi < 25 ? '(Норма)' : bmi < 30 ? '(Избыток)' : '(Ожирение)'}</p>
        <form class="form" method="POST" action="/update">
          <input name="weight" placeholder="Вес (кг)" value="${user.weight}">
          <input name="height" placeholder="Рост (см)" value="${user.height}">
          <button type="submit">Обновить</button>
        </form>
      </div>
      
      <div class="card">
        <h3>📊 Активность</h3>
        <div><span class="stat">${user.calories}</span> <span class="stat-label">🔥 калорий</span></div>
        <div><span class="stat">${user.steps}</span> <span class="stat-label">👣 шагов</span></div>
        <div><span class="stat">${user.water}</span> <span class="stat-label">💧 стаканов воды</span></div>
        <form class="form" method="POST" action="/activity">
          <input name="steps" placeholder="Шаги" type="number">
          <input name="water" placeholder="Стаканы воды" type="number">
          <button type="submit">Обновить</button>
        </form>
      </div>
      
      <div class="card">
        <h3>🏋️ Тренировки</h3>
        ${workouts.map(w => `
          <form method="POST" action="/workout/${w.id}" style="display:inline;">
            <button class="workout-btn" type="submit">${w.name} (${w.calories} ккал)</button>
          </form>
        `).join('')}
        <div style="margin-top:10px;">
          <form method="POST" action="/reset" style="display:inline;">
            <button class="clear-btn" type="submit" onclick="return confirm('Сбросить всё?')">🔄 Сбросить</button>
          </form>
        </div>
      </div>
    </div>
    
    <div class="grid">
      <div class="card">
        <h3>🥗 Советы по питанию</h3>
        ${tips.map(t => `<div class="tip">${t}</div>`).join('')}
      </div>
      
      <div class="card">
        <h3>📝 История тренировок</h3>
        ${user.workouts.length === 0 ? '<p style="color:#999;">Нет тренировок</p>' : 
          user.workouts.slice().reverse().map(w => `
            <div class="log">${w.name} 🔥 ${w.calories} ккал <span class="log-date">${w.date}</span></div>
          `).join('')}
      </div>
    </div>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Обновление профиля
app.post('/update', (req, res) => {
  if (req.body.weight) user.weight = Number(req.body.weight);
  if (req.body.height) user.height = Number(req.body.height);
  res.redirect('/');
});

// Обновление активности
app.post('/activity', (req, res) => {
  if (req.body.steps) user.steps += Number(req.body.steps);
  if (req.body.water) user.water += Number(req.body.water);
  res.redirect('/');
});

// Тренировка
app.post('/workout/:id', (req, res) => {
  const workout = workouts.find(w => w.id == req.params.id);
  if (workout) {
    user.calories += workout.calories;
    user.steps += Math.floor(workout.calories * 1.5);
    user.workouts.push({
      ...workout,
      date: new Date().toLocaleString()
    });
  }
  res.redirect('/');
});

// Сброс
app.post('/reset', (req, res) => {
  user.calories = 0;
  user.steps = 0;
  user.water = 0;
  user.workouts = [];
  res.redirect('/');
});

app.listen(3000, () => console.log('🚀 http://localhost:3000'));