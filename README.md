# Telnyx Outbound Campaigns

Una webapp completa per gestire campagne outbound con assistenti AI di Telnyx. Gli assistenti chiamano automaticamente i lead e cercano di fissare appuntamenti telefonici.

## Caratteristiche

- **Gestione Lead**: Aggiungi lead manualmente o carica file CSV
- **Assistenti AI**: Configura assistenti AI personalizzati con prompt specifici
- **Campagne Outbound**: Crea e gestisci campagne di chiamate automatiche
- **Monitoraggio Real-time**: Dashboard con statistiche e KPI in tempo reale
- **Gestione Appuntamenti**: Visualizza e gestisci tutti gli appuntamenti fissati
- **Webhook Integration**: Ricevi aggiornamenti in tempo reale da Telnyx

## Stack Tecnologico

- **Backend**: Node.js + Express
- **Frontend**: React
- **Database**: SQLite
- **API**: Telnyx AI Assistants API

## Prerequisiti

- Node.js 16+ installato
- Account Telnyx con:
  - API Key
  - Almeno un numero di telefono configurato
  - Credito per le chiamate

## Installazione

1. **Clona il repository**
```bash
git clone <repository-url>
cd telnyx-outbound-campaigns
```

2. **Installa le dipendenze**
```bash
npm install
cd client && npm install
cd ..
```

3. **Configura le variabili d'ambiente**
```bash
cp .env.example .env
```

Modifica il file `.env` con le tue credenziali Telnyx:
```
TELNYX_API_KEY=your_api_key_here
TELNYX_PHONE_NUMBER=+1234567890
WEBHOOK_URL=https://your-domain.com/api/webhooks/telnyx
PORT=3001
```

4. **Avvia l'applicazione**

Sviluppo (backend + frontend):
```bash
npm run dev
```

Solo backend:
```bash
npm run server
```

Solo frontend:
```bash
npm run client
```

Produzione:
```bash
npm run build
npm start
```

## Setup Webhook con ngrok (Sviluppo)

Per ricevere webhook da Telnyx in locale:

1. Installa ngrok: https://ngrok.com/download

2. Avvia ngrok:
```bash
ngrok http 3001
```

3. Copia l'URL HTTPS fornito da ngrok (es. `https://abc123.ngrok.io`)

4. Aggiorna il `.env`:
```
WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks/telnyx
```

5. Riavvia il server

## Utilizzo

### 1. Aggiungi Lead

- Vai su **Leads**
- Clicca "Aggiungi Lead" per inserire manualmente
- Oppure "Carica CSV" per importare multipli lead

**Formato CSV richiesto:**
```csv
first_name,last_name,phone_number,email,company,notes
Mario,Rossi,+393331234567,mario@example.com,Acme Inc,Lead interessato
```

### 2. Crea un Assistente AI

- Vai su **Assistenti AI**
- Clicca "Crea Assistente"
- Configura:
  - Nome dell'assistente
  - Voce (alloy, echo, fable, etc.)
  - Lingua
  - Prompt con le istruzioni

**Esempio di Prompt:**
```
Sei un assistente virtuale professionale che chiama potenziali clienti.

Il tuo obiettivo è:
1. Presentarti: "Ciao, sono [nome] e chiamo da [azienda]"
2. Spiegare brevemente il servizio
3. Verificare l'interesse del contatto
4. Se interessato, fissare un appuntamento per una demo

Mantieni un tono cordiale e professionale.
Se il contatto non è interessato, ringrazia e chiudi educatamente.
```

### 3. Crea una Campagna

- Vai su **Campagne**
- Clicca "Nuova Campagna"
- Compila:
  - Nome della campagna
  - Descrizione
  - Seleziona l'assistente AI
  - Seleziona i lead da chiamare

### 4. Avvia la Campagna

- Clicca "Avvia" sulla campagna
- L'assistente AI inizierà a chiamare i lead
- Monitora il progresso nella dashboard

### 5. Gestisci Appuntamenti

- Vai su **Appuntamenti**
- Visualizza tutti gli appuntamenti fissati
- Aggiorna lo stato (Completato, Cancellato, etc.)

## Struttura del Progetto

```
telnyx-outbound-campaigns/
├── server/                 # Backend Node.js
│   ├── index.js           # Entry point
│   ├── database.js        # Database setup
│   ├── routes/            # API routes
│   │   ├── leads.js
│   │   ├── campaigns.js
│   │   ├── assistants.js
│   │   ├── appointments.js
│   │   └── webhooks.js
│   └── services/
│       └── telnyx.js      # Telnyx API integration
├── client/                # Frontend React
│   ├── public/
│   └── src/
│       ├── pages/         # React pages
│       ├── App.js
│       └── index.js
├── package.json
└── .env
```

## API Endpoints

### Leads
- `GET /api/leads` - Lista tutti i lead
- `POST /api/leads` - Crea un lead
- `POST /api/leads/upload-csv` - Carica CSV
- `PUT /api/leads/:id` - Aggiorna lead
- `DELETE /api/leads/:id` - Elimina lead

### Campaigns
- `GET /api/campaigns` - Lista campagne
- `GET /api/campaigns/:id` - Dettagli campagna
- `POST /api/campaigns` - Crea campagna
- `POST /api/campaigns/:id/start` - Avvia campagna
- `POST /api/campaigns/:id/pause` - Pausa campagna
- `PUT /api/campaigns/:id` - Aggiorna campagna
- `DELETE /api/campaigns/:id` - Elimina campagna

### Assistants
- `GET /api/assistants` - Lista assistenti
- `POST /api/assistants` - Crea assistente
- `PUT /api/assistants/:id` - Aggiorna assistente
- `DELETE /api/assistants/:id` - Elimina assistente

### Appointments
- `GET /api/appointments` - Lista appuntamenti
- `POST /api/appointments` - Crea appuntamento
- `PUT /api/appointments/:id` - Aggiorna appuntamento
- `DELETE /api/appointments/:id` - Elimina appuntamento

### Webhooks
- `POST /api/webhooks/telnyx` - Riceve eventi da Telnyx

## Database Schema

### leads
- id, first_name, last_name, phone_number, email, company, notes, status

### campaigns
- id, name, description, assistant_id, status, total_leads, called_leads, successful_appointments

### campaign_leads
- id, campaign_id, lead_id, call_status, call_id, call_duration, appointment_set

### appointments
- id, campaign_lead_id, lead_id, campaign_id, appointment_date, status, notes

### assistants
- id, name, telnyx_assistant_id, voice, language, prompt, max_duration

## Troubleshooting

### Le chiamate non partono
- Verifica che TELNYX_API_KEY sia corretta
- Controlla che il numero di telefono sia verificato
- Assicurati di avere credito sufficiente

### Non ricevo i webhook
- Verifica che WEBHOOK_URL sia pubblicamente accessibile
- Controlla che ngrok sia attivo (per sviluppo)
- Verifica i log del server

### Database locked
- Chiudi altri processi che potrebbero usare il database
- Elimina `database.sqlite` e riavvia (perderai i dati)

## Sicurezza

- Non committare mai il file `.env`
- Usa HTTPS in produzione
- Valida sempre l'input utente
- Implementa rate limiting per le API
- Usa autenticazione in produzione

## Contribuire

Pull request sono benvenute! Per modifiche importanti, apri prima una issue per discutere i cambiamenti.

## Licenza

MIT

## Supporto

Per supporto su Telnyx: https://telnyx.com/support
Per issue su questo progetto: [GitHub Issues](your-repo-url/issues)

## Credits

Sviluppato con Telnyx AI Assistants API
