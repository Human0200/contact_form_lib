<?php

// Настройки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST");


// Получение данных из POST запроса
$data = json_decode(file_get_contents("php://input"), true);

file_put_contents('data.txt', print_r($data, true), FILE_APPEND);

http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Данные получены успешно",
    "data" => [
        "name" => $data['name'] ?? null,
        "email" => $data['email'] ?? null,
        "phone" => $data['phone'] ?? null,
        "contact_methods" => $data['contact_methods'] ?? [],
        "received_at" => date('Y-m-d H:i:s')
    ],
    "server_info" => [
        "php_version" => PHP_VERSION,
        "timestamp" => time()
    ]
]);