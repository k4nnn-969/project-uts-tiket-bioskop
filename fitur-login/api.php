<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['message' => 'Metode request tidak didukung.']);
}

session_set_cookie_params([
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Strict',
    'path' => '/',
]);
session_start();

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(400, ['message' => 'Data yang dikirim tidak valid.']);
}

$action = $input['action'] ?? '';
$contact = trim((string) ($input['contact'] ?? ''));
$password = (string) ($input['password'] ?? '');

if (!in_array($action, ['register', 'login', 'status', 'logout'], true)) {
    respond(400, ['message' => 'Aksi tidak dikenal.']);
}

if ($action === 'status') {
    respond(200, [
        'user' => isset($_SESSION['user_id'])
            ? ['id' => (int) $_SESSION['user_id'], 'full_name' => $_SESSION['user_name']]
            : null,
    ]);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    setcookie(session_name(), '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Strict',
    ]);
    respond(200, ['message' => 'Kamu berhasil keluar.']);
}

if ($contact === '' || strlen($password) < 6) {
    respond(422, ['message' => 'Email/nomor ponsel dan kata sandi minimal 6 karakter wajib diisi.']);
}

$email = null;
$phone = null;
if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $email = strtolower($contact);
} else {
    $normalizedPhone = preg_replace('/[\s()-]/', '', $contact);
    if (!is_string($normalizedPhone) || !preg_match('/^\+?[0-9]{8,15}$/', $normalizedPhone)) {
        respond(422, ['message' => 'Masukkan email atau nomor ponsel yang valid.']);
    }
    $phone = $normalizedPhone;
}

if ($action === 'register') {
    $fullName = trim((string) ($input['full_name'] ?? ''));
    if ($fullName === '' || strlen($fullName) > 100) {
        respond(422, ['message' => 'Nama lengkap wajib diisi (maksimal 100 karakter).']);
    }
}

$databaseHost = getenv('DB_HOST') ?: '127.0.0.1';
$databaseName = getenv('DB_NAME') ?: 'cinema_booking';
$databaseUser = getenv('DB_USER') ?: 'root';
$databasePassword = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO(
        "mysql:host={$databaseHost};dbname={$databaseName};charset=utf8mb4",
        $databaseUser,
        $databasePassword,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    if ($action === 'register') {
        $statement = $pdo->prepare(
            'INSERT INTO users (full_name, email, phone, password_hash)
             VALUES (:full_name, :email, :phone, :password_hash)'
        );
        $statement->execute([
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
        $user = ['id' => (int) $pdo->lastInsertId(), 'full_name' => $fullName];
    } else {
        $column = $email !== null ? 'email' : 'phone';
        $value = $email ?? $phone;
        $statement = $pdo->prepare("SELECT id, full_name, password_hash FROM users WHERE {$column} = :contact LIMIT 1");
        $statement->execute(['contact' => $value]);
        $user = $statement->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            respond(401, ['message' => 'Email/nomor ponsel atau kata sandi salah.']);
        }
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['user_name'] = $user['full_name'];

    respond(200, [
        'message' => $action === 'register' ? 'Akun berhasil dibuat.' : 'Login berhasil.',
        'user' => ['id' => (int) $user['id'], 'full_name' => $user['full_name']],
    ]);
} catch (PDOException $exception) {
    if ($exception->getCode() === '23000') {
        respond(409, ['message' => 'Email atau nomor ponsel sudah terdaftar.']);
    }

    error_log($exception->getMessage());
    respond(500, ['message' => 'Layanan login sedang bermasalah. Periksa koneksi database.']);
}
