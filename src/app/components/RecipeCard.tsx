import { Recipe } from "../services/recipeService";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl border border-[#e8e0f4] bg-white shadow-sm transition-shadow duration-300 text-left hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#f1e8ff] to-[#e9fdf8]">
        <ImageWithFallback
          src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="flex-1 text-lg font-bold text-[#1b0736]">
            {recipe.name}
          </h3>
          <span className="ml-2 text-lg font-black text-[#2a0a4a]">
            € {recipe.salePrice.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        {recipe.description && (
          <p className="mb-2 line-clamp-2 text-sm text-[#60547d]">
            {recipe.description}
          </p>
        )}
        
        {recipe.allergens && recipe.allergens.length > 0 && (
          <div className="mt-3 border-t border-[#ece5f8] pt-3">
            <div className="flex items-start gap-2">
              <span className="whitespace-nowrap text-xs font-semibold text-[#ff1dbb]">Allergeni:</span>
              <span className="text-xs capitalize leading-relaxed text-[#4a3f63]">
                {recipe.allergens.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
