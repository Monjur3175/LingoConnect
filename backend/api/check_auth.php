<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../includes/auth.php';

lc_session_start();

if (lc_is_logged_in()) {
    lc_json([
        'success' => true,
        'authenticated' => true,
        'user' => lc_current_user(),
    ]);
}

lc_json([
    'success' => true,
    'authenticated' => false,
    'user' => null,
]);
