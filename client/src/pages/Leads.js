import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await axios.get('/api/leads');
      setLeads(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leads:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leads', formData);
      alert('Lead aggiunto con successo!');
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        company: '',
        notes: ''
      });
      loadLeads();
    } catch (error) {
      alert('Errore durante l\'aggiunta del lead: ' + error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/leads/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      setShowUploadModal(false);
      loadLeads();
    } catch (error) {
      alert('Errore durante l\'upload: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo lead?')) return;

    try {
      await axios.delete(`/api/leads/${id}`);
      alert('Lead eliminato con successo!');
      loadLeads();
    } catch (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Gestione Lead</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowUploadModal(true)}>
            Carica CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Aggiungi Lead
          </button>
        </div>
      </div>

      <div className="card">
        {leads.length === 0 ? (
          <div className="empty-state">
            <h3>Nessun lead presente</h3>
            <p>Inizia aggiungendo lead manualmente o caricando un file CSV</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Aggiungi il primo lead
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cognome</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Azienda</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.first_name}</td>
                  <td>{lead.last_name}</td>
                  <td>{lead.phone_number}</td>
                  <td>{lead.email}</td>
                  <td>{lead.company}</td>
                  <td>
                    <span className={`status-badge status-${lead.status}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(lead.id)}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Aggiungi Nuovo Lead</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cognome *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Numero di Telefono *</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+39..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Azienda</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Salva</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Carica Lead da CSV</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>&times;</button>
            </div>
            <div className="file-upload">
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <label htmlFor="csv-upload">
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                <p>Clicca per selezionare un file CSV</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Il CSV deve contenere: first_name, last_name, phone_number, email, company, notes
                </p>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
