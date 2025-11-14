<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dettaglio Campagna - Telnyx Campaigns</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="navbar-brand">
            <h1>📞 Telnyx Campaigns</h1>
        </div>
        <div class="navbar-links">
            <a href="index.php">Dashboard</a>
            <a href="leads.php">Leads</a>
            <a href="campaigns.php">Campagne</a>
            <a href="assistants.php">Assistenti AI</a>
            <a href="appointments.php">Appuntamenti</a>
        </div>
    </nav>

    <div class="main-content">
        <div class="page-header">
            <div>
                <a href="campaigns.php" style="display: block; margin-bottom: 10px;">← Torna alle campagne</a>
                <h2 id="campaignName">Caricamento...</h2>
                <p id="campaignDescription" style="color: #666; margin-top: 5px;"></p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button class="btn btn-secondary btn-sm" onclick="openModal('testCallModal')">🧪 Test Call</button>
                <span id="campaignStatus"></span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Lead Totali</h3>
                <div class="stat-value" id="totalLeads">-</div>
            </div>
            <div class="stat-card">
                <h3>Chiamate</h3>
                <div class="stat-value" id="callsMade">-</div>
                <div class="stat-label" id="callsLabel">su -</div>
            </div>
            <div class="stat-card">
                <h3>Appuntamenti</h3>
                <div class="stat-value" id="appointmentsBooked">-</div>
                <div class="stat-label" id="conversionRate">0.0% tasso conversione</div>
            </div>
            <div class="stat-card">
                <h3>In Attesa</h3>
                <div class="stat-value" id="pendingLeads">-</div>
                <div class="stat-label">lead da chiamare</div>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-bottom: 20px;">Lead della Campagna</h3>
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
                <tbody id="leadsTable">
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px;">Caricamento...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Test Call Modal -->
    <div id="testCallModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>🧪 Test Call</h3>
                <span class="close-modal" onclick="closeModal('testCallModal')">&times;</span>
            </div>
            <p style="margin-bottom: 20px; color: #666;">
                Questa chiamata test utilizzerà la configurazione della campagna corrente.
            </p>
            <form id="testCallForm" onsubmit="handleTestCall(event)">
                <div class="form-group">
                    <label>Numero da Chiamare *</label>
                    <input type="tel" name="to" placeholder="+393331234567" required>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('testCallModal')">Annulla</button>
                    <button type="submit" class="btn btn-success">Avvia Chiamata Test</button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/app.js"></script>
    <script>
        const campaignId = new URLSearchParams(window.location.search).get('id');
        let campaign = null;
        let leads = [];

        // Load campaign data
        async function loadCampaign() {
            if (!campaignId) {
                showNotification('ID campagna non valido', 'error');
                return;
            }

            try {
                [campaign, leads] = await Promise.all([
                    apiGet(`/api/campaigns.php?path=${campaignId}`),
                    apiGet(`/api/campaigns.php?path=${campaignId}/leads`)
                ]);

                renderCampaign();
                renderLeads();
            } catch (error) {
                console.error('Error loading campaign:', error);
                showNotification('Errore caricamento campagna', 'error');
            }
        }

        // Render campaign details
        function renderCampaign() {
            document.getElementById('campaignName').textContent = campaign.name;
            document.getElementById('campaignDescription').textContent = campaign.description || '';
            document.getElementById('campaignStatus').innerHTML = getStatusBadge(campaign.status) + ' style="font-size: 16px; padding: 8px 16px;"';

            // Stats
            const totalLeads = campaign.total_leads || 0;
            const callsMade = campaign.calls_made || 0;
            const appointmentsBooked = campaign.appointments_booked || 0;
            const pendingLeads = leads.filter(l => l.call_status === 'pending').length;
            const convRate = callsMade > 0 ? ((appointmentsBooked / callsMade) * 100).toFixed(1) : '0.0';

            document.getElementById('totalLeads').textContent = totalLeads;
            document.getElementById('callsMade').textContent = callsMade;
            document.getElementById('callsLabel').textContent = `su ${totalLeads}`;
            document.getElementById('appointmentsBooked').textContent = appointmentsBooked;
            document.getElementById('conversionRate').textContent = `${convRate}% tasso conversione`;
            document.getElementById('pendingLeads').textContent = pendingLeads;
        }

        // Render leads table
        function renderLeads() {
            const tbody = document.getElementById('leadsTable');
            if (leads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Nessun lead in questa campagna</td></tr>';
                return;
            }

            tbody.innerHTML = leads.map(lead => `
                <tr>
                    <td>${lead.first_name} ${lead.last_name}</td>
                    <td>${formatPhoneNumber(lead.phone_number)}</td>
                    <td>${lead.email || '-'}</td>
                    <td>${lead.company || '-'}</td>
                    <td>${getStatusBadge(lead.call_status || 'pending')}</td>
                    <td>${formatDuration(lead.call_duration)}</td>
                    <td>
                        ${lead.appointment_booked
                            ? '<span style="color: #28a745;">✓ Sì</span>'
                            : '<span style="color: #dc3545;">✗ No</span>'}
                    </td>
                    <td>${formatDateTime(lead.called_at)}</td>
                </tr>
            `).join('');
        }

        // Handle test call
        async function handleTestCall(event) {
            event.preventDefault();
            const formData = new FormData(event.target);

            const data = {
                to: formData.get('to'),
                from: campaign.phone_number,
                assistant_id: campaign.telnyx_assistant_id,
                connection_id: campaign.connection_id
            };

            try {
                const result = await apiPost('/api/telnyx.php?path=test-call', data);
                showNotification(`✅ Chiamata test avviata! Call ID: ${result.call_id}`, 'success');
                closeModal('testCallModal');
                event.target.reset();
            } catch (error) {
                console.error('Error making test call:', error);
                showNotification('Errore avvio chiamata test', 'error');
            }
        }

        loadCampaign();
    </script>
</body>
</html>
