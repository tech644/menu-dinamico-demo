type RecipeImageLike = {
  recipeId?: string;
  name?: string;
  imageUrl?: string;
};

type ImageSize = "card" | "hero";

const DEMO_RECIPE_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1525755662778-989d0524087e",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
  "https://images.unsplash.com/photo-1600891964092-4316c288032e",
];

// Stable hash used to select repeatable demo images for recipes.
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function withUnsplashSizing(url: string, size: ImageSize): string {
  if (!url.includes("images.unsplash.com")) {
    return url;
  }

  const dimensions =
    size === "hero"
      ? "w=1400&h=900"
      : "w=800&h=450";

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${dimensions}&fit=crop&auto=format&q=80`;
}

export function getRecipeImageUrl(recipe: RecipeImageLike, size: ImageSize = "card"): string {
  if (recipe.imageUrl) {
    return withUnsplashSizing(recipe.imageUrl, size);
  }

  const seed = recipe.recipeId || recipe.name || "recipe-demo";
  const index = hashString(seed) % DEMO_RECIPE_IMAGES.length;
  return withUnsplashSizing(DEMO_RECIPE_IMAGES[index], size);
}
