const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// Get all appointments
router.get('/', (req, res) => {
  const sql = `
    SELECT a.*, l.first_name, l.last_name, l.phone_number, l.email, c.name as campaign_name
    FROM appointments a
    JOIN leads l ON a.lead_id = l.id
    JOIN campaigns c ON a.campaign_id = c.id
    ORDER BY a.appointment_date ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get appointments by date range
router.get('/range', (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  const sql = `
    SELECT a.*, l.first_name, l.last_name, l.phone_number, l.email, c.name as campaign_name
    FROM appointments a
    JOIN leads l ON a.lead_id = l.id
    JOIN campaigns c ON a.campaign_id = c.id
    WHERE a.appointment_date BETWEEN ? AND ?
    ORDER BY a.appointment_date ASC
  `;

  db.all(sql, [start_date, end_date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create appointment
router.post('/', (req, res) => {
  const { campaign_lead_id, lead_id, campaign_id, appointment_date, notes } = req.body;

  if (!campaign_lead_id || !lead_id || !campaign_id || !appointment_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  const sql = `INSERT INTO appointments (id, campaign_lead_id, lead_id, campaign_id, appointment_date, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [id, campaign_lead_id, lead_id, campaign_id, appointment_date, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Update campaign_leads to mark appointment as set
    db.run('UPDATE campaign_leads SET appointment_set = 1 WHERE id = ?', [campaign_lead_id]);

    // Update campaign successful_appointments count
    db.run(
      'UPDATE campaigns SET successful_appointments = successful_appointments + 1 WHERE id = ?',
      [campaign_id]
    );

    res.status(201).json({ id, message: 'Appointment created successfully' });
  });
});

// Update appointment
router.put('/:id', (req, res) => {
  const { appointment_date, status, notes } = req.body;

  const sql = `UPDATE appointments
               SET appointment_date = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [appointment_date, status, notes, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment updated successfully' });
  });
});

// Delete appointment
router.delete('/:id', (req, res) => {
  // Get appointment details before deleting
  db.get('SELECT * FROM appointments WHERE id = ?', [req.params.id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    db.run('DELETE FROM appointments WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update campaign_leads to mark appointment as not set
      db.run('UPDATE campaign_leads SET appointment_set = 0 WHERE id = ?', [appointment.campaign_lead_id]);

      // Update campaign successful_appointments count
      db.run(
        'UPDATE campaigns SET successful_appointments = successful_appointments - 1 WHERE id = ?',
        [appointment.campaign_id]
      );

      res.json({ message: 'Appointment deleted successfully' });
    });
  });
});

module.exports = router;
