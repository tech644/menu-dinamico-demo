import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getRecipeById, Recipe } from "../services/recipeService";
import { getAllergensInfo } from "../services/allergenService";
import { Header } from "../components/Header";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AlertCircle, ChefHat } from "lucide-react";
import { getRecipeImageUrl } from "../utils/recipeImage";

export default function RecipeDetail() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      if (!recipeId) return;
      
      try {
        const data = await getRecipeById(recipeId);
        setRecipe(data);
      } catch (error) {
        console.error("Error loading recipe:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [recipeId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="mb-4 text-[#5f537d]">Ricetta non trovata</p>
      </div>
    );
  }

  const allergensInfo = getAllergensInfo(recipe.allergens || []);

  return (
    <div className="ord-page-bg min-h-screen">
      <Header showBack={true} />
      
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#efe6ff] to-[#e9fdf8] md:h-96">
        <ImageWithFallback
          src={getRecipeImageUrl(recipe, "hero")}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        {/* Recipe Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="flex-1 text-3xl font-bold text-[#1b0736] md:text-4xl">
              {recipe.name}
            </h1>
            <div className="text-right ml-4">
              <div className="text-3xl font-black text-[#2a0a4a]">
                € {recipe.salePrice.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {recipe.description && (
            <p className="mb-6 text-lg leading-relaxed text-[#5f537d]">
              {recipe.description}
            </p>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="h-5 w-5 text-[#2a0a4a]" />
                <h2 className="text-xl font-semibold text-[#1b0736]">Ingredienti</h2>
              </div>
              <div className="rounded-xl bg-[#f7f3ff] p-4">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                      <span className="capitalize">{ingredient.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Allergens */}
          {allergensInfo.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Allergeni</h2>
                  <div className="space-y-3">
                    {allergensInfo.map((allergen) => (
                      <div
                        key={allergen.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <h3 className="font-semibold text-red-900 capitalize mb-1">
                          {allergen.name}
                        </h3>
                        <p className="text-sm text-red-700">{allergen.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nutritional Info */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#f7f3ff] p-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Costo</div>
                <div className="text-lg font-semibold text-gray-900">
                  € {recipe.totalCost.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg bg-[#f7f3ff] p-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Food Cost</div>
                <div className="text-lg font-semibold text-gray-900">
                  {recipe.foodCostPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="col-span-2 rounded-lg bg-[#f7f3ff] p-3 text-center md:col-span-1">
                <div className="text-sm text-gray-600 mb-1">Prezzo</div>
                <div className="text-lg font-semibold text-[#2a0a4a]">
                  € {recipe.salePrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  );
}
