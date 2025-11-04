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

module.exports = router;
