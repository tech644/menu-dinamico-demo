import { useEffect, useState, useRef } from "react";
import { useMatch, useNavigate, useParams } from "react-router";
import { getMenuByIdForVenue, Menu, MenuSection } from "../services/menuService";
import { getRecipesByIds, Recipe } from "../services/recipeService";
import { getAllergensInfo } from "../services/allergenService";
import { Header } from "../components/Header";
import { CategoryTabs } from "../components/CategoryTabs";
import { RecipeCard } from "../components/RecipeCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { AlertCircle, ChefHat } from "lucide-react";
import { resolveVenueCode } from "../services/venueResolverService";
import NotFound from "./NotFound";
import {
  getDemoMenuById,
  getDemoRecipesByIds,
} from "../services/mockDemoService";
import {
  SupportedLanguage,
  translateMenuAndRecipes,
} from "../services/deeplMenuTranslationService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string; flag: string }> = [
  { value: "it", label: "IT", flag: "🇮🇹" },
  { value: "en", label: "EN", flag: "🇬🇧" },
  { value: "es", label: "ES", flag: "🇪🇸" },
  { value: "fr", label: "FR", flag: "🇫🇷" },
  { value: "de", label: "DE", flag: "🇩🇪" },
];

const UI_LABELS: Record<
  SupportedLanguage,
  {
    menu: string;
    allergens: string;
    ingredients: string;
    noRecipes: string;
    recipeNotFound: string;
    translating: string;
  }
> = {
  it: {
    menu: "Menu",
    allergens: "Allergeni",
    ingredients: "Ingredienti",
    noRecipes: "Nessuna ricetta disponibile in questa sezione",
    recipeNotFound: "Ricetta non trovata",
    translating: "Traduzione in corso...",
  },
  en: {
    menu: "Menu",
    allergens: "Allergens",
    ingredients: "Ingredients",
    noRecipes: "No recipes available in this section",
    recipeNotFound: "Recipe not found",
    translating: "Translating...",
  },
  es: {
    menu: "Menú",
    allergens: "Alérgenos",
    ingredients: "Ingredientes",
    noRecipes: "No hay recetas disponibles en esta sección",
    recipeNotFound: "Receta no encontrada",
    translating: "Traduciendo...",
  },
  fr: {
    menu: "Menu",
    allergens: "Allergènes",
    ingredients: "Ingrédients",
    noRecipes: "Aucune recette disponible dans cette section",
    recipeNotFound: "Recette introuvable",
    translating: "Traduction en cours...",
  },
  de: {
    menu: "Menü",
    allergens: "Allergene",
    ingredients: "Zutaten",
    noRecipes: "Keine Rezepte in diesem Bereich verfügbar",
    recipeNotFound: "Rezept nicht gefunden",
    translating: "Übersetzung läuft...",
  },
};

