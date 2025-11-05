# 📸 Screenshots - Telnyx Outbound Campaigns

Preview completo dell'applicazione con screenshot interattivi di tutte le pagine.

## 🎨 Visualizza gli Screenshots

**Apri il file principale:**
```
screenshots/index.html
```

Oppure apri direttamente ogni screenshot:

### 📊 1. Dashboard
[`01-dashboard.html`](01-dashboard.html)
- Statistiche in tempo reale
- Lead totali, campagne attive, appuntamenti
- Tabella campagne recenti

### 👥 2. Gestione Lead
[`02-leads.html`](02-leads.html)
- Lista completa dei 4 lead
- Pulsanti: Aggiungi Lead, Carica CSV
- Azioni: Elimina per ogni lead

### 📢 3. Campagne
[`03-campaigns.html`](03-campaigns.html)
- Lista campagne con statistiche
- **Pulsante "🧪 Test Call"**
- Pulsante "Nuova Campagna"
- Azioni: Avvia, Elimina

### 📈 4. Dettaglio Campagna
[`04-campaign-detail.html`](04-campaign-detail.html)
- Statistiche dettagliate campagna
- Lista lead assegnati
- Stato chiamate per ogni lead
- **Pulsante "🧪 Test Call"** specifico

### 🧪 5. Test Call Modal
[`05-test-call-modal.html`](05-test-call-modal.html)
- Form per chiamata di test
- Selezione assistente AI
- Selezione numero mittente
- Connection ID (opzionale)

### 🤖 6. Assistenti AI
[`06-assistants.html`](06-assistants.html)
- Lista assistenti configurati
- Visualizzazione prompt
- Configurazione: voce, lingua, durata

### 📅 7. Appuntamenti
[`07-appointments.html`](07-appointments.html)
- Statistiche appuntamenti
- Filtri: Tutti, Programmati, Completati, Cancellati
- Empty state (nessun appuntamento ancora)

## 🚀 Features Visibili

✅ **Interfaccia Moderna**
- Design pulito e professionale
- Colori consistenti
- Icone intuitive

✅ **Navigazione**
- Menu sempre visibile
- Breadcrumbs per navigazione
- Link interni funzionanti

✅ **Componenti**
- Cards con statistiche
- Tabelle responsive
- Badge per stati
- Modals per form
- Buttons con azioni

✅ **Test Call**
- Bottone in pagina Campagne
- Bottone in dettaglio Campagna
- Modal completo con form

## 💡 Come Usare

1. Apri `index.html` nel browser
2. Clicca su ogni card per vedere lo screenshot
3. Ogni screenshot è una pagina HTML interattiva

## 📱 Responsive

Tutti gli screenshot sono ottimizzati per:
- Desktop (1200px+)
- Tablet (768px - 1200px)
- Mobile (< 768px)

## 🎯 Dati Demo

Gli screenshot mostrano dati reali inseriti nel database:
- **4 Lead**: Mario Rossi, Laura Bianchi (x2), Giuseppe Verdi
- **1 Assistente**: "Assistente Vendite"
- **1 Campagna**: "Campagna Demo Novembre 2025"
- **0 Appuntamenti**: Sistema pronto a riceverne

## 🔧 Tecnologie

- **HTML5** + **CSS3**
- **Design System** custom
- **Grid Layout** per responsive
- **Flexbox** per componenti

## 📝 Note

Questi sono screenshots statici (HTML/CSS puro).
L'applicazione vera usa:
- **React** per il frontend dinamico
- **Node.js + Express** per il backend
- **SQLite** per il database
- **Telnyx API** per le chiamate

Per vedere l'applicazione vera in azione:
```bash
npm run dev
```

Poi apri: http://localhost:3000
