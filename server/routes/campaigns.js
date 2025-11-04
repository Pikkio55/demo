const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const telnyxService = require('../services/telnyx');

// Get all campaigns
router.get('/', (req, res) => {
  db.all('SELECT * FROM campaigns ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single campaign with details
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM campaigns WHERE id = ?', [req.params.id], (err, campaign) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get campaign leads with their details
    const sql = `
      SELECT cl.*, l.first_name, l.last_name, l.phone_number, l.email, l.company
      FROM campaign_leads cl
      JOIN leads l ON cl.lead_id = l.id
      WHERE cl.campaign_id = ?
      ORDER BY cl.created_at DESC
    `;

    db.all(sql, [req.params.id], (err, leads) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ ...campaign, leads });
    });
  });
});

// Create campaign
router.post('/', (req, res) => {
  const { name, description, assistant_id, telnyx_assistant_id, phone_number, connection_id, lead_ids } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campaign name is required' });
  }

  const campaignId = uuidv4();
  const sql = `INSERT INTO campaigns (id, name, description, assistant_id, telnyx_assistant_id, phone_number, connection_id, total_leads)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [campaignId, name, description, assistant_id, telnyx_assistant_id, phone_number, connection_id, lead_ids?.length || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Add leads to campaign
    if (lead_ids && lead_ids.length > 0) {
      const stmt = db.prepare('INSERT INTO campaign_leads (id, campaign_id, lead_id) VALUES (?, ?, ?)');
      lead_ids.forEach(leadId => {
        stmt.run([uuidv4(), campaignId, leadId]);
      });
      stmt.finalize();
    }

    res.status(201).json({ id: campaignId, message: 'Campaign created successfully' });
  });
});

// Add leads to campaign
router.post('/:id/leads', (req, res) => {
  const { lead_ids } = req.body;

  if (!lead_ids || lead_ids.length === 0) {
    return res.status(400).json({ error: 'Lead IDs are required' });
  }

  const stmt = db.prepare('INSERT INTO campaign_leads (id, campaign_id, lead_id) VALUES (?, ?, ?)');
  lead_ids.forEach(leadId => {
    stmt.run([uuidv4(), req.params.id, leadId]);
  });
  stmt.finalize((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Update total leads count
    db.run(
      'UPDATE campaigns SET total_leads = (SELECT COUNT(*) FROM campaign_leads WHERE campaign_id = ?) WHERE id = ?',
      [req.params.id, req.params.id]
    );

    res.json({ message: 'Leads added to campaign successfully' });
  });
});

// Start campaign (begin calling leads)
router.post('/:id/start', async (req, res) => {
  try {
    // Get campaign details
    const campaign = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM campaigns WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'active') {
      return res.status(400).json({ error: 'Campaign is already active' });
    }

    // Get assistant details
    const assistant = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM assistants WHERE id = ?', [campaign.assistant_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!assistant) {
      return res.status(400).json({ error: 'Assistant not configured for this campaign' });
    }

    // Get pending leads
    const leads = await new Promise((resolve, reject) => {
      const sql = `
        SELECT cl.id as campaign_lead_id, cl.lead_id, l.first_name, l.last_name, l.phone_number
        FROM campaign_leads cl
        JOIN leads l ON cl.lead_id = l.id
        WHERE cl.campaign_id = ? AND cl.call_status = 'pending'
        LIMIT 10
      `;
      db.all(sql, [req.params.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (leads.length === 0) {
      return res.status(400).json({ error: 'No pending leads in this campaign' });
    }

    // Update campaign status
    db.run('UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['active', req.params.id]);

    // Start calling leads (async - don't wait)
    telnyxService.startCampaignCalls(campaign, assistant, leads);

    res.json({
      message: 'Campaign started successfully',
      leads_to_call: leads.length
    });

  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pause campaign
router.post('/:id/pause', (req, res) => {
  db.run('UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['paused', req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json({ message: 'Campaign paused successfully' });
    }
  );
});

// Update campaign
router.put('/:id', (req, res) => {
  const { name, description, assistant_id, status } = req.body;

  const sql = `UPDATE campaigns
               SET name = ?, description = ?, assistant_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [name, description, assistant_id, status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign updated successfully' });
  });
});

// Delete campaign
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully' });
  });
});

module.exports = router;
