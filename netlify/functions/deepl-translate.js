exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = (process.env.DEEPL_API_KEY || "").trim();
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
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const sourceLang = String(payload.sourceLang || "IT").toUpperCase();
  const targetLang = String(payload.targetLang || "").toUpperCase();
  const texts = Array.isArray(payload.texts)
    ? payload.texts.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];

  if (!targetLang || texts.length === 0) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Missing targetLang or texts" }),
    };
  }

  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const translated = [];
  const chunkSize = 50;

  for (let index = 0; index < texts.length; index += chunkSize) {
    const chunk = texts.slice(index, index + chunkSize);
    const form = new URLSearchParams();
    form.set("auth_key", apiKey);
    form.set("source_lang", sourceLang);
    form.set("target_lang", targetLang);
    chunk.forEach((text) => form.append("text", text));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

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

    const body = await response.json();
    const chunkTranslations = Array.isArray(body?.translations)
      ? body.translations.map((item) => item?.text || "")
      : [];
    translated.push(...chunkTranslations);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ translations: translated }),
  };
};
