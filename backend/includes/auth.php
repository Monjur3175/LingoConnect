<?php

require_once __DIR__ . '/../config/database.php';

function lc_json($arr, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($arr);
    exit;
}

function lc_sanitize(string $v): string {
    return trim($v);
}

function lc_session_start(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function lc_is_logged_in(): bool {
    return isset($_SESSION['user_id']);
}

function lc_current_user(): ?array {
    if (!lc_is_logged_in()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? '',
    ];
}

function lc_register_user(string $fullname, string $email, string $password, ?string $target_language): array {
    global $pdo;

    $fullname = lc_sanitize($fullname);
    $email = lc_sanitize($email);
    $target_language = $target_language !== null ? lc_sanitize($target_language) : null;

    if ($fullname === '' || $email === '' || $password === '') {
        return ['success' => false, 'message' => 'All fields are required'];
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Invalid email address'];
    }

    if (strlen($password) < 8) {
        return ['success' => false, 'message' => 'Password must be at least 8 characters long'];
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['success' => false, 'message' => 'Email already exists'];
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (fullname, email, password_hash, target_language) VALUES (?, ?, ?, ?)');
    $ok = $stmt->execute([$fullname, $email, $hash, $target_language]);

    if (!$ok) {
        return ['success' => false, 'message' => 'Registration failed'];
    }

    return ['success' => true, 'message' => 'Registration successful'];
}

function lc_login_user(string $email, string $password): array {
    global $pdo;

    $email = lc_sanitize($email);

    if ($email === '' || $password === '') {
        return ['success' => false, 'message' => 'Email and password are required'];
    }

    $stmt = $pdo->prepare('SELECT id, fullname, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        return ['success' => false, 'message' => 'Invalid email or password'];
    }

    lc_session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['fullname'];
    $_SESSION['user_email'] = $user['email'];

    return [
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['fullname'],
            'email' => $user['email'],
        ],
    ];
}

function lc_logout_user(): array {
    lc_session_start();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }

    session_destroy();
    return ['success' => true, 'message' => 'Logged out'];
}
