<?php
require_once 'config.php';

$db = getDB();

// Create tables
$schema = "
-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    company TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Assistants table
CREATE TABLE IF NOT EXISTS assistants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    voice TEXT DEFAULT 'alloy',
    language TEXT DEFAULT 'it',
    prompt TEXT NOT NULL,
    max_duration INTEGER DEFAULT 300,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    assistant_id TEXT,
    telnyx_assistant_id TEXT,
    phone_number TEXT,
    connection_id TEXT,
    status TEXT DEFAULT 'draft',
    total_leads INTEGER DEFAULT 0,
    calls_made INTEGER DEFAULT 0,
    appointments_booked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assistant_id) REFERENCES assistants(id)
);

-- Campaign Leads junction table
CREATE TABLE IF NOT EXISTS campaign_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    call_status TEXT DEFAULT 'pending',
    call_id TEXT,
    call_duration INTEGER,
    appointment_booked INTEGER DEFAULT 0,
    called_at DATETIME,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    UNIQUE(campaign_id, lead_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    appointment_date DATETIME NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
";

try {
    // Execute schema
    $db->exec($schema);

    // Check if we need to add demo data
    $count = $db->query("SELECT COUNT(*) FROM leads")->fetchColumn();

    if ($count == 0) {
        echo "Creating demo data...\n";

        // Add demo leads
        $leads = [
            ['lead-1', 'Mario', 'Rossi', '+393331234567', 'mario.rossi@example.com', 'Acme Inc'],
            ['lead-2', 'Laura', 'Bianchi', '+393349876543', 'laura.bianchi@example.com', 'Tech Solutions'],
            ['lead-3', 'Giuseppe', 'Verdi', '+393357654321', 'giuseppe.verdi@example.com', 'Digital Marketing'],
            ['lead-4', 'Laura', 'Bianchi', '+393349876543', 'laura.bianchi@example.com', 'Tech Solutions']
        ];

        $stmt = $db->prepare("INSERT INTO leads (id, first_name, last_name, phone_number, email, company) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($leads as $lead) {
            $stmt->execute($lead);
        }

        // Add demo assistant
        $db->exec("INSERT INTO assistants (id, name, voice, language, prompt, max_duration) VALUES
            ('assistant-1', 'Assistente Vendite', 'alloy', 'it', 'Sei un assistente virtuale per la prenotazione di appuntamenti. Il tuo obiettivo è parlare con i potenziali clienti e fissare un appuntamento telefonico con il nostro team di vendita.', 300)");

        // Add demo campaign
        $db->exec("INSERT INTO campaigns (id, name, description, assistant_id, status, total_leads) VALUES
            ('campaign-1', 'Campagna Demo Novembre 2025', 'Prima campagna di test per dimostrare il sistema', 'assistant-1', 'draft', 2)");

        // Add leads to campaign
        $db->exec("INSERT INTO campaign_leads (campaign_id, lead_id) VALUES ('campaign-1', 'lead-1'), ('campaign-1', 'lead-2')");

        echo "✅ Demo data created successfully!\n";
    }

    echo "✅ Database initialized successfully!\n";

} catch (PDOException $e) {
    die("❌ Database initialization failed: " . $e->getMessage() . "\n");
}
?>
