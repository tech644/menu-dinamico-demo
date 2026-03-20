// Type definitions for Recipe structure
export interface Product {
  refProductId: string;
  quantity: number;
  unit: string;
  unitOverridden: boolean;
  scarto: number;
  lastPrice: number;
  priceOverridden: boolean;
}

export interface Ingredient {
  ingredientId: string;
  name: string;
  products: Product[];
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
  imageUrl?: string; // Optional image URL
  allergens?: string[]; // Array of allergen names
}

export interface RecipesData {
  recipes: Recipe[];
}

// Allergen types commonly found in Italian cuisine
export type AllergenType = 
  | 'Glutine'
  | 'Crostacei'
  | 'Uova'
  | 'Pesce'
  | 'Arachidi'
  | 'Soia'
  | 'Latte'
  | 'Frutta a guscio'
  | 'Sedano'
  | 'Senape'
  | 'Sesamo'
  | 'Anidride solforosa'
  | 'Lupini'
  | 'Molluschi';

export interface Allergen {
  type: AllergenType;
  description: string;
}