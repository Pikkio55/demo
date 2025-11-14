const express = require('express');
const router = express.Router();
const telnyxService = require('../services/telnyx');

// Get all AI Assistants from Telnyx account
router.get('/assistants', async (req, res) => {
  try {
    const assistants = await telnyxService.getTelnyxAssistants();
    res.json(assistants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single AI Assistant from Telnyx
router.get('/assistants/:id', async (req, res) => {
  try {
    const assistant = await telnyxService.getTelnyxAssistant(req.params.id);
    res.json(assistant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all phone numbers from Telnyx account
router.get('/phone-numbers', async (req, res) => {
  try {
    const phoneNumbers = await telnyxService.getTelnyxPhoneNumbers();
    res.json(phoneNumbers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messaging profiles from Telnyx account
router.get('/messaging-profiles', async (req, res) => {
  try {
    const profiles = await telnyxService.getTelnyxMessagingProfiles();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all connections from Telnyx account
router.get('/connections', async (req, res) => {
  try {
    const connections = await telnyxService.getTelnyxConnections();
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a test call
router.post('/test-call', async (req, res) => {
  try {
    const { to, from, assistant_id, connection_id } = req.body;

    if (!to || !from || !assistant_id) {
      return res.status(400).json({
        error: 'Missing required fields: to, from, assistant_id'
      });
    }

    // Validate phone number format
    if (!to.startsWith('+')) {
      return res.status(400).json({
        error: 'Phone number must be in international format (e.g., +393331234567)'
      });
    }

    const result = await telnyxService.makeTestCall(to, from, assistant_id, connection_id);

    res.json({
      success: true,
      message: 'Test call initiated successfully',
      call_id: result.call_control_id,
      data: result
    });
  } catch (error) {
    console.error('Error making test call:', error);
    res.status(500).json({
      error: error.response?.data?.errors?.[0]?.detail || error.message
    });
  }
});

module.exports = router;