export default function MenuDetail() {
  const { venueCode, menuId } = useParams<{ venueCode: string; menuId: string }>();
  const isDemoRoute = Boolean(useMatch("/:venueCode/menu_demo/:menuId"));
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<SupportedLanguage>("it");
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedMenu, setTranslatedMenu] = useState<Menu | null>(null);
  const [translatedRecipes, setTranslatedRecipes] = useState<Recipe[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const isScrollingProgrammatically = useRef(false);

  useEffect(() => {
    async function loadMenuData() {
      if (!menuId || !venueCode) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        let menuData: Menu | null = null;

        if (isDemoRoute) {
          menuData = await getDemoMenuById(menuId);
          if (import.meta.env.DEV) {
            console.log("[MenuDetail][demo] menu lookup result", { menuId, found: Boolean(menuData), menuData });
          }
        } else {
          const venue = await resolveVenueCode(venueCode);
          if (import.meta.env.DEV) {
            console.log("[MenuDetail] venue resolve result", { venueCode, venue, menuId });
          }
          if (!venue) {
            setNotFound(true);
            return;
          }

          menuData = await getMenuByIdForVenue(menuId, venue);
          if (import.meta.env.DEV) {
            console.log("[MenuDetail] menu lookup result", { menuId, found: Boolean(menuData), menuData });
          }
        }

        if (!menuData) {
          setNotFound(true);
          return;
        }
        
        setMenu(menuData);
        
        // Extract all recipe IDs from menu sections
        const recipeIds = menuData.sections.flatMap(section =>
          section.items.map(item => item.refId)
        );
        
        // Load all recipes
        const recipesData = isDemoRoute
          ? await getDemoRecipesByIds(recipeIds)
          : await getRecipesByIds(recipeIds);
        setRecipes(recipesData);
        
        // Set first section as active
        if (menuData.sections.length > 0) {
          setActiveSection(menuData.sections[0].sectionId);
        }
      } catch (error) {
        console.error("Error loading menu:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadMenuData();
  }, [isDemoRoute, menuId, venueCode]);

  useEffect(() => {
    async function runTranslation() {
      if (!menu) {
        return;
      }

      if (language === "it") {
        setTranslationError(null);
        setTranslatedMenu(menu);
        setTranslatedRecipes(recipes);
        return;
      }

      try {
        setTranslationError(null);
        setTranslating(true);
        const translated = await translateMenuAndRecipes(menu, recipes, language);
        setTranslatedMenu(translated.menu);
        setTranslatedRecipes(translated.recipes);
      } catch (error) {
        console.error("Error translating menu with DeepL:", error);
        setTranslationError("Traduzione non disponibile al momento.");
        setTranslatedMenu(menu);
        setTranslatedRecipes(recipes);
      } finally {
        setTranslating(false);
      }
    }

    runTranslation();
  }, [language, menu, recipes]);

  useEffect(() => {
    // Intersection Observer to update active section on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;
        
        // Find the entry with the highest intersection ratio
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Find the section that is closest to the top of the viewport
          const mostVisible = visibleEntries.reduce((prev, current) => {
            const prevTop = prev.boundingClientRect.top;
            const currentTop = current.boundingClientRect.top;
            
            // If both are above the trigger point (header + tabs area), choose the one closer to bottom
            if (prevTop < 100 && currentTop < 100) {
              return prevTop > currentTop ? prev : current;
            }
            
            // Otherwise, choose the one closest to the top
            return Math.abs(currentTop - 100) < Math.abs(prevTop - 100) ? current : prev;
          });
          
          setActiveSection(mostVisible.target.id);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: "-100px 0px -40% 0px", // Less aggressive bottom margin
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [menu]);

  const handleCategoryChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    
    if (element) {
      isScrollingProgrammatically.current = true;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    }
  };

  const effectiveMenu = translatedMenu || menu;
  const effectiveRecipes = translatedRecipes.length > 0 ? translatedRecipes : recipes;
  const labels = UI_LABELS[language];

  const getRecipesBySection = (section: MenuSection): Recipe[] => {
    return section.items
      .map(item => effectiveRecipes.find(r => r.recipeId === item.refId))
      .filter((r): r is Recipe => r !== undefined);
  };

  const handleRecipeClick = (recipeId: string) => {
    const recipe = effectiveRecipes.find((item) => item.recipeId === recipeId) || null;
    setSelectedRecipe(recipe);
    setIsSheetOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notFound) {
    return <NotFound message="Menu non trovato per questo locale." />;
  }

  if (!menu || !effectiveMenu) {
    return <NotFound message="Menu non trovato per questo locale." />;
  }

  return (
    <div className="ord-page-bg min-h-screen">
      <Header
        showBack={false}
        title={effectiveMenu.name}
        rightContent={
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as SupportedLanguage)}
          >
            <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-0 py-0 text-3xl leading-none shadow-none ring-0 [&>svg]:hidden">
              <span>{LANGUAGE_OPTIONS.find((option) => option.value === language)?.flag}</span>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-[#e3d9f1] bg-white p-0">
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="h-12 border-b border-[#ece4f6] px-4 text-lg text-[#241833] last:border-b-0"
                >
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      
      <CategoryTabs
        categories={effectiveMenu.sections.map(s => s.name)}
        activeCategory={effectiveMenu.sections.find(s => s.sectionId === activeSection)?.name || ""}
        leadingActionLabel={labels.menu}
        onLeadingActionClick={() => {
          if (!venueCode) return;
          navigate(`/${venueCode}/${isDemoRoute ? "menu_demo" : "menu"}`);
        }}
        onCategoryChange={(name) => {
          const section = effectiveMenu.sections.find(s => s.name === name);
          if (section) handleCategoryChange(section.sectionId);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {language !== "it" && translationError && (
          <div className="mb-4 rounded-xl border border-[#f1d6db] bg-[#fff5f6] px-4 py-3 text-sm font-medium text-[#8b2f3f]">
            {translationError}
          </div>
        )}

        {effectiveMenu.sections.map((section) => {
          const sectionRecipes = getRecipesBySection(section);
          
          return (
            <section
              key={section.sectionId}
              id={section.sectionId}
              ref={(el) => (sectionRefs.current[section.sectionId] = el)}
              className="mb-12 scroll-mt-[138px]"
            >
              <div className="mb-6">
                <h2 className="mb-1 text-2xl font-bold text-[#1b0736]">
                  {section.name}
                </h2>
                <div className="ord-accent-line h-1 w-16 rounded-full"></div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sectionRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.recipeId}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe.recipeId)}
                  />
                ))}
              </div>

              {sectionRecipes.length === 0 && (
                <p className="py-8 text-center text-[#6a5c86]">{labels.noRecipes}</p>
              )}
            </section>
          );
        })}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[76vh] overflow-y-auto rounded-t-3xl md:inset-x-auto md:left-1/2 md:w-[calc(100%-2rem)] md:max-w-5xl md:-translate-x-1/2 md:rounded-3xl md:max-h-[82vh]"
        >
          {selectedRecipe ? (
            <div className="mx-auto w-full max-w-3xl pb-8">
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedRecipe.name}</SheetTitle>
              </SheetHeader>
              
              {/* Hero Image */}
              <div className="relative mb-6 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-[#efe6ff] to-[#e9fdf8] md:h-64">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Recipe Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="flex-1 text-2xl font-bold text-[#1b0736] md:text-3xl">
                    {selectedRecipe.name}
                  </h1>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-black text-[#2a0a4a] md:text-3xl">
                      € {selectedRecipe.salePrice.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                {selectedRecipe.description && (
                  <p className="mb-6 text-base leading-relaxed text-[#5f537d] md:text-lg">
                    {selectedRecipe.description}
                  </p>
                )}

                {translating && (
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#8a7aa8]">
                    {labels.translating}
                  </p>
                )}

                {/* Ingredients & Allergens - Conditional Tabs or Direct Display */}
                {(() => {
                  const hasAllergens = selectedRecipe.allergens && selectedRecipe.allergens.length > 0;
                  const hasIngredients = selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0;

                  // If both exist, show tabs with allergens first
                  if (hasAllergens && hasIngredients) {
                    return (
                      <Tabs defaultValue="allergens" className="mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="allergens" className="gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {labels.allergens}
                          </TabsTrigger>
                          <TabsTrigger value="ingredients" className="gap-2">
                            <ChefHat className="w-4 h-4" />
                            {labels.ingredients}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="allergens" className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {getAllergensInfo(selectedRecipe.allergens).map((allergen) => (
                              <div
                                key={allergen.id}
                                className="rounded-xl border-2 border-[#f7c8eb] bg-gradient-to-br from-[#fff0fa] to-[#f4f0ff] p-4 text-center transition-shadow hover:shadow-md"
                              >
                                <div className="text-3xl mb-2">{getAllergenEmoji(allergen.name)}</div>
                                <h3 className="text-sm font-semibold capitalize text-[#7d165f]">
                                  {allergen.name}
                                </h3>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="ingredients" className="mt-4">
                          <div className="rounded-xl bg-[#f7f3ff] p-4">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedRecipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-center gap-2 text-[#4a3f63]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff1dbb]"></span>
                                  <span className="capitalize">{ingredient.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>
                      </Tabs>
                    );
                  }

                  // If only allergens exist, show allergens directly
                  if (hasAllergens) {
                    return (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-5 w-5 text-[#ff1dbb]" />
                          <h2 className="text-xl font-semibold text-[#1b0736]">{labels.allergens}</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {getAllergensInfo(selectedRecipe.allergens).map((allergen) => (
                            <div
                              key={allergen.id}
                              className="rounded-xl border-2 border-[#f7c8eb] bg-gradient-to-br from-[#fff0fa] to-[#f4f0ff] p-4 text-center transition-shadow hover:shadow-md"
                            >
                              <div className="text-3xl mb-2">{getAllergenEmoji(allergen.name)}</div>
                              <h3 className="text-sm font-semibold capitalize text-[#7d165f]">
                                {allergen.name}
                              </h3>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // If only ingredients exist, show ingredients directly
                  if (hasIngredients) {
                    return (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <ChefHat className="h-5 w-5 text-[#2a0a4a]" />
                          <h2 className="text-xl font-semibold text-[#1b0736]">{labels.ingredients}</h2>
                        </div>
                        <div className="rounded-xl bg-[#f7f3ff] p-4">
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {selectedRecipe.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-2 text-[#4a3f63]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#ff1dbb]"></span>
                                <span className="capitalize">{ingredient.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* Nutritional Info */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#5f537d]">{labels.recipeNotFound}</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getAllergenEmoji(allergenName: string): string {
  const normalized = allergenName.toLowerCase().trim();
  
  if (normalized.includes("glutine")) return "🌾";
  if (normalized.includes("lattici") || normalized.includes("latte")) return "🥛";
  if (normalized.includes("uova") || normalized.includes("uovo")) return "🥚";
  if (normalized.includes("pesce")) return "🐟";
  if (normalized.includes("crostacei")) return "🦞";
  if (normalized.includes("molluschi")) return "🐙";
  if (normalized.includes("arachidi")) return "🥜";
  if (normalized.includes("frutta a guscio") || normalized.includes("noci")) return "🌰";
  if (normalized.includes("sesamo")) return "🌱";
  if (normalized.includes("soia")) return "🫘";
  if (normalized.includes("sedano")) return "🌿";
  if (normalized.includes("senape")) return "🟡";
  if (normalized.includes("lupini")) return "🫛";
  if (normalized.includes("solfiti") || normalized.includes("anidride solforosa")) return "🍷";
  
  return "⚠️";
}
