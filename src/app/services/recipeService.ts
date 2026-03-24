import { loadRecipesData } from '../data/recipesLoader';
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";

// Recipe data access with allergen enrichment and Firebase/local fallback support.
export interface Ingredient {
  ingredientId: string;
  name: string;
  products: any[];
}

export interface Recipe {
  recipeId: string;
  localId: string;
  name: string;
  isBeverage: boolean;
  isCocktail: boolean;
  isBar: boolean;
  categories: string[];
  menuIds: string[];
  ingredients: Ingredient[];
  salePrice: number;
  totalCost: number;
  foodCostPercentage: number;
  procedure: string;
  description: string;
  createdBy: string;
  createdAt: string;
  allergens?: string[];
}

function normalizeRecipeDoc(raw: Partial<Recipe> & Record<string, any>, fallbackId: string, forceBeverage = false): Recipe {
  const ingredients = Array.isArray(raw.ingredients) ? (raw.ingredients as Ingredient[]) : [];
  const normalizedId =
    (typeof raw.recipeId === "string" && raw.recipeId) ||
    (typeof raw.beverageId === "string" && raw.beverageId) ||
    fallbackId;

  return {
    recipeId: normalizedId,
    localId: typeof raw.localId === "string" ? raw.localId : "",
    name: typeof raw.name === "string" ? raw.name : "",
    isBeverage: forceBeverage || raw.isBeverage === true,
    isCocktail: raw.isCocktail === true,
    isBar: raw.isBar === true,
    categories: Array.isArray(raw.categories) ? raw.categories.map(String) : [],
    menuIds: Array.isArray(raw.menuIds) ? raw.menuIds.map(String) : [],
    ingredients,
    salePrice:
      typeof raw.salePrice === "number"
        ? raw.salePrice
        : typeof raw.price === "number"
          ? raw.price
          : 0,
    totalCost: typeof raw.totalCost === "number" ? raw.totalCost : 0,
    foodCostPercentage: typeof raw.foodCostPercentage === "number" ? raw.foodCostPercentage : 0,
    procedure: typeof raw.procedure === "string" ? raw.procedure : "",
    description: typeof raw.description === "string" ? raw.description : "",
    createdBy: typeof raw.createdBy === "string" ? raw.createdBy : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    allergens: extractAllergens(ingredients),
  };
}

async function hasBusinessPublicMenu(businessId: string): Promise<boolean> {
  const db = getFirestoreDb();
  const businessSnapshot = await getDoc(doc(db, "business", businessId));
  return businessSnapshot.exists() && businessSnapshot.data()?.hasPublicMenu === true;
}

async function fetchByIdsFromCollection(
  col: any,
  ids: string[],
  forceBeverage = false,
): Promise<Recipe[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }

  const foundMap = new Map<string, Recipe>();

  for (const chunk of chunks) {
    const byDocumentId = query(col, where(documentId(), "in", chunk));
    const byDocumentIdSnapshot = await getDocs(byDocumentId);

    byDocumentIdSnapshot.docs.forEach((recipeDoc) => {
      const normalized = normalizeRecipeDoc(recipeDoc.data() as Partial<Recipe> & Record<string, any>, recipeDoc.id, forceBeverage);
      foundMap.set(normalized.recipeId, normalized);
    });

    const missingIds = chunk.filter((id) => !foundMap.has(id));
    if (missingIds.length === 0) {
      continue;
    }

    const byField = query(col, where("recipeId", "in", missingIds));
    const byFieldSnapshot = await getDocs(byField);
    byFieldSnapshot.docs.forEach((recipeDoc) => {
      const normalized = normalizeRecipeDoc(recipeDoc.data() as Partial<Recipe> & Record<string, any>, recipeDoc.id, forceBeverage);
      foundMap.set(normalized.recipeId, normalized);
    });
  }

  return ids.map((id) => foundMap.get(id)).filter((recipe): recipe is Recipe => recipe !== undefined);
}

function applyMockFilter(recipeIds: string[], forceBeverage = false): Promise<Recipe[]> {
  return loadRecipesData().then((recipesData) =>
    (recipesData.recipes as Recipe[])
      .filter((recipe) => recipeIds.includes(recipe.recipeId))
      .map((recipe) => ({
        ...recipe,
        isBeverage: forceBeverage || recipe.isBeverage,
        allergens: extractAllergens(recipe.ingredients),
      })),
  );
}

export async function getAllRecipes(): Promise<Recipe[]> {
  if (!isFirebaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const recipesData = await loadRecipesData();
    return recipesData.recipes as Recipe[];
  }

  try {
    const db = getFirestoreDb();
    const recipesRef = collection(db, "recipes");
    const snapshot = await getDocs(recipesRef);

    return snapshot.docs.map((recipeDoc) =>
      normalizeRecipeDoc(recipeDoc.data() as Partial<Recipe> & Record<string, any>, recipeDoc.id),
    );
  } catch (error) {
    console.error("Error loading recipes from Firestore, using mock data:", error);
    const recipesData = await loadRecipesData();
    return recipesData.recipes as Recipe[];
  }
}

