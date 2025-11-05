<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campagne - Telnyx Campaigns</title>
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
            <a href="campaigns.php" class="active">Campagne</a>
            <a href="assistants.php">Assistenti AI</a>
            <a href="appointments.php">Appuntamenti</a>
        </div>
    </nav>

    <div class="main-content">
        <div class="page-header">
            <h2>Gestione Campagne</h2>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="openModal('testCallModal')">🧪 Test Call</button>
                <button class="btn btn-primary" onclick="openModal('addCampaignModal')">Nuova Campagna</button>
            </div>
        </div>

        <div class="card">
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
                <tbody id="campaignsTable">
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">Caricamento...</td>
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
            <form id="testCallForm" onsubmit="handleTestCall(event)">
                <div class="form-group">
                    <label>Numero da Chiamare *</label>
                    <input type="tel" name="to" placeholder="+393331234567" required>
                </div>
                <div class="form-group">
                    <label>Telnyx Assistant ID</label>
                    <select name="assistant_id" id="testAssistantSelect">
                        <option value="">Caricamento...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Numero Telnyx (From) *</label>
                    <select name="from" id="testPhoneSelect" required>
                        <option value="">Caricamento...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Connection ID (opzionale)</label>
                    <input type="text" name="connection_id" placeholder="1234567890">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('testCallModal')">Annulla</button>
                    <button type="submit" class="btn btn-success">Avvia Chiamata Test</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Campaign Modal -->
    <div id="addCampaignModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Nuova Campagna</h3>
                <span class="close-modal" onclick="closeModal('addCampaignModal')">&times;</span>
            </div>
            <form id="addCampaignForm" onsubmit="handleAddCampaign(event)">
                <div class="form-group">
                    <label>Nome Campagna *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Descrizione</label>
                    <textarea name="description"></textarea>
                </div>
                <div class="form-group">
                    <label>Assistente AI Locale</label>
                    <select name="assistant_id" id="assistantSelect">
                        <option value="">Seleziona assistente...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Telnyx Assistant ID</label>
                    <select name="telnyx_assistant_id" id="telnyxAssistantSelect">
                        <option value="">Caricamento...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Numero Telefono *</label>
                    <select name="phone_number" id="phoneNumberSelect" required>
                        <option value="">Caricamento...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Connection ID (opzionale)</label>
                    <input type="text" name="connection_id">
                </div>
                <div class="form-group">
                    <label>Seleziona Lead</label>
                    <div id="leadsList" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 6px;">
                        <p>Caricamento lead...</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('addCampaignModal')">Annulla</button>
                    <button type="submit" class="btn btn-primary">Crea Campagna</button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/app.js"></script>
    <script>
        let campaigns = [];
        let assistants = [];
        let telnyxAssistants = [];
        let phoneNumbers = [];
        let leads = [];
        let selectedLeads = [];

        // Load all data
        async function loadData() {
            try {
                [campaigns, assistants, leads] = await Promise.all([
                    apiGet('/api/campaigns.php'),
                    apiGet('/api/assistants.php'),
                    apiGet('/api/leads.php')
                ]);
                renderCampaigns();
                loadTelnyxResources();
            } catch (error) {
                console.error('Error loading data:', error);
                showNotification('Errore caricamento dati', 'error');
            }
        }

        // Load Telnyx resources
        async function loadTelnyxResources() {
            try {
                [telnyxAssistants, phoneNumbers] = await Promise.all([
                    apiGet('/api/telnyx.php?path=assistants').catch(() => []),
                    apiGet('/api/telnyx.php?path=phone-numbers').catch(() => [])
                ]);
                populateSelects();
            } catch (error) {
                console.error('Error loading Telnyx resources:', error);
            }
        }

        // Populate form selects
        function populateSelects() {
            // Local assistants
            const assistantSelect = document.getElementById('assistantSelect');
            assistantSelect.innerHTML = '<option value="">Nessun assistente locale</option>' +
                assistants.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

            // Telnyx assistants
            const telnyxAssistantSelects = [
                document.getElementById('telnyxAssistantSelect'),
                document.getElementById('testAssistantSelect')
            ];

            telnyxAssistantSelects.forEach(select => {
                if (telnyxAssistants.length > 0) {
                    select.innerHTML = '<option value="">Seleziona assistant Telnyx...</option>' +
                        telnyxAssistants.map(a => `<option value="${a.id}">${a.name || a.id}</option>`).join('');
                } else {
                    select.innerHTML = '<option value="">Nessun assistant disponibile (controlla API key)</option>';
                }
            });

            // Phone numbers
            const phoneSelects = [
                document.getElementById('phoneNumberSelect'),
                document.getElementById('testPhoneSelect')
            ];

            phoneSelects.forEach(select => {
                if (phoneNumbers.length > 0) {
                    select.innerHTML = '<option value="">Seleziona numero...</option>' +
                        phoneNumbers.map(p => `<option value="${p.phone_number}">${p.phone_number}</option>`).join('');
                } else {
                    select.innerHTML = '<option value="">Nessun numero disponibile (controlla API key)</option>';
                }
            });

            // Leads list
            renderLeadsList();
        }

        // Render leads list
        function renderLeadsList() {
            const leadsList = document.getElementById('leadsList');
            if (leads.length === 0) {
                leadsList.innerHTML = '<p>Nessun lead disponibile</p>';
                return;
            }

            leadsList.innerHTML = leads.map(lead => `
                <label style="display: block; margin-bottom: 10px; cursor: pointer;">
                    <input type="checkbox" value="${lead.id}" onchange="toggleLead('${lead.id}')">
                    ${lead.first_name} ${lead.last_name} - ${lead.phone_number}
                </label>
            `).join('');
        }

        // Toggle lead selection
        function toggleLead(leadId) {
            const index = selectedLeads.indexOf(leadId);
            if (index > -1) {
                selectedLeads.splice(index, 1);
            } else {
                selectedLeads.push(leadId);
            }
        }

        // Render campaigns table
        function renderCampaigns() {
            const tbody = document.getElementById('campaignsTable');
            if (campaigns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Nessuna campagna trovata</td></tr>';
                return;
            }

            tbody.innerHTML = campaigns.map(campaign => {
                const convRate = campaign.calls_made > 0
                    ? ((campaign.appointments_booked / campaign.calls_made) * 100).toFixed(1)
                    : '0.0';

                return `
                    <tr>
                        <td><a href="campaign-detail.php?id=${campaign.id}">${campaign.name}</a></td>
                        <td>${getStatusBadge(campaign.status)}</td>
                        <td>${campaign.total_leads || 0}</td>
                        <td>${campaign.calls_made || 0}</td>
                        <td>${campaign.appointments_booked || 0}</td>
                        <td>${convRate}%</td>
                        <td>
                            ${campaign.status === 'draft' ? `
                                <button class="btn btn-success btn-sm" style="margin-right: 5px;" onclick="startCampaign('${campaign.id}')">
                                    Avvia
                                </button>
                            ` : ''}
                            <button class="btn btn-danger btn-sm" onclick="deleteCampaign('${campaign.id}', '${campaign.name}')">
                                Elimina
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Handle test call
        async function handleTestCall(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);

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

        // Handle add campaign
        async function handleAddCampaign(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);
            data.lead_ids = selectedLeads;

            try {
                await apiPost('/api/campaigns.php', data);
                showNotification('Campagna creata con successo!', 'success');
                closeModal('addCampaignModal');
                event.target.reset();
                selectedLeads = [];
                loadData();
            } catch (error) {
                console.error('Error creating campaign:', error);
                showNotification('Errore creazione campagna', 'error');
            }
        }

        // Start campaign
        async function startCampaign(id) {
            if (!confirmAction('Sei sicuro di voler avviare questa campagna?')) return;

            try {
                await apiPost(`/api/campaigns.php?path=${id}/start`, {});
                showNotification('Campagna avviata con successo!', 'success');
                loadData();
            } catch (error) {
                console.error('Error starting campaign:', error);
                showNotification('Errore avvio campagna', 'error');
            }
        }

        // Delete campaign
        async function deleteCampaign(id, name) {
            if (!confirmAction(`Sei sicuro di voler eliminare la campagna "${name}"?`)) return;

            try {
                await apiDelete(`/api/campaigns.php?path=${id}`);
                showNotification('Campagna eliminata con successo!', 'success');
                loadData();
            } catch (error) {
                console.error('Error deleting campaign:', error);
                showNotification('Errore eliminazione campagna', 'error');
            }
        }

        loadData();
    </script>
</body>
</html>
