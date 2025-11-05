<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appuntamenti - Telnyx Campaigns</title>
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
            <a href="appointments.php" class="active">Appuntamenti</a>
        </div>
    </nav>

    <div class="main-content">
        <div class="page-header">
            <h2>Gestione Appuntamenti</h2>
        </div>

        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>Lead</th>
                        <th>Telefono</th>
                        <th>Email</th>
                        <th>Azienda</th>
                        <th>Campagna</th>
                        <th>Data Appuntamento</th>
                        <th>Stato</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody id="appointmentsTable">
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px;">Caricamento...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script src="assets/app.js"></script>
    <script>
        let appointments = [];

        // Load appointments
        async function loadAppointments() {
            try {
                appointments = await apiGet('/api/appointments.php');
                renderAppointments();
            } catch (error) {
                console.error('Error loading appointments:', error);
                showNotification('Errore caricamento appuntamenti', 'error');
            }
        }

        // Render appointments table
        function renderAppointments() {
            const tbody = document.getElementById('appointmentsTable');
            if (appointments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Nessun appuntamento trovato</td></tr>';
                return;
            }

            tbody.innerHTML = appointments.map(appointment => `
                <tr>
                    <td>${appointment.first_name} ${appointment.last_name}</td>
                    <td>${formatPhoneNumber(appointment.phone_number)}</td>
                    <td>${appointment.email || '-'}</td>
                    <td>${appointment.company || '-'}</td>
                    <td>${appointment.campaign_name}</td>
                    <td>${formatDateTime(appointment.appointment_date)}</td>
                    <td>${getStatusBadge(appointment.status)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteAppointment('${appointment.id}')">
                            Elimina
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Delete appointment
        async function deleteAppointment(id) {
            if (!confirmAction('Sei sicuro di voler eliminare questo appuntamento?')) return;

            try {
                await apiDelete(`/api/appointments.php?path=${id}`);
                showNotification('Appuntamento eliminato con successo!', 'success');
                loadAppointments();
            } catch (error) {
                console.error('Error deleting appointment:', error);
                showNotification('Errore eliminazione appuntamento', 'error');
            }
        }

        loadAppointments();
    </script>
</body>
</html>
