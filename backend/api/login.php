<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../includes/auth.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    lc_json(['success' => false, 'message' => 'Invalid JSON'], 400);
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

$result = lc_login_user($email, $password);
lc_json($result, $result['success'] ? 200 : 401);
