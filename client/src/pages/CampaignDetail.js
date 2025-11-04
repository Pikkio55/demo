import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <span className={`status-badge status-${campaign.status}`} style={{ fontSize: '16px', padding: '8px 16px' }}>
          {campaign.status}
        </span>
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
    </div>
  );
}

export default CampaignDetail;
