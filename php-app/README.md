# Telnyx Campaigns - Applicazione PHP per cPanel

Applicazione web per gestire campagne outbound con Telnyx AI Assistants.

## 🚀 Installazione su cPanel

### 1. Upload File
1. Accedi al tuo **cPanel**
2. Apri **File Manager**
3. Vai nella cartella `public_html` (o la cartella del tuo dominio)
4. Carica tutti i file di questa cartella `php-app`

### 2. Configurazione

#### Configura l'API Key Telnyx
Apri il file `config.php` e inserisci la tua API Key Telnyx:
```php
define('TELNYX_API_KEY', 'YOUR_TELNYX_API_KEY_HERE');
```

Per ottenere la tua API Key:
1. Vai su [Telnyx Portal](https://portal.telnyx.com/)
2. Naviga in **API Keys**
3. Crea una nuova key con permessi completi
4. Copia e incolla la key in `config.php`

#### Configura il Webhook URL
Nel file `config.php`, aggiorna con il tuo URL pubblico:
```php
define('WEBHOOK_URL', 'https://tuosito.com/api/webhooks.php');
```

### 3. Inizializza Database
1. Apri il browser e vai su: `https://tuosito.com/init-db.php`
2. Vedrai il messaggio: "✅ Database initialized successfully!"
3. Il database SQLite sarà creato automaticamente con dati demo

### 4. Accedi all'Applicazione
Apri: `https://tuosito.com/index.php`

L'applicazione è pronta! 🎉

## 📁 Struttura File

```
php-app/
├── index.php              # Dashboard
├── leads.php              # Gestione Lead
├── campaigns.php          # Gestione Campagne
├── assistants.php         # Gestione Assistenti AI
├── appointments.php       # Gestione Appuntamenti
├── campaign-detail.php    # Dettaglio Campagna
├── config.php             # Configurazione
├── init-db.php            # Inizializzazione Database
├── assets/
│   ├── style.css          # CSS
│   └── app.js             # JavaScript
├── api/
│   ├── leads.php          # API Leads
│   ├── campaigns.php      # API Campaigns
│   ├── assistants.php     # API Assistants
│   ├── appointments.php   # API Appointments
│   ├── telnyx.php         # API Telnyx Integration
│   └── webhooks.php       # Webhook Telnyx
└── database.sqlite        # Database (creato automaticamente)
```

## 🔧 Requisiti

- **PHP 7.4+** con estensioni:
  - PDO
  - SQLite3
  - cURL
  - JSON

- **Account Telnyx** con:
  - API Key con permessi completi
  - Almeno un numero di telefono
  - AI Assistants configurati (opzionale)

## 🎯 Funzionalità

### 1. Dashboard
- Statistiche generali (Lead, Campagne, Appuntamenti, Chiamate)
- Elenco campagne recenti

### 2. Gestione Lead
- Aggiungi lead manualmente
- Importa lead da CSV
- Elimina lead
- Formato CSV: `first_name,last_name,phone_number,email,company`

### 3. Gestione Campagne
- Crea nuove campagne
- Seleziona assistenti Telnyx dal tuo account
- Seleziona numeri telefono dal tuo account
- Assegna lead alle campagne
- Avvia campagne automatiche
- **🧪 Test Call**: Testa configurazione prima di avviare campagna

### 4. Assistenti AI Locali
- Crea assistenti personalizzati
- Configura voce, lingua, prompt
- Usa come template per campagne

### 5. Appuntamenti
- Visualizza appuntamenti presi
- Traccia conversioni da chiamate

### 6. Webhook Telnyx
- Ricevi eventi chiamate in tempo reale
- Aggiorna automaticamente stato chiamate
- Traccia appuntamenti presi da AI

## 🔐 Sicurezza

### Permessi File
Assicurati che la cartella sia scrivibile per creare il database:
```bash
chmod 755 /path/to/php-app
chmod 666 /path/to/php-app/database.sqlite  # dopo la creazione
```

### API Key
- **NON condividere** la tua API Key Telnyx
- Per sicurezza extra, sposta `config.php` fuori da `public_html` e aggiorna i require

## 🐛 Risoluzione Problemi

### Errore "Access denied" per assistants/phone numbers
**Causa**: La tua API Key Telnyx non ha i permessi necessari.

**Soluzione**:
1. Vai su [Telnyx Portal](https://portal.telnyx.com/)
2. Vai in **API Keys** → Crea nuova key con permessi completi
3. Oppure contatta supporto Telnyx per attivare "AI Products"
4. Aggiorna la key in `config.php`

### Database non si crea
**Causa**: Permessi cartella insufficienti.

**Soluzione**:
```bash
chmod 755 /path/to/php-app
```

### Webhook non funzionano
**Causa**: URL webhook non raggiungibile.

**Soluzione**:
1. Assicurati che il tuo sito sia accessibile pubblicamente (non localhost)
2. Aggiorna `WEBHOOK_URL` in `config.php`
3. Testa chiamando manualmente: `https://tuosito.com/api/webhooks.php`

### Errori CORS
**Causa**: Chiamate API bloccate dal browser.

**Soluzione**: I header CORS sono già configurati in `config.php`. Se necessario, aggiungi:
```php
header('Access-Control-Allow-Origin: https://tuosito.com');
```

## 📊 Dati Demo

Il database include dati demo per testare:
- 4 lead esempio
- 1 assistente AI "Assistente Vendite"
- 1 campagna "Campagna Demo Novembre 2025"

Puoi eliminarli o usarli per testare.

## 🔄 Aggiornamenti

Per aggiornare l'applicazione:
1. Backup del file `database.sqlite`
2. Carica i nuovi file via cPanel File Manager
3. Ripristina `database.sqlite` se necessario

## 📞 Supporto

Per problemi con Telnyx API:
- Documentazione: https://developers.telnyx.com/
- Supporto: https://telnyx.com/support

## 📝 Note Importanti

- **Webhook**: Configura il webhook URL nel portale Telnyx per ricevere eventi chiamate
- **Costi**: Ogni chiamata ha un costo su Telnyx, controlla il tuo piano
- **Test Call**: Usa sempre la funzione Test Call prima di avviare campagne con molti lead
- **Backup**: Fai backup regolari del file `database.sqlite`

## 🎨 Personalizzazione

### Cambiare Colori
Modifica `assets/style.css`:
```css
.btn-primary {
    background-color: #tuo-colore;
}
```

### Cambiare Lingua
L'applicazione è in italiano. Per tradurre, modifica i testi in tutti i file `.php`.

---

**Fatto con ❤️ per gestire campagne outbound con Telnyx AI**
