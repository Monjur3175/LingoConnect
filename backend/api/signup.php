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

$fullname = $data['fullname'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';
$language = $data['language'] ?? null;

if ($password !== $confirmPassword) {
    lc_json(['success' => false, 'message' => 'Passwords do not match'], 400);
}

$result = lc_register_user($fullname, $email, $password, $language);

lc_json($result, $result['success'] ? 200 : 400);
