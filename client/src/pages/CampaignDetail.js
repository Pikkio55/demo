import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTestCallModal, setShowTestCallModal] = useState(false);
  const [testCallInProgress, setTestCallInProgress] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      const response = await axios.get(`/api/campaigns/${id}`);
      setCampaign(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaign:', error);
      setLoading(false);
    }
  };

  const handleTestCall = async (e) => {
    e.preventDefault();

    if (!testPhoneNumber) {
      alert('Inserisci il numero di telefono da chiamare!');
      return;
    }

    if (!campaign.telnyx_assistant_id || !campaign.phone_number) {
      alert('Questa campagna non ha un assistente AI o un numero di telefono configurato!');
      return;
    }

    setTestCallInProgress(true);
    try {
      const response = await axios.post('/api/telnyx/test-call', {
        to: testPhoneNumber,
        from: campaign.phone_number,
        assistant_id: campaign.telnyx_assistant_id,
        connection_id: campaign.connection_id || ''
      });

      alert(`✅ Chiamata di test avviata con successo!\n\nCall ID: ${response.data.call_id}\n\nDovresti ricevere la chiamata tra pochi secondi.`);
      setShowTestCallModal(false);
      setTestPhoneNumber('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      alert(`❌ Errore durante la chiamata di test:\n\n${errorMsg}`);
    } finally {
      setTestCallInProgress(false);
    }
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  if (!campaign) {
    return <div className="loading">Campagna non trovata</div>;
  }

  const conversionRate = campaign.called_leads > 0
    ? ((campaign.successful_appointments / campaign.called_leads) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/campaigns" style={{ color: '#0066ff', textDecoration: 'none', marginBottom: '10px', display: 'block' }}>
            ← Torna alle campagne
          </Link>
          <h2>{campaign.name}</h2>
          <p style={{ color: '#666', marginTop: '5px' }}>{campaign.description}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {campaign.telnyx_assistant_id && campaign.phone_number && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTestCallModal(true)}>
              🧪 Test Call
            </button>
          )}
          <span className={`status-badge status-${campaign.status}`} style={{ fontSize: '16px', padding: '8px 16px' }}>
            {campaign.status}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Lead Totali</h3>
          <div className="stat-value">{campaign.total_leads}</div>
        </div>
        <div className="stat-card">
          <h3>Chiamate</h3>
          <div className="stat-value">{campaign.called_leads}</div>
          <div className="stat-label">su {campaign.total_leads}</div>
        </div>
        <div className="stat-card">
          <h3>Appuntamenti</h3>
          <div className="stat-value">{campaign.successful_appointments}</div>
          <div className="stat-label">{conversionRate}% tasso conversione</div>
        </div>
        <div className="stat-card">
          <h3>In Attesa</h3>
          <div className="stat-value">
            {campaign.total_leads - campaign.called_leads}
          </div>
          <div className="stat-label">lead da chiamare</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Lead della Campagna</h3>
        {campaign.leads && campaign.leads.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Azienda</th>
                <th>Stato Chiamata</th>
                <th>Durata</th>
                <th>Appuntamento</th>
                <th>Data Chiamata</th>
              </tr>
            </thead>
            <tbody>
              {campaign.leads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.first_name} {lead.last_name}</td>
                  <td>{lead.phone_number}</td>
                  <td>{lead.email || '-'}</td>
                  <td>{lead.company || '-'}</td>
                  <td>
                    <span className={`status-badge status-${lead.call_status}`}>
                      {lead.call_status}
                    </span>
                  </td>
                  <td>
                    {lead.call_duration
                      ? `${Math.floor(lead.call_duration / 60)}:${String(lead.call_duration % 60).padStart(2, '0')}`
                      : '-'}
                  </td>
                  <td>
                    {lead.appointment_set ? (
                      <span style={{ color: '#28a745' }}>✓ Sì</span>
                    ) : (
                      <span style={{ color: '#dc3545' }}>✗ No</span>
                    )}
                  </td>
                  <td>
                    {lead.called_at
                      ? new Date(lead.called_at).toLocaleString('it-IT')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#999' }}>Nessun lead in questa campagna</p>
        )}
      </div>

      {/* Test Call Modal */}
      {showTestCallModal && (
        <div className="modal-overlay" onClick={() => setShowTestCallModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>🧪 Chiamata di Test</h3>
              <button className="close-btn" onClick={() => setShowTestCallModal(false)}>&times;</button>
            </div>

            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Esegui una chiamata di test usando le risorse configurate in questa campagna.
            </p>

            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', margin: '5px 0' }}>
                <strong>Assistente:</strong> {campaign.telnyx_assistant_id}
              </p>
              <p style={{ fontSize: '13px', margin: '5px 0' }}>
                <strong>Da numero:</strong> {campaign.phone_number}
              </p>
              {campaign.connection_id && (
                <p style={{ fontSize: '13px', margin: '5px 0' }}>
                  <strong>Connection:</strong> {campaign.connection_id}
                </p>
              )}
            </div>

            <form onSubmit={handleTestCall}>
              <div className="form-group">
                <label>Numero da Chiamare (Il tuo numero) *</label>
                <input
                  type="tel"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+393331234567"
                  required
                />
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  Formato internazionale (es. +39 per Italia, +1 per USA)
                </p>
              </div>

              <div className="action-buttons">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={testCallInProgress}
                >
                  {testCallInProgress ? 'Chiamata in corso...' : '📞 Chiama Ora'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTestCallModal(false)}
                  disabled={testCallInProgress}
                >
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

export default CampaignDetail;