export async function getRecipeById(recipeId: string, businessId?: string): Promise<Recipe | null> {
  if (!isFirebaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const recipesData = await loadRecipesData();
    const recipe = recipesData.recipes.find((r: any) => r.recipeId === recipeId);
    return recipe
      ? ({ ...recipe, allergens: extractAllergens(recipe.ingredients) } as Recipe)
      : null;
  }

  try {
    const db = getFirestoreDb();

    if (businessId) {
      const recipeRef = doc(db, "business", businessId, "fbRecipes", recipeId);
      const recipeSnapshot = await getDoc(recipeRef);

      if (recipeSnapshot.exists()) {
        return normalizeRecipeDoc(
          recipeSnapshot.data() as Partial<Recipe> & Record<string, any>,
          recipeSnapshot.id
        );
      }

      // fallback by field
      const recipesRef = collection(db, "business", businessId, "fbRecipes");
      const q = query(recipesRef, where("recipeId", "==", recipeId), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const foundDoc = snapshot.docs[0];
        return normalizeRecipeDoc(
          foundDoc.data() as Partial<Recipe> & Record<string, any>,
          foundDoc.id
        );
      }

      return null;
    }

    // fallback globale
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnapshot = await getDoc(recipeRef);

    if (recipeSnapshot.exists()) {
      return normalizeRecipeDoc(
        recipeSnapshot.data() as Partial<Recipe> & Record<string, any>,
        recipeSnapshot.id
      );
    }

    return null;

  } catch (error) {
    console.error("Error loading recipe:", error);

    if (businessId) return null;

    const recipesData = await loadRecipesData();
    const recipe = recipesData.recipes.find((r: any) => r.recipeId === recipeId);

    return recipe
      ? ({ ...recipe, allergens: extractAllergens(recipe.ingredients) } as Recipe)
      : null;
  }
}

export async function getRecipesByIds(recipeIds: string[], businessId?: string): Promise<Recipe[]> {
  if (recipeIds.length === 0) return [];

  if (!isFirebaseConfigured) {
    return applyMockFilter(recipeIds);
  }

  try {
    const db = getFirestoreDb();

    if (businessId) {
      const recipesRef = collection(db, "business", businessId, "fbRecipes");
      return fetchByIdsFromCollection(recipesRef, recipeIds);
    }

    const recipesRef = collection(db, "recipes");
    return fetchByIdsFromCollection(recipesRef, recipeIds);

  } catch (error) {
    console.error("Error loading recipes:", error);
    return businessId ? [] : applyMockFilter(recipeIds);
  }
}


export async function getBeveragesByIds(beverageIds: string[], businessId: string): Promise<Recipe[]> {
  if (beverageIds.length === 0) return [];

  if (!isFirebaseConfigured) {
    return applyMockFilter(beverageIds, true);
  }

  try {
    const db = getFirestoreDb();
    const beveragesRef = collection(db, "business", businessId, "fbBeverages");

    return fetchByIdsFromCollection(beveragesRef, beverageIds, true);

  } catch (error) {
    console.error("Error loading beverages:", error);
    return [];
  }
}


// Helper function to extract allergens from ingredients
function extractAllergens(ingredients: Ingredient[]): string[] {
  const allergenMap: { [key: string]: string[] } = {
    glutine: ["farina", "spaghetti", "pasta", "pane", "grano", "frumento", "orzo", "segale", "avena"],
    latticini: [
      "latte",
      "panna",
      "burro",
      "formaggio",
      "mozzarella",
      "ricotta",
      "parmigiano",
      "pecorino",
      "gorgonzola",
      "provola",
      "mascarpone",
      "yogurt",
    ],
    uova: ["uovo", "uova", "tuorlo", "albume"],
    pesce: ["pesce", "tonno", "salmone", "acciughe", "alici", "branzino", "orata", "merluzzo", "spigola"],
    crostacei: ["gamberi", "scampi", "aragosta", "granchi", "gamberetti", "mazzancolle", "astice"],
    molluschi: ["vongole", "cozze", "calamari", "polpo", "seppie", "ostriche", "capesante", "totani"],
    "frutta a guscio": ["mandorle", "noci", "nocciole", "pistacchi", "anacardi", "pinoli"],
    arachidi: ["arachidi", "noccioline"],
    soia: ["soia", "tofu", "edamame"],
    sedano: ["sedano"],
    senape: ["senape"],
    sesamo: ["sesamo"],
    lupini: ["lupini"],
    "anidride solforosa e solfiti": ["vino", "aceto balsamico", "solfiti"],
  };

  const foundAllergens = new Set<string>();

  ingredients.forEach((ingredient) => {
    const ingredientName = ingredient.name.toLowerCase();

    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some((keyword) => ingredientName.includes(keyword))) {
        foundAllergens.add(allergen);
      }
    });
  });

  return Array.from(foundAllergens);
}
