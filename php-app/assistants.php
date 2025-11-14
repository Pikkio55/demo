<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assistenti AI - Telnyx Campaigns</title>
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
            <a href="assistants.php" class="active">Assistenti AI</a>
            <a href="appointments.php">Appuntamenti</a>
        </div>
    </nav>

    <div class="main-content">
        <div class="page-header">
            <h2>Gestione Assistenti AI</h2>
            <button class="btn btn-primary" onclick="openModal('addAssistantModal')">Nuovo Assistente</button>
        </div>

        <div id="assistantsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
            <div class="card" style="text-align: center; padding: 60px;">
                <div class="spinner" style="margin: 0 auto;"></div>
                <p style="margin-top: 20px;">Caricamento...</p>
            </div>
        </div>
    </div>

    <!-- Add Assistant Modal -->
    <div id="addAssistantModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Nuovo Assistente AI</h3>
                <span class="close-modal" onclick="closeModal('addAssistantModal')">&times;</span>
            </div>
            <form id="addAssistantForm" onsubmit="handleAddAssistant(event)">
                <div class="form-group">
                    <label>Nome Assistente *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Voce</label>
                    <select name="voice">
                        <option value="alloy">Alloy</option>
                        <option value="echo">Echo</option>
                        <option value="fable">Fable</option>
                        <option value="onyx">Onyx</option>
                        <option value="nova">Nova</option>
                        <option value="shimmer">Shimmer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Lingua</label>
                    <select name="language">
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Prompt Sistema *</label>
                    <textarea name="prompt" rows="6" required placeholder="Es: Sei un assistente virtuale per la prenotazione di appuntamenti..."></textarea>
                </div>
                <div class="form-group">
                    <label>Durata Massima (secondi)</label>
                    <input type="number" name="max_duration" value="300">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('addAssistantModal')">Annulla</button>
                    <button type="submit" class="btn btn-primary">Crea Assistente</button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/app.js"></script>
    <script>
        let assistants = [];

        // Load assistants
        async function loadAssistants() {
            try {
                assistants = await apiGet('/api/assistants.php');
                renderAssistants();
            } catch (error) {
                console.error('Error loading assistants:', error);
                showNotification('Errore caricamento assistenti', 'error');
            }
        }

        // Render assistants grid
        function renderAssistants() {
            const grid = document.getElementById('assistantsGrid');
            if (assistants.length === 0) {
                grid.innerHTML = '<div class="card" style="text-align: center; padding: 60px;"><p>Nessun assistente trovato</p></div>';
                return;
            }

            grid.innerHTML = assistants.map(assistant => `
                <div class="card">
                    <h3 style="margin-bottom: 15px;">${assistant.name}</h3>
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Voce:</span>
                            <strong>${assistant.voice}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Lingua:</span>
                            <strong>${assistant.language.toUpperCase()}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Durata Max:</span>
                            <strong>${assistant.max_duration}s</strong>
                        </div>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px; max-height: 100px; overflow-y: auto;">
                        <p style="font-size: 13px; color: #666; line-height: 1.6;">${assistant.prompt}</p>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn btn-danger btn-sm" onclick="deleteAssistant('${assistant.id}', '${assistant.name}')">
                            Elimina
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Add assistant
        async function handleAddAssistant(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);

            try {
                await apiPost('/api/assistants.php', data);
                showNotification('Assistente creato con successo!', 'success');
                closeModal('addAssistantModal');
                event.target.reset();
                loadAssistants();
            } catch (error) {
                console.error('Error creating assistant:', error);
                showNotification('Errore creazione assistente', 'error');
            }
        }

        // Delete assistant
        async function deleteAssistant(id, name) {
            if (!confirmAction(`Sei sicuro di voler eliminare l'assistente "${name}"?`)) return;

            try {
                await apiDelete(`/api/assistants.php?path=${id}`);
                showNotification('Assistente eliminato con successo!', 'success');
                loadAssistants();
            } catch (error) {
                console.error('Error deleting assistant:', error);
                showNotification('Errore eliminazione assistente', 'error');
            }
        }

        loadAssistants();
    </script>
</body>
</html>
