const axios = require('axios');
const { db } = require('../database');

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER;
const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

const telnyxClient = axios.create({
  baseURL: TELNYX_API_BASE,
  headers: {
    'Authorization': `Bearer ${TELNYX_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Create or update AI Assistant on Telnyx
 */
async function createOrUpdateAssistant(assistant) {
  try {
    const payload = {
      name: assistant.name,
      voice: assistant.voice,
      language: assistant.language,
      prompt: assistant.prompt,
      webhook_url: process.env.WEBHOOK_URL,
      max_duration: assistant.max_duration
    };

    let response;
    if (assistant.telnyx_assistant_id) {
      // Update existing assistant
      response = await telnyxClient.put(`/ai/assistants/${assistant.telnyx_assistant_id}`, payload);
    } else {
      // Create new assistant
      response = await telnyxClient.post('/ai/assistants', payload);

      // Save Telnyx assistant ID in our database
      db.run(
        'UPDATE assistants SET telnyx_assistant_id = ? WHERE id = ?',
        [response.data.data.id, assistant.id]
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('Error creating/updating assistant:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Make an outbound call with AI Assistant
 */
async function makeCall(toNumber, assistantId, campaignLeadId) {
  try {
    const payload = {
      to: toNumber,
      from: TELNYX_PHONE_NUMBER,
      assistant_id: assistantId,
      webhook_url: process.env.WEBHOOK_URL,
      record: 'record-from-answer'
    };

    const response = await telnyxClient.post('/calls', payload);
    const callId = response.data.data.call_control_id;

    // Update campaign_leads with call_id
    db.run(
      'UPDATE campaign_leads SET call_id = ?, call_status = ? WHERE id = ?',
      [callId, 'initiated', campaignLeadId]
    );

    console.log(`✅ Call initiated to ${toNumber}, call_id: ${callId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error making call:', error.response?.data || error.message);

    // Mark as failed
    db.run(
      'UPDATE campaign_leads SET call_status = ?, notes = ? WHERE id = ?',
      ['failed', error.message, campaignLeadId]
    );

    throw error;
  }
}

/**
 * Start calling leads in a campaign
 */
async function startCampaignCalls(campaign, assistant, leads) {
  console.log(`🚀 Starting campaign: ${campaign.name} with ${leads.length} leads`);

  // Make sure assistant exists on Telnyx
  let telnyxAssistant;
  try {
    telnyxAssistant = await createOrUpdateAssistant(assistant);
  } catch (error) {
    console.error('Failed to setup assistant:', error);
    return;
  }

  // Call each lead with a delay to avoid rate limits
  for (const lead of leads) {
    try {
      await makeCall(
        lead.phone_number,
        telnyxAssistant.id,
        lead.campaign_lead_id
      );

      // Wait 2 seconds between calls to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to call ${lead.phone_number}:`, error.message);
      // Continue with next lead
    }
  }

  console.log(`✅ Campaign ${campaign.name} calls initiated`);
}

/**
 * Get call details
 */
async function getCallDetails(callId) {
  try {
    const response = await telnyxClient.get(`/calls/${callId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting call details:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Hangup a call
 */
async function hangupCall(callId) {
  try {
    const response = await telnyxClient.post(`/calls/${callId}/actions/hangup`);
    return response.data.data;
  } catch (error) {
    console.error('Error hanging up call:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createOrUpdateAssistant,
  makeCall,
  startCampaignCalls,
  getCallDetails,
  hangupCall
};
