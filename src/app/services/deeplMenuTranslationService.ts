import { Menu } from "./menuService";
import { Recipe } from "./recipeService";

// DeepL translation client with localStorage cache for menu and recipe content.
export type SupportedLanguage = "it" | "en" | "es" | "fr" | "de";

const CACHE_PREFIX = "ordinoo:menu-translations:v2";
const DEEPL_TARGET: Record<Exclude<SupportedLanguage, "it">, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
};
const DEEPL_PROXY_ENDPOINT = "/.netlify/functions/deepl-translate";
let hasWarnedTranslationProxy = false;

function hashString(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function buildMenuSignature(menu: Menu, recipes: Recipe[]): string {
  const payload = JSON.stringify({
    menuId: menu.menuId,
    menuName: menu.name,
    sections: menu.sections.map((section) => ({
      sectionId: section.sectionId,
      name: section.name,
      items: section.items.map((item) => item.refId),
    })),
    recipes: recipes.map((recipe) => ({
      recipeId: recipe.recipeId,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients?.map((ingredient) => ingredient.name) || [],
      categories: recipe.categories || [],
    })),
  });

  return hashString(payload);
}

function getCacheKey(menuId: string, lang: SupportedLanguage, signature: string): string {
  return `${CACHE_PREFIX}:${menuId}:${lang}:${signature}`;
}

function normalizeText(value: string | undefined | null): string {
  return (value || "").trim();
}

async function translateTextsWithDeepL(texts: string[], lang: Exclude<SupportedLanguage, "it">): Promise<string[]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await fetch(DEEPL_PROXY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceLang: "IT",
      targetLang: DEEPL_TARGET[lang],
      texts,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Translation proxy error ${response.status}: ${errorBody}`);
  }

  const body = (await response.json()) as { translations?: string[] };
  return body.translations || [];
}

export async function translateMenuAndRecipes(
  menu: Menu,
  recipes: Recipe[],
  lang: SupportedLanguage
): Promise<{ menu: Menu; recipes: Recipe[] }> {
  if (lang === "it") {
    return { menu, recipes };
  }

  if (!hasWarnedTranslationProxy) {
    console.info("Translations via Netlify function endpoint", { endpoint: DEEPL_PROXY_ENDPOINT });
    hasWarnedTranslationProxy = true;
  }

  const signature = buildMenuSignature(menu, recipes);
  const cacheKey = getCacheKey(menu.menuId, lang, signature);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as { menu: Menu; recipes: Recipe[] };
      return parsed;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const stringsSet = new Set<string>();

  stringsSet.add(normalizeText(menu.name));
  menu.sections.forEach((section) => stringsSet.add(normalizeText(section.name)));

  recipes.forEach((recipe) => {
    stringsSet.add(normalizeText(recipe.name));
    stringsSet.add(normalizeText(recipe.description));
    (recipe.ingredients || []).forEach((ingredient) => stringsSet.add(normalizeText(ingredient.name)));
    (recipe.categories || []).forEach((category) => stringsSet.add(normalizeText(category)));
  });

  const sourceTexts = Array.from(stringsSet).filter((text) => text.length > 0);
  const translatedTexts = await translateTextsWithDeepL(sourceTexts, lang);
  const dictionary = new Map<string, string>();
  sourceTexts.forEach((source, index) => {
    dictionary.set(source, translatedTexts[index] || source);
  });

  const translatedMenu: Menu = {
    ...menu,
    name: dictionary.get(normalizeText(menu.name)) || menu.name,
    sections: menu.sections.map((section) => ({
      ...section,
      name: dictionary.get(normalizeText(section.name)) || section.name,
    })),
  };

  const translatedRecipes: Recipe[] = recipes.map((recipe) => ({
    ...recipe,
    name: dictionary.get(normalizeText(recipe.name)) || recipe.name,
    description: dictionary.get(normalizeText(recipe.description)) || recipe.description,
    ingredients: (recipe.ingredients || []).map((ingredient) => ({
      ...ingredient,
      name: dictionary.get(normalizeText(ingredient.name)) || ingredient.name,
    })),
    categories: (recipe.categories || []).map(
      (category) => dictionary.get(normalizeText(category)) || category
    ),
  }));

  const output = { menu: translatedMenu, recipes: translatedRecipes };
  localStorage.setItem(cacheKey, JSON.stringify(output));
  return output;
}
