import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalAppointments: 0,
    callsToday: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [leadsRes, campaignsRes, appointmentsRes] = await Promise.all([
        axios.get('/api/leads'),
        axios.get('/api/campaigns'),
        axios.get('/api/appointments')
      ]);

      const campaigns = campaignsRes.data;
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

      setStats({
        totalLeads: leadsRes.data.length,
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns,
        totalAppointments: appointmentsRes.data.length,
        callsToday: campaigns.reduce((sum, c) => sum + (c.called_leads || 0), 0)
      });

      setRecentCampaigns(campaigns.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Lead Totali</h3>
          <div className="stat-value">{stats.totalLeads}</div>
          <div className="stat-label">lead nel database</div>
        </div>

        <div className="stat-card">
          <h3>Campagne</h3>
          <div className="stat-value">{stats.totalCampaigns}</div>
          <div className="stat-label">{stats.activeCampaigns} attive</div>
        </div>

        <div className="stat-card">
          <h3>Appuntamenti</h3>
          <div className="stat-value">{stats.totalAppointments}</div>
          <div className="stat-label">appuntamenti presi</div>
        </div>

        <div className="stat-card">
          <h3>Chiamate</h3>
          <div className="stat-value">{stats.callsToday}</div>
          <div className="stat-label">totali effettuate</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Campagne Recenti</h3>
        {recentCampaigns.length === 0 ? (
          <p style={{ color: '#999' }}>Nessuna campagna creata ancora.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Stato</th>
                <th>Lead Totali</th>
                <th>Chiamate</th>
                <th>Appuntamenti</th>
                <th>Data Creazione</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td>{campaign.name}</td>
                  <td>
                    <span className={`status-badge status-${campaign.status}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td>{campaign.total_leads}</td>
                  <td>{campaign.called_leads}</td>
                  <td>{campaign.successful_appointments}</td>
                  <td>{new Date(campaign.created_at).toLocaleDateString('it-IT')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
