<?php
// Подключение к SQLite
$db = new PDO('sqlite:tasks.db');
$db->exec("CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// Обработка действий
$action = $_GET['action'] ?? 'list';

// Создание задачи
if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $priority = $_POST['priority'] ?? 'medium';
    
    if ($title) {
        $stmt = $db->prepare("INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)");
        $stmt->execute([$title, $description, $priority]);
        header('Location: index.php');
        exit;
    }
}

// Обновление статуса
if ($action === 'update' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $status = $_GET['status'] ?? 'closed';
    $stmt = $db->prepare("UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$status, $id]);
    header('Location: index.php');
    exit;
}

// Удаление задачи
if ($action === 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $db->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: index.php');
    exit;
}

// Получение задач
$statusFilter = $_GET['status'] ?? 'all';
$sql = "SELECT * FROM tasks";
if ($statusFilter !== 'all') {
    $sql .= " WHERE status = '" . $statusFilter . "'";
}
$sql .= " ORDER BY priority DESC, created_at DESC";
$tasks = $db->query($sql)->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Task Manager</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial; max-width: 1000px; margin: 30px auto; padding: 20px; background: #f5f5f5; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .form { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .form input, .form textarea, .form select { padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .form textarea { width: 100%; height: 60px; resize: vertical; }
        .form button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .filters { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
        .filters a { padding: 8px 15px; background: white; text-decoration: none; color: #333; border-radius: 20px; border: 1px solid #ddd; }
        .filters a.active { background: #007bff; color: white; border-color: #007bff; }
        .task { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .task .info { flex: 1; }
        .task .title { font-weight: bold; font-size: 16px; }
        .task .description { color: #666; font-size: 14px; margin: 5px 0; }
        .task .meta { font-size: 12px; color: #999; }
        .task .actions { display: flex; gap: 5px; }
        .task .actions button { padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .btn-open { background: #28a745; color: white; }
        .btn-close { background: #dc3545; color: white; }
        .btn-delete { background: #6c757d; color: white; }
        .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; }
        .badge-high { background: #dc3545; color: white; }
        .badge-medium { background: #ffc107; color: #333; }
        .badge-low { background: #28a745; color: white; }
        .badge-open { background: #007bff; color: white; }
        .badge-closed { background: #6c757d; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Task Manager</h1>
        <span>Всего: <?= count($tasks) ?></span>
    </div>

    <!-- Форма создания -->
    <div class="form">
        <form method="POST" action="?action=create">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input name="title" placeholder="Название задачи" required style="flex: 2;">
                <select name="priority" style="flex: 1;">
                    <option value="high">Высокий</option>
                    <option value="medium" selected>Средний</option>
                    <option value="low">Низкий</option>
                </select>
                <button type="submit">➕ Добавить</button>
            </div>
            <textarea name="description" placeholder="Описание задачи..."></textarea>
        </form>
    </div>

    <!-- Фильтры -->
    <div class="filters">
        <a href="?status=all" class="<?= $statusFilter === 'all' ? 'active' : '' ?>">Все</a>
        <a href="?status=open" class="<?= $statusFilter === 'open' ? 'active' : '' ?>">Открытые</a>
        <a href="?status=closed" class="<?= $statusFilter === 'closed' ? 'active' : '' ?>">Закрытые</a>
    </div>

    <!-- Список задач -->
    <?php if (count($tasks) === 0): ?>
        <p style="text-align:center;color:#999;padding:40px;">Нет задач</p>
    <?php else: ?>
        <?php foreach ($tasks as $task): ?>
            <div class="task">
                <div class="info">
                    <div class="title">
                        <?= htmlspecialchars($task['title']) ?>
                        <span class="badge badge-<?= $task['priority'] ?>"><?= $task['priority'] ?></span>
                        <span class="badge badge-<?= $task['status'] ?>"><?= $task['status'] ?></span>
                    </div>
                    <?php if ($task['description']): ?>
                        <div class="description"><?= htmlspecialchars($task['description']) ?></div>
                    <?php endif; ?>
                    <div class="meta">
                        Создано: <?= date('d.m.Y H:i', strtotime($task['created_at'])) ?>
                    </div>
                </div>
                <div class="actions">
                    <?php if ($task['status'] === 'open'): ?>
                        <a href="?action=update&id=<?= $task['id'] ?>&status=closed" class="btn-close" style="padding:5px 10px;border-radius:4px;text-decoration:none;">✅ Закрыть</a>
                    <?php else: ?>
                        <a href="?action=update&id=<?= $task['id'] ?>&status=open" class="btn-open" style="padding:5px 10px;border-radius:4px;text-decoration:none;">🔄 Открыть</a>
                    <?php endif; ?>
                    <a href="?action=delete&id=<?= $task['id'] ?>" class="btn-delete" style="padding:5px 10px;border-radius:4px;text-decoration:none;" onclick="return confirm('Удалить задачу?')">🗑️</a>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</body>
</html>