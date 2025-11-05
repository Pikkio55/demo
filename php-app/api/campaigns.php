<?php
require_once '../config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

try {
    switch ($method) {
        case 'GET':
            if (!empty($path)) {
                // Get single campaign with stats
                if (strpos($path, '/') !== false) {
                    // Handle sub-routes like campaign-1/leads
                    $parts = explode('/', $path);
                    $campaignId = $parts[0];
                    $action = $parts[1] ?? '';

                    if ($action === 'leads') {
                        // Get campaign leads with call status
                        $stmt = $db->prepare("
                            SELECT l.*, cl.call_status, cl.call_duration, cl.appointment_booked, cl.called_at
                            FROM leads l
                            JOIN campaign_leads cl ON l.id = cl.lead_id
                            WHERE cl.campaign_id = ?
                        ");
                        $stmt->execute([$campaignId]);
                        $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        jsonResponse($leads);
                    }
                } else {
                    // Get single campaign
                    $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ?");
                    $stmt->execute([$path]);
                    $campaign = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($campaign) {
                        jsonResponse($campaign);
                    } else {
                        jsonResponse(['error' => 'Campaign not found'], 404);
                    }
                }
            } else {
                // Get all campaigns
                $stmt = $db->query("SELECT * FROM campaigns ORDER BY created_at DESC");
                $campaigns = $stmt->fetchAll(PDO::FETCH_ASSOC);
                jsonResponse($campaigns);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            // Handle start campaign action
            if (!empty($path) && strpos($path, '/start') !== false) {
                $campaignId = str_replace('/start', '', $path);

                // Get campaign
                $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ?");
                $stmt->execute([$campaignId]);
                $campaign = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$campaign) {
                    jsonResponse(['error' => 'Campaign not found'], 404);
                }

                // Get campaign leads
                $stmt = $db->prepare("
                    SELECT l.* FROM leads l
                    JOIN campaign_leads cl ON l.id = cl.lead_id
                    WHERE cl.campaign_id = ? AND cl.call_status = 'pending'
                ");
                $stmt->execute([$campaignId]);
                $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Start calling each lead
                $callsStarted = 0;
                foreach ($leads as $lead) {
                    $callData = [
                        'to' => $lead['phone_number'],
                        'from' => $campaign['phone_number'],
                        'webhook_url' => WEBHOOK_URL,
                        'record' => 'record-from-answer'
                    ];

                    if ($campaign['telnyx_assistant_id']) {
                        $callData['assistant_id'] = $campaign['telnyx_assistant_id'];
                    }
                    if ($campaign['connection_id']) {
                        $callData['connection_id'] = $campaign['connection_id'];
                    }

                    $result = telnyxRequest('POST', '/calls', $callData);

                    if (!isset($result['error'])) {
                        $callId = $result['data']['call_control_id'] ?? null;

                        // Update campaign_lead
                        $stmt = $db->prepare("UPDATE campaign_leads SET call_status = 'calling', call_id = ?, called_at = CURRENT_TIMESTAMP WHERE campaign_id = ? AND lead_id = ?");
                        $stmt->execute([$callId, $campaignId, $lead['id']]);
                        $callsStarted++;
                    }
                }

                // Update campaign status
                $stmt = $db->prepare("UPDATE campaigns SET status = 'active', calls_made = calls_made + ? WHERE id = ?");
                $stmt->execute([$callsStarted, $campaignId]);

                jsonResponse(['message' => "Campaign started, $callsStarted calls initiated"]);
            }

            // Create new campaign
            $id = 'campaign-' . uniqid();
            $leadIds = $data['lead_ids'] ?? [];

            $stmt = $db->prepare("INSERT INTO campaigns (id, name, description, assistant_id, telnyx_assistant_id, phone_number, connection_id, total_leads) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['name'],
                $data['description'] ?? '',
                $data['assistant_id'] ?? null,
                $data['telnyx_assistant_id'] ?? null,
                $data['phone_number'] ?? null,
                $data['connection_id'] ?? null,
                count($leadIds)
            ]);

            // Add leads to campaign
            if (!empty($leadIds)) {
                $stmt = $db->prepare("INSERT INTO campaign_leads (campaign_id, lead_id) VALUES (?, ?)");
                foreach ($leadIds as $leadId) {
                    $stmt->execute([$id, $leadId]);
                }
            }

            jsonResponse(['id' => $id, 'message' => 'Campaign created successfully'], 201);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $db->prepare("UPDATE campaigns SET name = ?, description = ?, assistant_id = ?, telnyx_assistant_id = ?, phone_number = ?, connection_id = ? WHERE id = ?");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['assistant_id'] ?? null,
                $data['telnyx_assistant_id'] ?? null,
                $data['phone_number'] ?? null,
                $data['connection_id'] ?? null,
                $path
            ]);

            jsonResponse(['message' => 'Campaign updated successfully']);
            break;

        case 'DELETE':
            // Delete campaign and related data
            $db->exec("DELETE FROM campaign_leads WHERE campaign_id = '$path'");
            $db->exec("DELETE FROM appointments WHERE campaign_id = '$path'");
            $stmt = $db->prepare("DELETE FROM campaigns WHERE id = ?");
            $stmt->execute([$path]);

            jsonResponse(['message' => 'Campaign deleted successfully']);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
