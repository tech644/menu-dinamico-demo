// Funzione handler principale esportata (tipica di ambienti serverless)
exports.handler = async function handler(event) {
  // Controlla che il metodo HTTP sia POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // Metodo non consentito
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Recupera la chiave API di DeepL dalle variabili d'ambiente
  const apiKey = (process.env.DEEPL_API_KEY || "").trim();

  // Se la chiave API manca, restituisce errore server
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Missing DEEPL_API_KEY on server" }),
    };
  }

  let payload;

  // Prova a fare il parsing del body JSON della richiesta
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    // Se il JSON non è valido, restituisce errore
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Imposta la lingua sorgente (default: IT)
  const sourceLang = String(payload.sourceLang || "IT").toUpperCase();

  // Imposta la lingua di destinazione
  const targetLang = String(payload.targetLang || "").toUpperCase();

  // Filtra i testi: devono essere stringhe non vuote
  const texts = Array.isArray(payload.texts)
    ? payload.texts.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    : [];

  // Controlla che siano presenti lingua target e testi
  if (!targetLang || texts.length === 0) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Missing targetLang or texts" }),
    };
  }

  // Determina l'endpoint DeepL (free o pro) in base alla chiave API
  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  // Array che conterrà tutte le traduzioni finali
  const translated = [];

  // Numero massimo di testi per richiesta (chunking)
  const chunkSize = 50;

  // Divide i testi in blocchi per evitare richieste troppo grandi
  for (let index = 0; index < texts.length; index += chunkSize) {
    const chunk = texts.slice(index, index + chunkSize);

    // Costruisce il corpo della richiesta in formato form-urlencoded
    const form = new URLSearchParams();
    form.set("source_lang", sourceLang);
    form.set("target_lang", targetLang);

    // Aggiunge ogni testo al form (DeepL accetta più parametri "text")
    chunk.forEach((text) => form.append("text", text));

    // Effettua la chiamata HTTP a DeepL
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: form.toString(),
    });

    // Se la risposta non è OK, restituisce errore con dettagli
    if (!response.ok) {
      const errorBody = await response.text();
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "DeepL request failed",
          details: errorBody,
        }),
      };
    }

    // Parsing della risposta JSON
    const body = await response.json();

    // Estrae le traduzioni dal risultato
    const chunkTranslations = Array.isArray(body?.translations)
      ? body.translations.map((item) => item?.text || "")
      : [];

    // Aggiunge le traduzioni al risultato finale
    translated.push(...chunkTranslations);
  }

  // Restituisce tutte le traduzioni al client
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store", // Disabilita la cache
    },
    body: JSON.stringify({ translations: translated }),
  };
};