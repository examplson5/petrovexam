const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Хранилище проектов (в памяти)
const projects = {};

// ========== МАРШРУТЫ ==========

// Главная - список проектов
app.get('/', (req, res) => {
    const projectList = Object.keys(projects).map(id => ({
        id,
        ...projects[id]
    }));
    res.render('index', { projects: projectList });
});

// Создание проекта
app.post('/project', (req, res) => {
    const { name } = req.body;
    const id = Date.now().toString();
    projects[id] = {
        name,
        tasks: [],
        resources: [],
        created: new Date().toISOString()
    };
    res.redirect('/');
});

// Страница проекта
app.get('/project/:id', (req, res) => {
    const project = projects[req.params.id];
    if (!project) return res.redirect('/');
    res.render('project', { project, id: req.params.id });
});

// Добавить задачу
app.post('/project/:id/task', (req, res) => {
    const project = projects[req.params.id];
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    
    const { name, duration, depends, priority, resources } = req.body;
    project.tasks.push({
        id: Date.now().toString(),
        name,
        duration: duration || '1d',
        depends: depends || '',
        priority: priority || '0',
        resources: resources || ''
    });
    res.redirect(`/project/${req.params.id}`);
});

// Удалить задачу
app.delete('/project/:id/task/:taskId', (req, res) => {
    const project = projects[req.params.id];
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    
    project.tasks = project.tasks.filter(t => t.id !== req.params.taskId);
    res.json({ success: true });
});

// Экспорт в TaskJuggler
app.get('/project/:id/export', (req, res) => {
    const project = projects[req.params.id];
    if (!project) return res.redirect('/');
    
    // Генерация .tjp файла
    let tjp = `project "${project.name}" "${new Date().toISOString().split('T')[0]}" {\n`;
    tjp += `  timeformat "%Y-%m-%d"\n`;
    tjp += `  currency "USD"\n`;
    tjp += `}\n\n`;
    
    // Ресурсы
    const resources = [...new Set(project.tasks.flatMap(t => 
        t.resources ? t.resources.split(',').map(r => r.trim()) : []
    ))];
    
    resources.forEach(r => {
        tjp += `resource "${r}" {\n  limits { dailymax 8h }\n}\n\n`;
    });
    
    // Задачи
    project.tasks.forEach(t => {
        tjp += `task "${t.name}" {\n`;
        tjp += `  id ${t.id}\n`;
        tjp += `  duration ${t.duration}\n`;
        if (t.priority && t.priority !== '0') {
            tjp += `  priority ${t.priority}\n`;
        }
        if (t.depends) {
            const deps = t.depends.split(',').map(d => d.trim()).join(', ');
            tjp += `  depends ${deps}\n`;
        }
        if (t.resources) {
            const resList = t.resources.split(',').map(r => r.trim()).join(', ');
            tjp += `  allocate ${resList}\n`;
        }
        tjp += `}\n\n`;
    });
    
    // Отчёты
    tjp += `report ganttchart "${project.name} Gantt" {\n`;
    tjp += `  columns id, name, start, end, duration, resources\n`;
    tjp += `  timeformat "%Y-%m-%d"\n`;
    tjp += `  hideresource 1\n`;
    tjp += `}\n\n`;
    
    tjp += `report html "${project.name} Report" {\n`;
    tjp += `  formats html\n`;
    tjp += `  timeformat "%Y-%m-%d"\n`;
    tjp += `}\n`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}.tjp"`);
    res.send(tjp);
});

// Генерация отчёта TaskJuggler
app.post('/project/:id/generate', (req, res) => {
    const project = projects[req.params.id];
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    
    // Создаём временный .tjp файл
    const tjpContent = generateTJP(project);
    const tjpPath = `/tmp/${project.name}.tjp`;
    fs.writeFileSync(tjpPath, tjpContent);
    
    // Запускаем TaskJuggler
    exec(`tj3 ${tjpPath} --output-dir /tmp/tj3-output`, (error, stdout, stderr) => {
        if (error) {
            return res.json({ error: 'Ошибка TaskJuggler: ' + stderr });
        }
        res.json({ 
            success: true, 
            message: 'Отчёт сгенерирован',
            output: stdout 
        });
    });
});

function generateTJP(project) {
    // ... аналогично экспорту
    let tjp = `project "${project.name}" "${new Date().toISOString().split('T')[0]}" {}\n\n`;
    project.tasks.forEach(t => {
        tjp += `task "${t.name}" {\n  id ${t.id}\n  duration ${t.duration}\n`;
        if (t.depends) tjp += `  depends ${t.depends}\n`;
        if (t.resources) tjp += `  allocate ${t.resources}\n`;
        tjp += `}\n\n`;
    });
    return tjp;
}

app.listen(3000, () => console.log('http://localhost:3000'));