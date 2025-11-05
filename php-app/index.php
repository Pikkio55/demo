<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Telnyx Campaigns</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="navbar-brand">
            <h1>📞 Telnyx Campaigns</h1>
        </div>
        <div class="navbar-links">
            <a href="index.php" class="active">Dashboard</a>
            <a href="leads.php">Leads</a>
            <a href="campaigns.php">Campagne</a>
            <a href="assistants.php">Assistenti AI</a>
            <a href="appointments.php">Appuntamenti</a>
        </div>
    </nav>

    <div class="main-content">
        <div class="page-header">
            <h2>Dashboard</h2>
        </div>

        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <h3>Lead Totali</h3>
                <div class="stat-value" id="totalLeads">-</div>
                <div class="stat-label">lead nel database</div>
            </div>

            <div class="stat-card">
                <h3>Campagne</h3>
                <div class="stat-value" id="totalCampaigns">-</div>
                <div class="stat-label"><span id="activeCampaigns">0</span> attive</div>
            </div>

            <div class="stat-card">
                <h3>Appuntamenti</h3>
                <div class="stat-value" id="totalAppointments">-</div>
                <div class="stat-label">appuntamenti presi</div>
            </div>

            <div class="stat-card">
                <h3>Chiamate</h3>
                <div class="stat-value" id="totalCalls">-</div>
                <div class="stat-label">totali effettuate</div>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-bottom: 20px;">Campagne Recenti</h3>
            <table id="campaignsTable">
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
                <tbody id="campaignsBody">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            Caricamento...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script src="assets/app.js"></script>
    <script>
        // Load dashboard data
        async function loadDashboard() {
            try {
                const [leads, campaigns, appointments] = await Promise.all([
                    apiGet('/api/leads.php'),
                    apiGet('/api/campaigns.php'),
                    apiGet('/api/appointments.php')
                ]);

                // Update stats
                document.getElementById('totalLeads').textContent = leads.length;
                document.getElementById('totalCampaigns').textContent = campaigns.length;
                document.getElementById('activeCampaigns').textContent = campaigns.filter(c => c.status === 'active').length;
                document.getElementById('totalAppointments').textContent = appointments.length;

                const totalCalls = campaigns.reduce((sum, c) => sum + (c.calls_made || 0), 0);
                document.getElementById('totalCalls').textContent = totalCalls;

                // Render campaigns table
                const tbody = document.getElementById('campaignsBody');
                if (campaigns.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Nessuna campagna trovata</td></tr>';
                } else {
                    tbody.innerHTML = campaigns.map(campaign => `
                        <tr>
                            <td><a href="campaign-detail.php?id=${campaign.id}">${campaign.name}</a></td>
                            <td>${getStatusBadge(campaign.status)}</td>
                            <td>${campaign.total_leads || 0}</td>
                            <td>${campaign.calls_made || 0}</td>
                            <td>${campaign.appointments_booked || 0}</td>
                            <td>${formatDate(campaign.created_at)}</td>
                        </tr>
                    `).join('');
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
                showNotification('Errore caricamento dashboard', 'error');
            }
        }

        loadDashboard();
    </script>
</body>
</html>
