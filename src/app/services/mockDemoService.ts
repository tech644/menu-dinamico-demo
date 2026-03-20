import menuJson from "../../datamocked/menu.json";
import recipesJson from "../../datamocked/ricette.json";
import { Menu } from "./menuService";
import { Ingredient, Recipe } from "./recipeService";

export async function getDemoMenus(): Promise<Menu[]> {
  return [menuJson.menu as Menu];
}

export async function getDemoMenuById(menuId: string): Promise<Menu | null> {
  const menu = menuJson.menu as Menu;
  return menu.menuId === menuId ? menu : null;
}

export async function getDemoRecipesByIds(recipeIds: string[]): Promise<Recipe[]> {
  const recipes = recipesJson.recipes as Recipe[];
  return recipes
    .filter(recipe => recipeIds.includes(recipe.recipeId))
    .map(recipe => ({
      ...recipe,
      allergens: extractAllergens(recipe.ingredients),
    }));
}

export async function getDemoRecipeById(recipeId: string): Promise<Recipe | null> {
  const recipes = recipesJson.recipes as Recipe[];
  const recipe = recipes.find((item) => item.recipeId === recipeId);
  if (!recipe) {
    return null;
  }

  return {
    ...recipe,
    allergens: extractAllergens(recipe.ingredients),
  };
}

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
