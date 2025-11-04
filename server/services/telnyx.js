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

  // Determine which assistant ID to use
  let assistantId;
  if (campaign.telnyx_assistant_id) {
    // Use Telnyx assistant ID from campaign (existing assistant on Telnyx)
    assistantId = campaign.telnyx_assistant_id;
    console.log(`Using existing Telnyx assistant: ${assistantId}`);
  } else if (assistant && assistant.telnyx_assistant_id) {
    // Use assistant's Telnyx ID
    assistantId = assistant.telnyx_assistant_id;
    console.log(`Using assistant's Telnyx ID: ${assistantId}`);
  } else if (assistant) {
    // Create or update assistant on Telnyx
    try {
      const telnyxAssistant = await createOrUpdateAssistant(assistant);
      assistantId = telnyxAssistant.id;
      console.log(`Created/updated Telnyx assistant: ${assistantId}`);
    } catch (error) {
      console.error('Failed to setup assistant:', error);
      return;
    }
  } else {
    console.error('No assistant configured for this campaign');
    return;
  }

  // Determine which phone number to use
  const fromNumber = campaign.phone_number || TELNYX_PHONE_NUMBER;
  if (!fromNumber) {
    console.error('No phone number configured for this campaign');
    return;
  }

  // Determine connection ID (optional)
  const connectionId = campaign.connection_id || null;

  console.log(`Calling from: ${fromNumber}${connectionId ? ` (connection: ${connectionId})` : ''}`);

  // Call each lead with a delay to avoid rate limits
  for (const lead of leads) {
    try {
      await makeCallWithResources(
        lead.phone_number,
        fromNumber,
        assistantId,
        lead.campaign_lead_id,
        connectionId
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

/**
 * Get all AI Assistants from Telnyx account
 */
async function getTelnyxAssistants() {
  try {
    const response = await telnyxClient.get('/ai/assistants');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Telnyx assistants:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get single AI Assistant from Telnyx
 */
async function getTelnyxAssistant(assistantId) {
  try {
    const response = await telnyxClient.get(`/ai/assistants/${assistantId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Telnyx assistant:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all phone numbers from Telnyx account
 */
async function getTelnyxPhoneNumbers() {
  try {
    const response = await telnyxClient.get('/phone_numbers');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching phone numbers:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all messaging profiles (connections) from Telnyx account
 */
async function getTelnyxMessagingProfiles() {
  try {
    const response = await telnyxClient.get('/messaging_profiles');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching messaging profiles:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all connections from Telnyx account
 */
async function getTelnyxConnections() {
  try {
    const response = await telnyxClient.get('/connections');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching connections:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Make an outbound call with specific phone number and assistant
 */
async function makeCallWithResources(toNumber, fromNumber, assistantId, campaignLeadId, connectionId = null) {
  try {
    const payload = {
      to: toNumber,
      from: fromNumber,
      assistant_id: assistantId,
      webhook_url: process.env.WEBHOOK_URL,
      record: 'record-from-answer'
    };

    // Add connection_id if provided
    if (connectionId) {
      payload.connection_id = connectionId;
    }

    const response = await telnyxClient.post('/calls', payload);
    const callId = response.data.data.call_control_id;

    // Update campaign_leads with call_id
    db.run(
      'UPDATE campaign_leads SET call_id = ?, call_status = ? WHERE id = ?',
      [callId, 'initiated', campaignLeadId]
    );

    console.log(`✅ Call initiated to ${toNumber} from ${fromNumber}, call_id: ${callId}`);
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

module.exports = {
  createOrUpdateAssistant,
  makeCall,
  makeCallWithResources,
  startCampaignCalls,
  getCallDetails,
  hangupCall,
  getTelnyxAssistants,
  getTelnyxAssistant,
  getTelnyxPhoneNumbers,
  getTelnyxMessagingProfiles,
  getTelnyxConnections
};
