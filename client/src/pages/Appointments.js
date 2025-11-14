import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, scheduled, completed, cancelled

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status: newStatus });
      alert('Stato aggiornato con successo!');
      loadAppointments();
    } catch (error) {
      alert('Errore durante l\'aggiornamento: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;

    try {
      await axios.delete(`/api/appointments/${id}`);
      alert('Appuntamento eliminato con successo!');
      loadAppointments();
    } catch (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const upcomingCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Gestione Appuntamenti</h2>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <h3>Totale</h3>
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-label">appuntamenti totali</div>
        </div>
        <div className="stat-card">
          <h3>Programmati</h3>
          <div className="stat-value">{upcomingCount}</div>
          <div className="stat-label">in attesa</div>
        </div>
        <div className="stat-card">
          <h3>Completati</h3>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">già effettuati</div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('all')}
          >
            Tutti
          </button>
          <button
            className={`btn ${filter === 'scheduled' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('scheduled')}
          >
            Programmati
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('completed')}
          >
            Completati
          </button>
          <button
            className={`btn ${filter === 'cancelled' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('cancelled')}
          >
            Cancellati
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <h3>Nessun appuntamento</h3>
            <p>Gli appuntamenti fissati dagli assistenti AI appariranno qui</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data/Ora</th>
                <th>Lead</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Campagna</th>
                <th>Stato</th>
                <th>Note</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>
                    {new Date(appointment.appointment_date).toLocaleString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>{appointment.first_name} {appointment.last_name}</td>
                  <td>{appointment.phone_number}</td>
                  <td>{appointment.email || '-'}</td>
                  <td>{appointment.campaign_name}</td>
                  <td>
                    <select
                      className={`status-badge status-${appointment.status}`}
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <option value="scheduled">Programmato</option>
                      <option value="completed">Completato</option>
                      <option value="cancelled">Cancellato</option>
                      <option value="rescheduled">Riprogrammato</option>
                    </select>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appointment.notes || '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(appointment.id)}
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
    </div>
  );
}

export default Appointments;
