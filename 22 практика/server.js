const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

// Подключение к БД
const db = new sqlite3.Database('school.db');

// Создание таблиц
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      birth_date TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      enrolled_date TEXT DEFAULT CURRENT_DATE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      specialization TEXT,
      hire_date TEXT DEFAULT CURRENT_DATE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      credits INTEGER DEFAULT 3,
      teacher_id INTEGER,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      course_id INTEGER,
      enrolled_date TEXT DEFAULT CURRENT_DATE,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      UNIQUE(student_id, course_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER,
      grade TEXT CHECK(grade IN ('A', 'B', 'C', 'D', 'F')),
      score INTEGER CHECK(score >= 0 AND score <= 100),
      date TEXT DEFAULT CURRENT_DATE,
      comment TEXT,
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
    )
  `);
});

// ========== МАРШРУТЫ ==========

// Студенты
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => res.json(rows));
});

app.post('/students', (req, res) => {
  const { full_name, birth_date, email, phone, address } = req.body;
  db.run(
    'INSERT INTO students (full_name, birth_date, email, phone, address) VALUES (?,?,?,?,?)',
    [full_name, birth_date, email, phone, address],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.get('/students/:id', (req, res) => {
  db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: 'Студент не найден' });
    res.json(row);
  });
});

// Преподаватели
app.get('/teachers', (req, res) => {
  db.all('SELECT * FROM teachers', (err, rows) => res.json(rows));
});

app.post('/teachers', (req, res) => {
  const { full_name, email, phone, specialization } = req.body;
  db.run(
    'INSERT INTO teachers (full_name, email, phone, specialization) VALUES (?,?,?,?)',
    [full_name, email, phone, specialization],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Курсы
app.get('/courses', (req, res) => {
  db.all(`
    SELECT c.*, t.full_name as teacher_name 
    FROM courses c
    LEFT JOIN teachers t ON c.teacher_id = t.id
  `, (err, rows) => res.json(rows));
});

app.post('/courses', (req, res) => {
  const { name, code, description, credits, teacher_id } = req.body;
  db.run(
    'INSERT INTO courses (name, code, description, credits, teacher_id) VALUES (?,?,?,?,?)',
    [name, code, description, credits, teacher_id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Запись на курс
app.post('/enroll', (req, res) => {
  const { student_id, course_id } = req.body;
  db.run(
    'INSERT INTO enrollments (student_id, course_id) VALUES (?,?)',
    [student_id, course_id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Оценки
app.post('/grades', (req, res) => {
  const { enrollment_id, grade, score, comment } = req.body;
  db.run(
    'INSERT INTO grades (enrollment_id, grade, score, comment) VALUES (?,?,?,?)',
    [enrollment_id, grade, score, comment],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Получить студента с курсами и оценками
app.get('/students/:id/full', (req, res) => {
  db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err, student) => {
    if (!student) return res.status(404).json({ error: 'Студент не найден' });
    
    db.all(`
      SELECT c.name as course_name, c.code, e.enrolled_date, g.grade, g.score, g.comment
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN grades g ON e.id = g.enrollment_id
      WHERE e.student_id = ?
    `, [req.params.id], (err, courses) => {
      res.json({ ...student, courses });
    });
  });
});

app.listen(3000, () => console.log('🚀 Сервер: http://localhost:3000'));