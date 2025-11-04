import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assistant_id: '',
    lead_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campaignsRes, leadsRes, assistantsRes] = await Promise.all([
        axios.get('/api/campaigns'),
        axios.get('/api/leads'),
        axios.get('/api/assistants')
      ]);
      setCampaigns(campaignsRes.data);
      setLeads(leadsRes.data);
      setAssistants(assistantsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/campaigns', formData);
      alert('Campagna creata con successo!');
      setShowModal(false);
      setFormData({ name: '', description: '', assistant_id: '', lead_ids: [] });
      loadData();
    } catch (error) {
      alert('Errore durante la creazione: ' + error.message);
    }
  };

  const handleStartCampaign = async (id) => {
    if (!window.confirm('Avviare questa campagna?')) return;

    try {
      const response = await axios.post(`/api/campaigns/${id}/start`);
      alert(response.data.message);
      loadData();
    } catch (error) {
      alert('Errore: ' + (error.response?.data?.error || error.message));
    }
  };

  const handlePauseCampaign = async (id) => {
    try {
      await axios.post(`/api/campaigns/${id}/pause`);
      alert('Campagna messa in pausa!');
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa campagna?')) return;

    try {
      await axios.delete(`/api/campaigns/${id}`);
      alert('Campagna eliminata con successo!');
      loadData();
    } catch (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
    }
  };

  const handleLeadSelection = (leadId) => {
    const newLeadIds = formData.lead_ids.includes(leadId)
      ? formData.lead_ids.filter(id => id !== leadId)
      : [...formData.lead_ids, leadId];
    setFormData({ ...formData, lead_ids: newLeadIds });
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Gestione Campagne</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nuova Campagna
        </button>
      </div>

      <div className="card">
        {campaigns.length === 0 ? (
          <div className="empty-state">
            <h3>Nessuna campagna creata</h3>
            <p>Crea la tua prima campagna outbound</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Crea Campagna
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Stato</th>
                <th>Lead</th>
                <th>Chiamate</th>
                <th>Appuntamenti</th>
                <th>Tasso Conv.</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td>
                    <Link to={`/campaigns/${campaign.id}`} style={{ color: '#0066ff', textDecoration: 'none' }}>
                      {campaign.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`status-badge status-${campaign.status}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td>{campaign.total_leads}</td>
                  <td>{campaign.called_leads}</td>
                  <td>{campaign.successful_appointments}</td>
                  <td>
                    {campaign.called_leads > 0
                      ? `${Math.round((campaign.successful_appointments / campaign.called_leads) * 100)}%`
                      : '0%'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {campaign.status === 'draft' || campaign.status === 'paused' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleStartCampaign(campaign.id)}
                        >
                          Avvia
                        </button>
                      ) : null}
                      {campaign.status === 'active' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handlePauseCampaign(campaign.id)}
                        >
                          Pausa
                        </button>
                      ) : null}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Crea Nuova Campagna</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome Campagna *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Assistente AI *</label>
                <select
                  value={formData.assistant_id}
                  onChange={(e) => setFormData({ ...formData, assistant_id: e.target.value })}
                  required
                >
                  <option value="">Seleziona un assistente</option>
                  {assistants.map(assistant => (
                    <option key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Seleziona Lead</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}>
                  {leads.map(lead => (
                    <div key={lead.id} style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.lead_ids.includes(lead.id)}
                          onChange={() => handleLeadSelection(lead.id)}
                          style={{ marginRight: '10px', width: 'auto' }}
                        />
                        {lead.first_name} {lead.last_name} - {lead.phone_number}
                      </label>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {formData.lead_ids.length} lead selezionati
                </p>
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Crea Campagna</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Campaigns;
