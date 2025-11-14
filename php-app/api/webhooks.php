<?php
require_once '../config.php';

$db = getDB();

// Get webhook payload
$payload = json_decode(file_get_contents('php://input'), true);

// Log webhook for debugging
$logFile = __DIR__ . '/../webhook-log.txt';
file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . json_encode($payload, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

if (!$payload || !isset($payload['data']['event_type'])) {
    jsonResponse(['error' => 'Invalid webhook payload'], 400);
}

$eventType = $payload['data']['event_type'];
$callData = $payload['data']['payload'] ?? [];

try {
    switch ($eventType) {
        case 'call.initiated':
            // Call started
            $callId = $callData['call_control_id'] ?? null;
            if ($callId) {
                // Update call status
                $stmt = $db->prepare("UPDATE campaign_leads SET call_status = 'in_progress' WHERE call_id = ?");
                $stmt->execute([$callId]);
            }
            break;

        case 'call.answered':
            // Call answered
            $callId = $callData['call_control_id'] ?? null;
            if ($callId) {
                $stmt = $db->prepare("UPDATE campaign_leads SET call_status = 'answered' WHERE call_id = ?");
                $stmt->execute([$callId]);
            }
            break;

        case 'call.hangup':
            // Call ended
            $callId = $callData['call_control_id'] ?? null;
            $duration = $callData['call_duration_secs'] ?? 0;

            if ($callId) {
                $stmt = $db->prepare("UPDATE campaign_leads SET call_status = 'completed', call_duration = ? WHERE call_id = ?");
                $stmt->execute([$duration, $callId]);

                // Update campaign stats
                $db->exec("UPDATE campaigns SET calls_made = calls_made + 1 WHERE id IN (SELECT campaign_id FROM campaign_leads WHERE call_id = '$callId')");
            }
            break;

        case 'call.machine.detection.ended':
            // Voicemail detected
            $callId = $callData['call_control_id'] ?? null;
            $result = $callData['result'] ?? '';

            if ($callId && $result === 'machine') {
                $stmt = $db->prepare("UPDATE campaign_leads SET call_status = 'voicemail' WHERE call_id = ?");
                $stmt->execute([$callId]);
            }
            break;

        case 'assistant.appointment.scheduled':
            // AI Assistant scheduled an appointment
            $callId = $callData['call_control_id'] ?? null;
            $appointmentDate = $callData['appointment_date'] ?? null;

            if ($callId && $appointmentDate) {
                // Get campaign and lead info
                $stmt = $db->prepare("SELECT campaign_id, lead_id FROM campaign_leads WHERE call_id = ?");
                $stmt->execute([$callId]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($row) {
                    // Create appointment
                    $appointmentId = 'appointment-' . uniqid();
                    $stmt = $db->prepare("INSERT INTO appointments (id, lead_id, campaign_id, appointment_date, notes, status) VALUES (?, ?, ?, ?, ?, 'scheduled')");
                    $stmt->execute([
                        $appointmentId,
                        $row['lead_id'],
                        $row['campaign_id'],
                        $appointmentDate,
                        'Appuntamento prenotato da AI Assistant'
                    ]);

                    // Update campaign lead
                    $stmt = $db->prepare("UPDATE campaign_leads SET appointment_booked = 1 WHERE call_id = ?");
                    $stmt->execute([$callId]);

                    // Update campaign stats
                    $stmt = $db->prepare("UPDATE campaigns SET appointments_booked = appointments_booked + 1 WHERE id = ?");
                    $stmt->execute([$row['campaign_id']]);
                }
            }
            break;
    }

    jsonResponse(['status' => 'processed', 'event' => $eventType]);

} catch (PDOException $e) {
    file_put_contents($logFile, "ERROR: " . $e->getMessage() . "\n\n", FILE_APPEND);
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
