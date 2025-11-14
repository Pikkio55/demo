const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Telnyx webhook endpoint
router.post('/telnyx', (req, res) => {
  const event = req.body;

  console.log('📞 Telnyx webhook received:', event.data?.event_type);

  try {
    switch (event.data?.event_type) {
      case 'call.initiated':
        handleCallInitiated(event.data);
        break;

      case 'call.answered':
        handleCallAnswered(event.data);
        break;

      case 'call.hangup':
        handleCallHangup(event.data);
        break;

      case 'call.recording.saved':
        handleRecordingSaved(event.data);
        break;

      default:
        console.log('Unhandled event type:', event.data?.event_type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

function handleCallInitiated(data) {
  const callId = data.payload?.call_control_id;
  console.log('Call initiated:', callId);
}

function handleCallAnswered(data) {
  const callId = data.payload?.call_control_id;
  console.log('Call answered:', callId);

  // Update campaign_leads with call start
  db.run(
    `UPDATE campaign_leads
     SET call_status = 'in_progress', called_at = CURRENT_TIMESTAMP
     WHERE call_id = ?`,
    [callId]
  );
}

function handleCallHangup(data) {
  const callId = data.payload?.call_control_id;
  const duration = data.payload?.call_duration_secs;
  const hangupCause = data.payload?.hangup_cause;

  console.log('Call hangup:', callId, 'Duration:', duration, 'Cause:', hangupCause);

  // Update campaign_leads with call result
  db.run(
    `UPDATE campaign_leads
     SET call_status = 'completed', call_duration = ?
     WHERE call_id = ?`,
    [duration, callId]
  );

  // Update campaign stats
  db.run(`
    UPDATE campaigns
    SET called_leads = (SELECT COUNT(*) FROM campaign_leads WHERE campaign_id = campaigns.id AND call_status IN ('completed', 'failed'))
    WHERE id IN (SELECT campaign_id FROM campaign_leads WHERE call_id = ?)
  `, [callId]);
}

function handleRecordingSaved(data) {
  const callId = data.payload?.call_control_id;
  const recordingUrl = data.payload?.recording_urls?.mp3;

  console.log('Recording saved:', callId, recordingUrl);

  if (recordingUrl) {
    db.run(
      `UPDATE campaign_leads
       SET call_recording_url = ?
       WHERE call_id = ?`,
      [recordingUrl, callId]
    );
  }
}

module.exports = router;
