# Quick Start - Integrazione Diretta con Telnyx

Questa guida ti mostra come configurare e usare la webapp collegata direttamente al tuo account Telnyx.

## Setup Rapido

### 1. Configura la tua API Key

Crea il file `.env` nella root del progetto:

```bash
cp .env.example .env
```

Modifica `.env` e inserisci la tua API Key Telnyx:

```env
TELNYX_API_KEY=KEY***tua_api_key_qui***
PORT=3001
WEBHOOK_URL=http://localhost:3001/api/webhooks/telnyx
NODE_ENV=development
```

**IMPORTANTE**: La tua API Key è sufficiente! Non serve configurare:
- `TELNYX_PHONE_NUMBER` (lo selezioni dalla webapp)
- `TELNYX_ASSISTANT_ID` (lo selezioni dalla webapp)

### 2. Installa e Avvia

```bash
# Installa dipendenze
npm install
cd client && npm install && cd ..

# Avvia l'applicazione
npm run dev
```

La webapp sarà disponibile su: http://localhost:3000

## Come Usare la Webapp

### Step 1: Aggiungi Lead

1. Vai su **Leads**
2. Clicca "Aggiungi Lead" o "Carica CSV"
3. Inserisci i dati dei tuoi contatti

### Step 2: Crea una Campagna

1. Vai su **Campagne**
2. Clicca "Nuova Campagna"
3. **La webapp caricherà automaticamente**:
   - Tutti gli assistenti AI dal tuo account Telnyx
   - Tutti i numeri di telefono dal tuo account
   - Tutte le connections dal tuo account

4. **Compila il form**:
   - **Nome Campagna**: Nome descrittivo
   - **Descrizione**: Breve descrizione (opzionale)
   - **Assistente AI Telnyx**: Seleziona un assistente già configurato sul tuo account Telnyx
   - **Numero di Telefono**: Seleziona il numero che vuoi usare per le chiamate
   - **Connection ID**: (Opzionale) Seleziona una connection specifica
   - **Lead**: Seleziona i lead da chiamare

5. Clicca "Crea Campagna"

### Step 3: Avvia la Campagna

1. Nella lista campagne, trova la campagna creata
2. Clicca "Avvia"
3. L'assistente AI inizierà a chiamare i lead automaticamente!

## Vantaggi di questa Integrazione

✅ **Nessuna configurazione manuale**: Tutti gli assistenti e numeri vengono caricati automaticamente dal tuo account Telnyx

✅ **Selezione flessibile**: Puoi scegliere quale assistente e quale numero usare per ogni campagna

✅ **Nessun duplicato**: Usi direttamente gli assistenti che hai già configurato su Telnyx

✅ **Aggiornamenti real-time**: Se crei un nuovo assistente su Telnyx, apparirà subito nella webapp

## Configurare Assistenti su Telnyx

### Opzione 1: Tramite Portale Telnyx

1. Vai su https://portal.telnyx.com
2. Vai su **AI > Assistants**
3. Clicca "Create Assistant"
4. Configura:
   - Nome
   - Prompt
   - Voce
   - Lingua
   - Max duration
5. Salva

L'assistente sarà subito disponibile nella webapp!

### Opzione 2: Tramite API

Puoi anche creare assistenti via API Telnyx:

```bash
curl -X POST https://api.telnyx.com/v2/ai/assistants \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Assistant",
    "voice": "alloy",
    "language": "it",
    "prompt": "Sei un assistente che fissa appuntamenti...",
    "max_duration": 300
  }'
```

## Monitoraggio Campagne

### Dashboard
- Visualizza statistiche in tempo reale
- Lead totali, chiamate effettuate, appuntamenti fissati

### Dettagli Campagna
- Clicca sul nome di una campagna per vedere dettagli
- Stato di ogni chiamata (pending, in_progress, completed)
- Durata chiamate
- Recording URL (se disponibile)
- Appuntamenti fissati

### Gestione Appuntamenti
- Vai su **Appuntamenti**
- Vedi tutti gli appuntamenti in un'unica vista
- Filtra per stato (Programmati, Completati, Cancellati)
- Aggiorna lo stato manualmente

## Setup Webhook (per Produzione)

Per ricevere eventi da Telnyx in tempo reale:

### Sviluppo (con ngrok)

```bash
# Installa ngrok
brew install ngrok  # Mac
# o scarica da https://ngrok.com/download

# Avvia ngrok
ngrok http 3001

# Copia l'URL HTTPS (es. https://abc123.ngrok.io)
# Aggiorna .env:
WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks/telnyx

# Riavvia il server
```

### Produzione

Configura il tuo server con URL pubblico e aggiorna:
```
WEBHOOK_URL=https://tuodominio.com/api/webhooks/telnyx
```

## Troubleshooting

### Non vedo gli assistenti Telnyx
- Verifica che la tua API Key sia corretta nel `.env`
- Controlla i log del server per errori
- Assicurati di aver creato almeno un assistente su Telnyx

### Non vedo i numeri di telefono
- Verifica di aver acquistato almeno un numero su Telnyx
- Controlla che i numeri siano attivi nel portale

### Le chiamate non partono
- Verifica di avere credito sufficiente su Telnyx
- Controlla che l'assistente selezionato esista
- Verifica che il numero selezionato sia attivo
- Guarda i log del server per errori dettagliati

### Errore 401 Unauthorized
- La tua API Key non è valida o è scaduta
- Crea una nuova API Key nel portale Telnyx

## API Endpoints Disponibili

### Telnyx Resources
- `GET /api/telnyx/assistants` - Lista assistenti dal tuo account
- `GET /api/telnyx/assistants/:id` - Dettagli assistente specifico
- `GET /api/telnyx/phone-numbers` - Lista numeri di telefono
- `GET /api/telnyx/connections` - Lista connections
- `GET /api/telnyx/messaging-profiles` - Lista messaging profiles

### Campagne
- `POST /api/campaigns` - Crea campagna con risorse Telnyx
- `POST /api/campaigns/:id/start` - Avvia campagna
- `POST /api/campaigns/:id/pause` - Pausa campagna

## Struttura Database Campagne

Ogni campagna salva:
- `telnyx_assistant_id` - ID dell'assistente Telnyx selezionato
- `phone_number` - Numero di telefono selezionato
- `connection_id` - Connection ID (opzionale)
- `assistant_id` - Assistente locale (opzionale, fallback)

## Best Practices

1. **Testa sempre prima**: Usa il tuo numero come lead di test
2. **Monitora il credito**: Controlla il saldo Telnyx regolarmente
3. **Configura webhook**: Per ricevere aggiornamenti real-time
4. **Backup del database**: Fai backup regolari di `database.sqlite`
5. **Rate limiting**: Il sistema aspetta 2 secondi tra chiamate, ma monitora i rate limits Telnyx

## Supporto

- **Telnyx Docs**: https://developers.telnyx.com
- **Telnyx Support**: https://telnyx.com/support
- **API Reference**: https://developers.telnyx.com/docs/api/v2

## Prossimi Passi

- [ ] Configura webhook per ambiente produzione
- [ ] Implementa autenticazione utenti
- [ ] Aggiungi analytics avanzati
- [ ] Integra con CRM (Salesforce, HubSpot)
- [ ] Aggiungi notifiche email/SMS per appuntamenti
