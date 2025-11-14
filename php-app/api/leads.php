<?php
require_once '../config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

try {
    switch ($method) {
        case 'GET':
            if (!empty($path)) {
                // Get single lead
                $stmt = $db->prepare("SELECT * FROM leads WHERE id = ?");
                $stmt->execute([$path]);
                $lead = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($lead) {
                    jsonResponse($lead);
                } else {
                    jsonResponse(['error' => 'Lead not found'], 404);
                }
            } else {
                // Get all leads
                $stmt = $db->query("SELECT * FROM leads ORDER BY created_at DESC");
                $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
                jsonResponse($leads);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            // Handle CSV upload
            if (isset($_FILES['file'])) {
                $file = $_FILES['file']['tmp_name'];
                $handle = fopen($file, 'r');
                $imported = 0;

                // Skip header row
                fgetcsv($handle);

                $stmt = $db->prepare("INSERT INTO leads (id, first_name, last_name, phone_number, email, company) VALUES (?, ?, ?, ?, ?, ?)");

                while (($row = fgetcsv($handle)) !== false) {
                    $id = 'lead-' . uniqid();
                    $stmt->execute([
                        $id,
                        $row[0], // first_name
                        $row[1], // last_name
                        $row[2], // phone_number
                        $row[3] ?? '', // email
                        $row[4] ?? ''  // company
                    ]);
                    $imported++;
                }

                fclose($handle);
                jsonResponse(['message' => "Imported $imported leads", 'count' => $imported]);
            }

            // Create single lead
            $id = 'lead-' . uniqid();
            $stmt = $db->prepare("INSERT INTO leads (id, first_name, last_name, phone_number, email, company, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['first_name'],
                $data['last_name'],
                $data['phone_number'],
                $data['email'] ?? '',
                $data['company'] ?? '',
                $data['notes'] ?? ''
            ]);

            jsonResponse(['id' => $id, 'message' => 'Lead created successfully'], 201);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $db->prepare("UPDATE leads SET first_name = ?, last_name = ?, phone_number = ?, email = ?, company = ?, notes = ? WHERE id = ?");
            $stmt->execute([
                $data['first_name'],
                $data['last_name'],
                $data['phone_number'],
                $data['email'] ?? '',
                $data['company'] ?? '',
                $data['notes'] ?? '',
                $path
            ]);

            jsonResponse(['message' => 'Lead updated successfully']);
            break;

        case 'DELETE':
            $stmt = $db->prepare("DELETE FROM leads WHERE id = ?");
            $stmt->execute([$path]);

            jsonResponse(['message' => 'Lead deleted successfully']);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
