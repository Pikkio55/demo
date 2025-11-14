const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Get all leads
router.get('/', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single lead
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM leads WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(row);
  });
});

// Create lead
router.post('/', (req, res) => {
  const { first_name, last_name, phone_number, email, company, notes } = req.body;

  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'First name, last name, and phone number are required' });
  }

  const id = uuidv4();
  const sql = `INSERT INTO leads (id, first_name, last_name, phone_number, email, company, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [id, first_name, last_name, phone_number, email, company, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id, message: 'Lead created successfully' });
  });
});

// Upload CSV
router.post('/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const leads = [];
  const parser = csv.parse({ columns: true, skip_empty_lines: true });

  fs.createReadStream(req.file.path)
    .pipe(parser)
    .on('data', (row) => {
      leads.push({
        id: uuidv4(),
        first_name: row.first_name || row.nome || '',
        last_name: row.last_name || row.cognome || '',
        phone_number: row.phone_number || row.telefono || '',
        email: row.email || '',
        company: row.company || row.azienda || '',
        notes: row.notes || row.note || ''
      });
    })
    .on('end', () => {
      const stmt = db.prepare(`INSERT INTO leads (id, first_name, last_name, phone_number, email, company, notes)
                               VALUES (?, ?, ?, ?, ?, ?, ?)`);

      let imported = 0;
      leads.forEach(lead => {
        if (lead.first_name && lead.last_name && lead.phone_number) {
          stmt.run([lead.id, lead.first_name, lead.last_name, lead.phone_number, lead.email, lead.company, lead.notes]);
          imported++;
        }
      });

      stmt.finalize();
      fs.unlinkSync(req.file.path); // Clean up uploaded file

      res.json({ message: `${imported} leads imported successfully`, total: leads.length, imported });
    })
    .on('error', (err) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: err.message });
    });
});

// Update lead
router.put('/:id', (req, res) => {
  const { first_name, last_name, phone_number, email, company, notes, status } = req.body;

  const sql = `UPDATE leads
               SET first_name = ?, last_name = ?, phone_number = ?, email = ?, company = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [first_name, last_name, phone_number, email, company, notes, status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead updated successfully' });
  });
});

// Delete lead
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM leads WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  });
});

module.exports = router;
