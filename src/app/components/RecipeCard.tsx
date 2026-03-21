import { Recipe } from "../services/recipeService";
// import { getRecipeImageUrl } from "../utils/recipeImage";
// import { ImageWithFallback } from "./media/ImageWithFallback";

// Presentational card for a single recipe in the menu grid.
interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // const imageUrl = getRecipeImageUrl(recipe, "card");
  const allergensLabel =
    recipe.allergens && recipe.allergens.length > 0
      ? recipe.allergens.join(", ")
      : "Nessuno";

  return (
    <button
      type="button"
      onClick={onClick}
      className="ord-recipe-card flex h-full w-full min-w-0 appearance-none flex-col overflow-hidden border bg-white p-0 text-left transition-shadow duration-300 hover:shadow-md"
    >
      {/*
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#f1e8ff] to-[#e9fdf8]">
        <ImageWithFallback
          src={imageUrl}
          alt={recipe.name}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>
      */}

      <div className="flex w-full min-w-0 flex-1 flex-col p-4">
        <div className="mb-2 flex w-full min-w-0 items-start gap-2">
          <h3 className="min-w-0 flex-1 text-lg font-bold text-[#1b0736]">
            {recipe.name}
          </h3>
          <span className="ml-auto shrink-0 text-lg font-black text-[#2a0a4a]">
            € {recipe.salePrice.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        {recipe.description && (
          <p className="mb-2 min-h-[3.25rem] line-clamp-2 text-sm text-[#60547d]">
            {recipe.description}
          </p>
        )}

        <div className="mt-auto w-full border-t border-[#ece5f8] pt-3">
          <div className="flex min-h-6 items-start gap-2">
            <span className="whitespace-nowrap text-xs font-semibold text-[#ff1dbb]">Allergeni:</span>
            <span className="text-xs capitalize leading-relaxed text-[#4a3f63]">
              {allergensLabel}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
