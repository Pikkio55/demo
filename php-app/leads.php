<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leads - Telnyx Campaigns</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="navbar-brand">
            <h1>📞 Telnyx Campaigns</h1>
        </div>
        <div class="navbar-links">
            <a href="index.php">Dashboard</a>
            <a href="leads.php" class="active">Leads</a>
            <a href="campaigns.php">Campagne</a>
            <a href="assistants.php">Assistenti AI</a>
            <a href="appointments.php">Appuntamenti</a>
        </div>
    </nav>

    <div class="main-content">
        <div class="page-header">
            <h2>Gestione Lead</h2>
            <div>
                <button class="btn btn-secondary" onclick="openModal('uploadCsvModal')">Carica CSV</button>
                <button class="btn btn-primary" onclick="openModal('addLeadModal')">Aggiungi Lead</button>
            </div>
        </div>

        <div class="card">
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
                <tbody id="leadsTable">
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">Caricamento...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add Lead Modal -->
    <div id="addLeadModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Aggiungi Lead</h3>
                <span class="close-modal" onclick="closeModal('addLeadModal')">&times;</span>
            </div>
            <form id="addLeadForm" onsubmit="handleAddLead(event)">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" name="first_name" required>
                </div>
                <div class="form-group">
                    <label>Cognome *</label>
                    <input type="text" name="last_name" required>
                </div>
                <div class="form-group">
                    <label>Telefono *</label>
                    <input type="tel" name="phone_number" placeholder="+393331234567" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email">
                </div>
                <div class="form-group">
                    <label>Azienda</label>
                    <input type="text" name="company">
                </div>
                <div class="form-group">
                    <label>Note</label>
                    <textarea name="notes"></textarea>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('addLeadModal')">Annulla</button>
                    <button type="submit" class="btn btn-primary">Salva Lead</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Upload CSV Modal -->
    <div id="uploadCsvModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Carica Lead da CSV</h3>
                <span class="close-modal" onclick="closeModal('uploadCsvModal')">&times;</span>
            </div>
            <form id="uploadCsvForm" onsubmit="handleUploadCsv(event)">
                <div class="form-group">
                    <label>File CSV</label>
                    <input type="file" name="file" accept=".csv" required>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">
                        Il file CSV deve contenere le colonne: first_name, last_name, phone_number, email, company
                    </p>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('uploadCsvModal')">Annulla</button>
                    <button type="submit" class="btn btn-primary">Carica CSV</button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/app.js"></script>
    <script>
        let leads = [];

        // Load leads
        async function loadLeads() {
            try {
                leads = await apiGet('/api/leads.php');
                renderLeads();
            } catch (error) {
                console.error('Error loading leads:', error);
                showNotification('Errore caricamento leads', 'error');
            }
        }

        // Render leads table
        function renderLeads() {
            const tbody = document.getElementById('leadsTable');
            if (leads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Nessun lead trovato</td></tr>';
                return;
            }

            tbody.innerHTML = leads.map(lead => `
                <tr>
                    <td>${lead.first_name}</td>
                    <td>${lead.last_name}</td>
                    <td>${formatPhoneNumber(lead.phone_number)}</td>
                    <td>${lead.email || '-'}</td>
                    <td>${lead.company || '-'}</td>
                    <td>${getStatusBadge(lead.status || 'new')}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteLead('${lead.id}', '${lead.first_name} ${lead.last_name}')">
                            Elimina
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Add lead
        async function handleAddLead(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);

            try {
                await apiPost('/api/leads.php', data);
                showNotification('Lead aggiunto con successo!', 'success');
                closeModal('addLeadModal');
                event.target.reset();
                loadLeads();
            } catch (error) {
                console.error('Error adding lead:', error);
                showNotification('Errore aggiunta lead', 'error');
            }
        }

        // Upload CSV
        async function handleUploadCsv(event) {
            event.preventDefault();
            const formData = new FormData(event.target);

            try {
                const response = await fetch(`${API_BASE}/api/leads.php`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Upload failed');

                const result = await response.json();
                showNotification(`${result.count} lead importati con successo!`, 'success');
                closeModal('uploadCsvModal');
                event.target.reset();
                loadLeads();
            } catch (error) {
                console.error('Error uploading CSV:', error);
                showNotification('Errore caricamento CSV', 'error');
            }
        }

        // Delete lead
        async function deleteLead(id, name) {
            if (!confirmAction(`Sei sicuro di voler eliminare il lead "${name}"?`)) return;

            try {
                await apiDelete(`/api/leads.php?path=${id}`);
                showNotification('Lead eliminato con successo!', 'success');
                loadLeads();
            } catch (error) {
                console.error('Error deleting lead:', error);
                showNotification('Errore eliminazione lead', 'error');
            }
        }

        loadLeads();
    </script>
</body>
</html>
