<?php
require_once '../config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

try {
    switch ($method) {
        case 'GET':
            if (!empty($path)) {
                // Get single assistant
                $stmt = $db->prepare("SELECT * FROM assistants WHERE id = ?");
                $stmt->execute([$path]);
                $assistant = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($assistant) {
                    jsonResponse($assistant);
                } else {
                    jsonResponse(['error' => 'Assistant not found'], 404);
                }
            } else {
                // Get all assistants
                $stmt = $db->query("SELECT * FROM assistants ORDER BY created_at DESC");
                $assistants = $stmt->fetchAll(PDO::FETCH_ASSOC);
                jsonResponse($assistants);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            $id = 'assistant-' . uniqid();
            $stmt = $db->prepare("INSERT INTO assistants (id, name, voice, language, prompt, max_duration) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['name'],
                $data['voice'] ?? 'alloy',
                $data['language'] ?? 'it',
                $data['prompt'],
                $data['max_duration'] ?? 300
            ]);

            jsonResponse(['id' => $id, 'message' => 'Assistant created successfully'], 201);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $db->prepare("UPDATE assistants SET name = ?, voice = ?, language = ?, prompt = ?, max_duration = ? WHERE id = ?");
            $stmt->execute([
                $data['name'],
                $data['voice'] ?? 'alloy',
                $data['language'] ?? 'it',
                $data['prompt'],
                $data['max_duration'] ?? 300,
                $path
            ]);

            jsonResponse(['message' => 'Assistant updated successfully']);
            break;

        case 'DELETE':
            $stmt = $db->prepare("DELETE FROM assistants WHERE id = ?");
            $stmt->execute([$path]);

            jsonResponse(['message' => 'Assistant deleted successfully']);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
