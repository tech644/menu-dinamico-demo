# Restaurant Menu Web App - Ristorante Belvedere

Web app per la navigazione dei menu di ristorante, con dettaglio ricette, ingredienti e allergeni.

## Caratteristiche

- Mobile-first: ottimizzata per dispositivi mobili e desktop
- Navigazione menu: se esiste un solo menu, accesso diretto al dettaglio
- Sezioni dinamiche: categorie menu guidate da dati
- Dettaglio ricette: ingredienti, prezzo, allergeni e food cost
- Integrazione Firebase: fallback locale e supporto Firestore
- UI responsive: layout adattivo e componenti riusabili

## Struttura del Progetto

```
/src/app
├── services/           # Servizi per dati (facilmente sostituibili con Firebase)
│   ├── menuService.ts
│   ├── recipeService.ts
│   └── allergenService.ts
├── pages/              # Pagine dell'applicazione
│   ├── Home.tsx        # Lista menu o redirect
│   ├── MenuDetail.tsx  # Dettaglio menu con sezioni
│   └── RecipeDetail.tsx # Dettaglio ricetta
├── components/         # Componenti riutilizzabili
│   ├── Header.tsx
│   ├── CategoryTabs.tsx
│   ├── RecipeCard.tsx
│   └── LoadingSpinner.tsx
└── routes.ts          # Configurazione routing React Router
```

## Funzionalità

### Navigazione Menu
- Se ci sono più menu, mostra una lista di selezione
- Se c'è un solo menu, reindirizza automaticamente al dettaglio
- Navigazione fluida tra sezioni con scroll automatico
- Tab orizzontali per cambiare sezione velocemente

### Dettaglio Ricetta
- **Hero Image** - Immagine principale della ricetta
- **Informazioni Base** - Nome, descrizione, prezzo
- **Ingredienti** - Lista completa degli ingredienti
- **Allergeni** - Rilevamento automatico e visualizzazione dettagliata
- **Food Cost** - Visualizzazione costo e margine

### Sistema Allergeni
Il sistema rileva automaticamente allergeni comuni:
- Glutine
- Lattosio  
- Uova
- Pesce
- Crostacei
- Frutta a guscio
- Soia
- Sedano
- Senape
- Sesamo

## Tecnologie

- **React 18.3** - Framework UI
- **React Router 7** - Routing con Data Mode
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling moderno
- **Lucide React** - Icons
- **Vite** - Build tool

## Dati Mock

I dati fallback sono caricati dai file JSON:
- `/src/app/data/mocks/menu.json` - struttura menu
- `/src/app/data/mocks/ricette.json` - ricette complete

## Integrazione Firebase

Configurazione minima per usare Firestore in locale e in produzione.

### Quick Start Firebase

1. Installa Firebase:
```bash
npm install firebase
```

2. Crea `.env` partendo da `.env.example` e inserisci i valori Firebase:
```bash
cp .env.example .env
```
Imposta `VITE_USE_FIREBASE=true` e compila le variabili `VITE_FIREBASE_*`.

3. Imposta le regole Firestore di produzione da `firestore.rules`

4. Importa i dati iniziali nel database (collections `menus` e `recipes`)

I servizi applicativi sono già strutturati per facilitare la migrazione a Firebase.

## Traduzioni DeepL (Produzione)

In produzione la traduzione passa da una Netlify Function (`/api/deepl-translate`) per evitare errori CORS e non esporre la chiave nel browser.

Imposta la variabile server-side su Netlify:

```bash
DEEPL_API_KEY=your_deepl_key
```

## Design

L'interfaccia è ispirata a un design moderno per ristoranti italiani:
- Header con logo "Ristorante Belvedere" e bandiera italiana
- Palette colori caldi (arancio, rosso)
- Card moderne con ombre e bordi arrotondati
- Transizioni fluide e animazioni
- Responsive per tutti i dispositivi

## Mobile First

- Layout ottimizzato per schermi piccoli
- Touch-friendly buttons e cards
- Scroll orizzontale per le categorie
- Hero images responsive
- Grid adattivo per desktop

## Personalizzazione

### Cambiare i Colori
Modifica i colori principali in `/src/styles/theme.css`:
```css
:root {
  --color-primary: #ff6b35; /* Arancio principale */
}
```

### Aggiungere Nuove Sezioni
Le sezioni vengono caricate dinamicamente dal JSON del menu. Basta aggiungere una nuova sezione nel file JSON.

### Modificare gli Allergeni
Aggiorna `/src/app/services/allergenService.ts` per aggiungere o modificare allergeni.

## License
