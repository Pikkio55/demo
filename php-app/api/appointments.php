<?php
require_once '../config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

try {
    switch ($method) {
        case 'GET':
            if (!empty($path)) {
                // Get single appointment
                $stmt = $db->prepare("
                    SELECT a.*,
                           l.first_name, l.last_name, l.phone_number, l.email, l.company,
                           c.name as campaign_name
                    FROM appointments a
                    JOIN leads l ON a.lead_id = l.id
                    JOIN campaigns c ON a.campaign_id = c.id
                    WHERE a.id = ?
                ");
                $stmt->execute([$path]);
                $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($appointment) {
                    jsonResponse($appointment);
                } else {
                    jsonResponse(['error' => 'Appointment not found'], 404);
                }
            } else {
                // Get all appointments
                $stmt = $db->query("
                    SELECT a.*,
                           l.first_name, l.last_name, l.phone_number, l.email, l.company,
                           c.name as campaign_name
                    FROM appointments a
                    JOIN leads l ON a.lead_id = l.id
                    JOIN campaigns c ON a.campaign_id = c.id
                    ORDER BY a.appointment_date DESC
                ");
                $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                jsonResponse($appointments);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            $id = 'appointment-' . uniqid();
            $stmt = $db->prepare("INSERT INTO appointments (id, lead_id, campaign_id, appointment_date, notes, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['lead_id'],
                $data['campaign_id'],
                $data['appointment_date'],
                $data['notes'] ?? '',
                $data['status'] ?? 'scheduled'
            ]);

            jsonResponse(['id' => $id, 'message' => 'Appointment created successfully'], 201);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $db->prepare("UPDATE appointments SET appointment_date = ?, notes = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $data['appointment_date'],
                $data['notes'] ?? '',
                $data['status'] ?? 'scheduled',
                $path
            ]);

            jsonResponse(['message' => 'Appointment updated successfully']);
            break;

        case 'DELETE':
            $stmt = $db->prepare("DELETE FROM appointments WHERE id = ?");
            $stmt->execute([$path]);

            jsonResponse(['message' => 'Appointment deleted successfully']);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
