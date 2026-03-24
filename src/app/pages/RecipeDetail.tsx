import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getRecipeById, Recipe } from "../services/recipeService";
import { getAllergensInfo } from "../services/allergenService";
import { resolveVenueCode } from "../services/venueResolverService";
import { Header } from "../components/Header";
import { LocalDemoLogo } from "../components/LocalDemoLogo";
import { AllergenIcon } from "../components/AllergenIcon";
// import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AlertCircle } from "lucide-react";
// import { getRecipeImageUrl } from "../utils/recipeImage";

// Recipe detail page with hero image, allergen info, and pricing.
export default function RecipeDetail() {
  const { venueCode, recipeId } = useParams<{ venueCode: string; recipeId: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      if (!recipeId) return;
      
      try {
        let businessId: string | undefined;
        if (venueCode) {
          const venue = await resolveVenueCode(venueCode);
          businessId = venue?.businessId;
        }
        const data = await getRecipeById(recipeId, businessId);
        setRecipe(data);
      } catch (error) {
        console.error("Error loading recipe:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [recipeId, venueCode]);

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
      <Header showBack={true} leftContent={<LocalDemoLogo showName={false} size="sm" className="mr-1" />} />
      
      {/*
      Hero Image (temporaneamente nascosta)
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#efe6ff] to-[#e9fdf8] md:h-96">
        <ImageWithFallback
          src={getRecipeImageUrl(recipe, "hero")}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      */}

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        {/* Recipe Card */}
        <div className="ord-detail-card bg-white p-6 md:p-8 mb-6">
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

          {/* Allergens */}
          {allergensInfo.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#ff1dbb]" />
                <h2 className="text-xl font-semibold text-[#1b0736]">Allergeni</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {allergensInfo.map((allergen) => (
                  <div
                    key={allergen.id}
                    className="rounded-xl border-2 border-[#f7c8eb] bg-gradient-to-br from-[#fff0fa] to-[#f4f0ff] p-4 text-center"
                  >
                    <span className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e9dcfb] bg-white text-[#5f537d]">
                      <AllergenIcon allergenName={allergen.name} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold capitalize text-[#7d165f]">
                      {allergen.name}
                    </span>
                  </div>
                ))}
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
