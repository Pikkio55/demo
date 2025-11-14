# Guida Setup Completa

Questa guida ti accompagna passo-passo nella configurazione della webapp per campagne outbound con Telnyx.

## Parte 1: Setup Account Telnyx

### 1.1 Crea un Account Telnyx

1. Vai su https://telnyx.com
2. Clicca "Sign Up" e completa la registrazione
3. Verifica la tua email

### 1.2 Ottieni le API Keys

1. Accedi a https://portal.telnyx.com
2. Vai su "API Keys" nel menu laterale
3. Clicca "Create API Key"
4. Copia la chiave (inizia con `KEY...`)
5. Salvala in un posto sicuro (non sarà più visibile)

### 1.3 Acquista un Numero di Telefono

1. Nel portale Telnyx, vai su "Numbers"
2. Clicca "Buy Numbers"
3. Cerca numeri disponibili nella tua area
4. Acquista un numero (serve per effettuare le chiamate)
5. Copia il numero in formato internazionale (es. +393331234567)

### 1.4 Aggiungi Credito

1. Vai su "Billing" nel portale
2. Aggiungi credito per le chiamate
3. Minimo consigliato: $20 per iniziare

## Parte 2: Setup Locale

### 2.1 Requisiti Sistema

Assicurati di avere installato:
- Node.js 16 o superiore
- npm o yarn
- Git

Verifica con:
```bash
node --version  # Deve essere >= 16
npm --version
```

### 2.2 Clona e Installa

```bash
# Clona il repository
git clone <repository-url>
cd telnyx-outbound-campaigns

# Installa dipendenze backend
npm install

# Installa dipendenze frontend
cd client
npm install
cd ..
```

### 2.3 Configura l'Ambiente

```bash
# Crea il file .env dalla template
cp .env.example .env
```

Apri `.env` e inserisci:
```env
TELNYX_API_KEY=KEY___tua_chiave_api_qui
TELNYX_PHONE_NUMBER=+393331234567
WEBHOOK_URL=http://localhost:3001/api/webhooks/telnyx
PORT=3001
DB_PATH=./database.sqlite
NODE_ENV=development
```

## Parte 3: Setup Webhook (Sviluppo)

Per ricevere eventi da Telnyx in locale, serve esporre il server a internet.

### 3.1 Installa ngrok

**Mac:**
```bash
brew install ngrok
```

**Windows:**
Scarica da https://ngrok.com/download

**Linux:**
```bash
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin
```

### 3.2 Avvia ngrok

```bash
ngrok http 3001
```

Output:
```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:3001
```

### 3.3 Aggiorna WEBHOOK_URL

Copia l'URL HTTPS da ngrok e aggiorna `.env`:
```env
WEBHOOK_URL=https://abc123def456.ngrok.io/api/webhooks/telnyx
```

## Parte 4: Avvia l'Applicazione

### 4.1 Avvio Sviluppo

In un nuovo terminale:
```bash
# Avvia sia backend che frontend
npm run dev
```

Oppure separatamente:
```bash
# Terminale 1 - Backend
npm run server

# Terminale 2 - Frontend
npm run client
```

### 4.2 Verifica

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

## Parte 5: Primo Utilizzo

### 5.1 Crea il Primo Assistente AI

1. Apri http://localhost:3000
2. Vai su "Assistenti AI"
3. Clicca "Crea Assistente"
4. Compila:
   - Nome: "Assistente Demo"
   - Voce: "alloy"
   - Lingua: "it"
   - Prompt:
   ```
   Sei un assistente che chiama per fissare appuntamenti.
   Presentati cordialmente e chiedi se il contatto è interessato.
   Se sì, fissa un appuntamento. Se no, ringrazia e chiudi.
   ```
5. Clicca "Crea Assistente"

### 5.2 Aggiungi Lead di Test

1. Vai su "Leads"
2. Clicca "Aggiungi Lead"
3. Inserisci (usa il TUO numero per testare):
   - Nome: Il tuo nome
   - Cognome: Il tuo cognome
   - Telefono: Il tuo numero in formato internazionale
   - Email: tua@email.com

### 5.3 Crea una Campagna di Test

1. Vai su "Campagne"
2. Clicca "Nuova Campagna"
3. Compila:
   - Nome: "Test Campagna"
   - Assistente: Seleziona "Assistente Demo"
   - Lead: Seleziona il tuo lead
4. Clicca "Crea Campagna"

### 5.4 Avvia la Campagna

1. Nella lista campagne, trova "Test Campagna"
2. Clicca "Avvia"
3. Riceverai una chiamata dall'assistente AI!

## Parte 6: Import CSV Lead

### 6.1 Prepara il CSV

Crea un file `leads.csv`:
```csv
first_name,last_name,phone_number,email,company,notes
Mario,Rossi,+393331234567,mario@example.com,Acme Inc,Lead caldo
Luigi,Verdi,+393339876543,luigi@example.com,Beta SpA,Interessato al prodotto
```

### 6.2 Carica il CSV

1. Vai su "Leads"
2. Clicca "Carica CSV"
3. Seleziona il file
4. Verifica che i lead siano stati importati

## Parte 7: Monitoraggio

### 7.1 Dashboard

- Visualizza statistiche in tempo reale
- Lead totali, campagne attive, appuntamenti

### 7.2 Dettagli Campagna

- Clicca sul nome di una campagna
- Vedi stato di ogni chiamata
- Durata, esito, appuntamenti fissati

### 7.3 Appuntamenti

- Vai su "Appuntamenti"
- Vedi tutti gli appuntamenti fissati
- Aggiorna lo stato manualmente

## Parte 8: Deploy in Produzione

### 8.1 Prepara il Build

```bash
cd client
npm run build
cd ..
```

### 8.2 Setup Server Produzione

Opzioni:
- **Heroku**: Guida su heroku.com
- **DigitalOcean**: App Platform o Droplet
- **AWS**: EC2 o Elastic Beanstalk
- **Vercel/Netlify**: Solo frontend (serve backend separato)

### 8.3 Configura Webhook Produzione

1. Ottieni l'URL pubblico del server (es. `https://myapp.com`)
2. Aggiorna `.env`:
   ```
   WEBHOOK_URL=https://myapp.com/api/webhooks/telnyx
   NODE_ENV=production
   ```

### 8.4 Avvia in Produzione

```bash
NODE_ENV=production npm start
```

## Troubleshooting

### Errore: TELNYX_API_KEY non valida
- Verifica che la chiave inizi con `KEY`
- Ricontrolla nel portale Telnyx
- Crea una nuova chiave se necessario

### Errore: Numero non valido
- Usa sempre formato internazionale: +39...
- Include il prefisso del paese
- No spazi o caratteri speciali

### Chiamate non partono
- Verifica credito Telnyx
- Controlla che il numero sia attivo
- Guarda i log del server per errori

### Webhook non ricevuti
- ngrok deve essere attivo
- WEBHOOK_URL deve essere HTTPS
- Controlla firewall/antivirus

### Database locked
```bash
# Resetta il database (ATTENZIONE: cancella tutti i dati)
rm database.sqlite
npm run server  # Ricrea il database
```

## Supporto

- Documentazione Telnyx: https://developers.telnyx.com
- API Reference: https://developers.telnyx.com/docs/api/v2
- Community: https://community.telnyx.com

## Prossimi Passi

- Personalizza i prompt degli assistenti
- Configura voici diverse per AB testing
- Integra con CRM (Salesforce, HubSpot)
- Aggiungi analytics avanzati
- Implementa autenticazione utenti
