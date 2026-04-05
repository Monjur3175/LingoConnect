<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../includes/auth.php';

lc_json(lc_logout_user());
