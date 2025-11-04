import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Assistants() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    voice: 'alloy',
    language: 'it',
    prompt: '',
    max_duration: 300
  });

  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      const response = await axios.get('/api/assistants');
      setAssistants(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading assistants:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/assistants', formData);
      alert('Assistente creato con successo!');
      setShowModal(false);
      setFormData({
        name: '',
        voice: 'alloy',
        language: 'it',
        prompt: '',
        max_duration: 300
      });
      loadAssistants();
    } catch (error) {
      alert('Errore durante la creazione: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo assistente?')) return;

    try {
      await axios.delete(`/api/assistants/${id}`);
      alert('Assistente eliminato con successo!');
      loadAssistants();
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
        <h2>Assistenti AI</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Crea Assistente
        </button>
      </div>

      <div className="card">
        {assistants.length === 0 ? (
          <div className="empty-state">
            <h3>Nessun assistente configurato</h3>
            <p>Crea il tuo primo assistente AI per le campagne outbound</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Crea Assistente
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {assistants.map(assistant => (
              <div key={assistant.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ marginBottom: '5px' }}>{assistant.name}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Voce: {assistant.voice} | Lingua: {assistant.language} | Durata max: {assistant.max_duration}s
                    </p>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(assistant.id)}
                  >
                    Elimina
                  </button>
                </div>
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Prompt:</h4>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {assistant.prompt}
                  </p>
                </div>
                {assistant.telnyx_assistant_id && (
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                    Telnyx ID: {assistant.telnyx_assistant_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assistant Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Crea Nuovo Assistente AI</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome Assistente *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Assistente Vendite"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Voce</label>
                  <select
                    value={formData.voice}
                    onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                  >
                    {voices.map(voice => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lingua</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Durata Massima (secondi)</label>
                <input
                  type="number"
                  value={formData.max_duration}
                  onChange={(e) => setFormData({ ...formData, max_duration: parseInt(e.target.value) })}
                  min="60"
                  max="600"
                />
              </div>
              <div className="form-group">
                <label>Prompt *</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows="10"
                  placeholder="Inserisci le istruzioni per l'assistente AI. Esempio:

Sei un assistente virtuale che chiama potenziali clienti per fissare appuntamenti.
Il tuo obiettivo è:
1. Presentarti in modo cordiale
2. Spiegare brevemente il servizio offerto
3. Verificare l'interesse del contatto
4. Fissare un appuntamento per una demo

Mantieni un tono professionale ma amichevole.
Se il contatto non è interessato, ringrazia e chiudi educatamente."
                  required
                />
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Crea Assistente</button>
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

export default Assistants;
