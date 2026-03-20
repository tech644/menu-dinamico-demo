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

export async function getAllRecipes(): Promise<Recipe[]> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const recipesData = await loadRecipesData();
    return recipesData.recipes as Recipe[];
  }

  try {
    const db = getFirestoreDb();
    const recipesRef = collection(db, "recipes");
    const snapshot = await getDocs(recipesRef);

    return snapshot.docs.map((recipeDoc) => {
      const data = recipeDoc.data() as Partial<Recipe>;
      const ingredients = (data.ingredients || []) as Ingredient[];
      return {
        ...data,
        recipeId: data.recipeId || recipeDoc.id,
        allergens: extractAllergens(ingredients),
      } as Recipe;
    });
  } catch (error) {
    console.error("Error loading recipes from Firestore, using mock data:", error);
    const recipesData = await loadRecipesData();
    return recipesData.recipes as Recipe[];
  }
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const recipesData = await loadRecipesData();
    const recipe = recipesData.recipes.find((r: any) => r.recipeId === recipeId);

    if (recipe) {
      const allergens = extractAllergens(recipe.ingredients);
      return { ...recipe, allergens } as Recipe;
    }

    return null;
  }

  try {
    const db = getFirestoreDb();
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnapshot = await getDoc(recipeRef);

    if (recipeSnapshot.exists()) {
      const data = recipeSnapshot.data() as Partial<Recipe>;
      const ingredients = (data.ingredients || []) as Ingredient[];
      return {
        ...data,
        recipeId: data.recipeId || recipeSnapshot.id,
        allergens: extractAllergens(ingredients),
      } as Recipe;
    }

    const recipesRef = collection(db, "recipes");
    const q = query(recipesRef, where("recipeId", "==", recipeId), limit(1));
    const fallbackSnapshot = await getDocs(q);

    if (!fallbackSnapshot.empty) {
      const foundDoc = fallbackSnapshot.docs[0];
      const data = foundDoc.data() as Partial<Recipe>;
      const ingredients = (data.ingredients || []) as Ingredient[];
      return {
        ...data,
        recipeId: data.recipeId || foundDoc.id,
        allergens: extractAllergens(ingredients),
      } as Recipe;
    }

    return null;
  } catch (error) {
    console.error("Error loading recipe from Firestore, using mock data:", error);
    const recipesData = await loadRecipesData();
    const recipe = recipesData.recipes.find((r: any) => r.recipeId === recipeId);

    if (recipe) {
      const allergens = extractAllergens(recipe.ingredients);
      return { ...recipe, allergens } as Recipe;
    }

    return null;
  }
}

export async function getRecipesByIds(recipeIds: string[]): Promise<Recipe[]> {
  if (recipeIds.length === 0) {
    return [];
  }

  if (!isFirebaseConfigured) {
    const allRecipes = await getAllRecipes();
    return allRecipes
      .filter(recipe => recipeIds.includes(recipe.recipeId))
      .map(recipe => ({
        ...recipe,
        allergens: extractAllergens(recipe.ingredients),
      }));
  }

  try {
    const db = getFirestoreDb();
    const recipesRef = collection(db, "recipes");
    const chunks: string[][] = [];

    for (let i = 0; i < recipeIds.length; i += 10) {
      chunks.push(recipeIds.slice(i, i + 10));
    }

    const foundMap = new Map<string, Recipe>();

    for (const chunk of chunks) {
      const byDocumentId = query(recipesRef, where(documentId(), "in", chunk));
      const byDocumentIdSnapshot = await getDocs(byDocumentId);

      byDocumentIdSnapshot.docs.forEach((recipeDoc) => {
        const data = recipeDoc.data() as Partial<Recipe>;
        const ingredients = (data.ingredients || []) as Ingredient[];
        const normalized = {
          ...data,
          recipeId: data.recipeId || recipeDoc.id,
          allergens: extractAllergens(ingredients),
        } as Recipe;

        foundMap.set(normalized.recipeId, normalized);
      });

      const missingIds = chunk.filter((id) => !foundMap.has(id));
      if (missingIds.length === 0) {
        continue;
      }

      const byField = query(recipesRef, where("recipeId", "in", missingIds));
      const byFieldSnapshot = await getDocs(byField);

      byFieldSnapshot.docs.forEach((recipeDoc) => {
        const data = recipeDoc.data() as Partial<Recipe>;
        const ingredients = (data.ingredients || []) as Ingredient[];
        const normalized = {
          ...data,
          recipeId: data.recipeId || recipeDoc.id,
          allergens: extractAllergens(ingredients),
        } as Recipe;

        foundMap.set(normalized.recipeId, normalized);
      });
    }

    return recipeIds
      .map((id) => foundMap.get(id))
      .filter((recipe): recipe is Recipe => recipe !== undefined);
  } catch (error) {
    console.error("Error loading recipes by IDs from Firestore, using mock data:", error);
    const allRecipes = await getAllRecipes();
    return allRecipes
      .filter(recipe => recipeIds.includes(recipe.recipeId))
      .map(recipe => ({
        ...recipe,
        allergens: extractAllergens(recipe.ingredients),
      }));
  }
}

// Helper function to extract allergens from ingredients
function extractAllergens(ingredients: Ingredient[]): string[] {
  const allergenMap: { [key: string]: string[] } = {
    'glutine': ['farina', 'spaghetti', 'pasta', 'pane', 'grano', 'frumento', 'orzo', 'segale', 'avena'],
    'latticini': ['latte', 'panna', 'burro', 'formaggio', 'mozzarella', 'ricotta', 'parmigiano', 'pecorino', 'gorgonzola', 'provola', 'mascarpone', 'yogurt'],
    'uova': ['uovo', 'uova', 'tuorlo', 'albume'],
    'pesce': ['pesce', 'tonno', 'salmone', 'acciughe', 'alici', 'branzino', 'orata', 'merluzzo', 'spigola'],
    'crostacei': ['gamberi', 'scampi', 'aragosta', 'granchi', 'gamberetti', 'mazzancolle', 'astice'],
    'molluschi': ['vongole', 'cozze', 'calamari', 'polpo', 'seppie', 'ostriche', 'capesante', 'totani'],
    'frutta a guscio': ['mandorle', 'noci', 'nocciole', 'pistacchi', 'anacardi', 'pinoli'],
    'arachidi': ['arachidi', 'noccioline'],
    'soia': ['soia', 'tofu', 'edamame'],
    'sedano': ['sedano'],
    'senape': ['senape'],
    'sesamo': ['sesamo'],
    'lupini': ['lupini'],
    'anidride solforosa e solfiti': ['vino', 'aceto balsamico', 'solfiti'],
  };

  const foundAllergens = new Set<string>();

  ingredients.forEach(ingredient => {
    const ingredientName = ingredient.name.toLowerCase();
    
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => ingredientName.includes(keyword))) {
        foundAllergens.add(allergen);
      }
    });
  });

  return Array.from(foundAllergens);
}
