<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

try {
    switch ($method) {
        case 'GET':
            // Get Telnyx assistants
            if ($path === 'assistants') {
                $result = telnyxRequest('GET', '/ai/assistants');

                if (isset($result['error'])) {
                    jsonResponse([
                        'error' => 'Cannot fetch Telnyx assistants. API key may lack permissions.',
                        'assistants' => [],
                        'details' => $result
                    ], 403);
                }

                jsonResponse($result['data'] ?? []);
            }

            // Get Telnyx phone numbers
            if ($path === 'phone-numbers') {
                $result = telnyxRequest('GET', '/phone_numbers');

                if (isset($result['error'])) {
                    jsonResponse([
                        'error' => 'Cannot fetch phone numbers. API key may lack permissions.',
                        'phone_numbers' => [],
                        'details' => $result
                    ], 403);
                }

                jsonResponse($result['data'] ?? []);
            }

            // Get Telnyx connections
            if ($path === 'connections') {
                $result = telnyxRequest('GET', '/connections');

                if (isset($result['error'])) {
                    jsonResponse([
                        'error' => 'Cannot fetch connections.',
                        'connections' => [],
                        'details' => $result
                    ], 403);
                }

                jsonResponse($result['data'] ?? []);
            }

            jsonResponse(['error' => 'Invalid endpoint'], 404);
            break;

        case 'POST':
            // Test call
            if ($path === 'test-call') {
                $data = json_decode(file_get_contents('php://input'), true);

                $callData = [
                    'to' => $data['to'],
                    'from' => $data['from'],
                    'webhook_url' => WEBHOOK_URL,
                    'record' => 'record-from-answer'
                ];

                if (isset($data['assistant_id']) && !empty($data['assistant_id'])) {
                    $callData['assistant_id'] = $data['assistant_id'];
                }

                if (isset($data['connection_id']) && !empty($data['connection_id'])) {
                    $callData['connection_id'] = $data['connection_id'];
                }

                $result = telnyxRequest('POST', '/calls', $callData);

                if (isset($result['error'])) {
                    jsonResponse([
                        'error' => 'Failed to initiate test call',
                        'details' => $result
                    ], 500);
                }

                $callId = $result['data']['call_control_id'] ?? null;

                jsonResponse([
                    'success' => true,
                    'call_id' => $callId,
                    'message' => 'Test call initiated successfully'
                ]);
            }

            jsonResponse(['error' => 'Invalid endpoint'], 404);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
