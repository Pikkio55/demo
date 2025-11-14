const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// Get all assistants
router.get('/', (req, res) => {
  db.all('SELECT * FROM assistants ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single assistant
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM assistants WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    res.json(row);
  });
});

// Create assistant
router.post('/', (req, res) => {
  const { name, voice, language, prompt, max_duration, telnyx_assistant_id } = req.body;

  if (!name || !prompt) {
    return res.status(400).json({ error: 'Name and prompt are required' });
  }

  const id = uuidv4();
  const sql = `INSERT INTO assistants (id, name, voice, language, prompt, max_duration, telnyx_assistant_id)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [id, name, voice || 'alloy', language || 'it', prompt, max_duration || 300, telnyx_assistant_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id, message: 'Assistant created successfully' });
  });
});

// Update assistant
router.put('/:id', (req, res) => {
  const { name, voice, language, prompt, max_duration, telnyx_assistant_id } = req.body;

  const sql = `UPDATE assistants
               SET name = ?, voice = ?, language = ?, prompt = ?, max_duration = ?, telnyx_assistant_id = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [name, voice, language, prompt, max_duration, telnyx_assistant_id, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    res.json({ message: 'Assistant updated successfully' });
  });
});

// Delete assistant
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM assistants WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    res.json({ message: 'Assistant deleted successfully' });
  });
});

module.exports = router;
