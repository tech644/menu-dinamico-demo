import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useMatch, useNavigate, useParams } from "react-router";
import { getMenuByIdForVenue, Menu, MenuSection } from "../services/menuService";
import { getRecipesByIds, Recipe } from "../services/recipeService";
import { getAllergensInfo } from "../services/allergenService";
import { Header } from "../components/Header";
import { CategoryTabs } from "../components/CategoryTabs";
import { RecipeCard } from "../components/RecipeCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LocalDemoLogo } from "../components/LocalDemoLogo";
import { AllergenIcon } from "../components/AllergenIcon";
// import { ImageWithFallback } from "../components/media/ImageWithFallback";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import {
  AlertCircle,
  ChevronRight,
  List,
  Loader2,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Phone,
  Search,
  Share2,
  ShieldAlert,
} from "lucide-react";
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
import { isMenuAvailableNow } from "../utils/menuAvailability";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";
import { useIsMobile } from "../components/ui/use-mobile";
// import { getRecipeImageUrl } from "../utils/recipeImage";
import { Input } from "../components/ui/input";

// Menu detail page with section navigation, recipe sheet, translation, and venue contacts.
const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string; marker: string }> = [
  { value: "it", label: "Italiano", marker: "🇮🇹" },
  { value: "en", label: "English", marker: "🇬🇧" },
  { value: "es", label: "Español", marker: "🇪🇸" },
  { value: "fr", label: "Français", marker: "🇫🇷" },
  { value: "de", label: "Deutsch", marker: "🇩🇪" },
];

const UI_LABELS: Record<
  SupportedLanguage,
  {
    menu: string;
    allergens: string;
    noRecipes: string;
    recipeNotFound: string;
    translating: string;
  }
> = {
  it: {
    menu: "Menu",
    allergens: "Allergeni",
    noRecipes: "Nessuna ricetta disponibile in questa sezione",
    recipeNotFound: "Ricetta non trovata",
    translating: "Traduzione in corso...",
  },
  en: {
    menu: "Menu",
    allergens: "Allergens",
    noRecipes: "No recipes available in this section",
    recipeNotFound: "Recipe not found",
    translating: "Translating...",
  },
  es: {
    menu: "Menú",
    allergens: "Alérgenos",
    noRecipes: "No hay recetas disponibles en esta sección",
    recipeNotFound: "Receta no encontrada",
    translating: "Traduciendo...",
  },
  fr: {
    menu: "Menu",
    allergens: "Allergènes",
    noRecipes: "Aucune recette disponible dans cette section",
    recipeNotFound: "Recette introuvable",
    translating: "Traduction en cours...",
  },
  de: {
    menu: "Menü",
    allergens: "Allergene",
    noRecipes: "Keine Rezepte in diesem Bereich verfügbar",
    recipeNotFound: "Rezept nicht gefunden",
    translating: "Übersetzung läuft...",
  },
};

export default function MenuDetail() {
  const { venueCode, menuId } = useParams<{ venueCode: string; menuId: string }>();
  const isDemoRoute = Boolean(useMatch("/:venueCode/menu_demo/:menuId"));
  const location = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [unavailableNow, setUnavailableNow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<SupportedLanguage>("it");
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedMenu, setTranslatedMenu] = useState<Menu | null>(null);
  const [translatedRecipes, setTranslatedRecipes] = useState<Recipe[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<
    "categories" | "search" | "allergens" | "contacts" | "share" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const isScrollingProgrammatically = useRef(false);
  const pendingProgrammaticSectionId = useRef<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadMenuData() {
      setLoading(true);
      setNotFound(false);
      if (!menuId || !venueCode) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setUnavailableNow(false);
      
      try {
        let menuData: Menu | null = null;
        let venueTimeZone = "Europe/Rome";

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
          venueTimeZone = venue.timeZone || "Europe/Rome";

          menuData = await getMenuByIdForVenue(menuId, venue);
          if (import.meta.env.DEV) {
            console.log("[MenuDetail] menu lookup result", { menuId, found: Boolean(menuData), menuData });
          }
        }

        if (!menuData) {
          setNotFound(true);
          return;
        }

        if (!isDemoRoute && menuData.isPublic !== true) {
          setNotFound(true);
          return;
        }

        if (!isDemoRoute && !isMenuAvailableNow(menuData, { timeZone: venueTimeZone })) {
          setUnavailableNow(true);
          setNotFound(true);
          return;
        }
        
        setMenu(menuData);
        
        // Build a flat list of recipe ids referenced by menu items.
        const recipeIds = menuData.sections.flatMap(section =>
          section.items.map(item => item.refId)
        );
        
        // Fetch recipes from the appropriate data source for the current route.
        const recipesData = isDemoRoute
          ? await getDemoRecipesByIds(recipeIds)
          : await getRecipesByIds(recipeIds);
        setRecipes(recipesData);
        
        // Initialize the active section to keep tabs in sync from first render.
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
    if (!menu || isDemoRoute) {
      return;
    }

    document.documentElement.setAttribute("data-menu-template", menu.menuTemplateId);
    document.body.setAttribute("data-menu-template", menu.menuTemplateId);
  }, [isDemoRoute, menu]);

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
    const menuForSections = translatedMenu || menu;
    if (!menuForSections) return;

    // Activation line slightly below sticky header+tabs to prevent early switching.
    const activationLine = isMobile ? 168 : 154;
    let rafId: number | null = null;

    const computeActiveSection = () => {
      if (!menuForSections.sections.length) return;

      // During programmatic scroll, keep the intended tab active until its section reaches the activation line.
      if (isScrollingProgrammatically.current) {
        const targetId = pendingProgrammaticSectionId.current;
        if (targetId) {
          const targetEl = sectionRefs.current[targetId];
          if (targetEl && targetEl.getBoundingClientRect().top <= activationLine + 8) {
            isScrollingProgrammatically.current = false;
            pendingProgrammaticSectionId.current = null;
            setActiveSection(targetId);
          }
        }
        return;
      }

      const orderedSections = menuForSections.sections
        .map((section) => ({
          id: section.sectionId,
          top: sectionRefs.current[section.sectionId]?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
        }))
        .filter((section) => Number.isFinite(section.top));

      if (!orderedSections.length) return;

      const nextIndex = orderedSections.findIndex((section) => section.top > activationLine);
      const resolvedIndex =
        nextIndex === -1 ? orderedSections.length - 1 : Math.max(0, nextIndex - 1);
      const resolvedSectionId = orderedSections[resolvedIndex]?.id;

      if (resolvedSectionId) {
        setActiveSection((prev) => (prev === resolvedSectionId ? prev : resolvedSectionId));
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        computeActiveSection();
        rafId = null;
      });
    };

    computeActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isMobile, menu, translatedMenu]);

  const handleCategoryChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    
    if (element) {
      isScrollingProgrammatically.current = true;
      pendingProgrammaticSectionId.current = sectionId;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const effectiveMenu = translatedMenu || menu;
  const effectiveRecipes = translatedRecipes.length > 0 ? translatedRecipes : recipes;
  const labels = UI_LABELS[language];
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE?.trim() || "";
  const contactAddress = import.meta.env.VITE_CONTACT_ADDRESS?.trim() || "";
  const contactMapsUrl = import.meta.env.VITE_CONTACT_MAPS_URL?.trim() || "";
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim() || "";
  const emailAddress = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";

  const menuAllergens = useMemo(() => {
    const allergenIds = new Set<string>();
    for (const recipe of effectiveRecipes) {
      for (const allergen of recipe.allergens || []) {
        allergenIds.add(allergen);
      }
    }
    return getAllergensInfo(Array.from(allergenIds));
  }, [effectiveRecipes]);

  const recipeCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!effectiveMenu) {
      return map;
    }
    for (const section of effectiveMenu.sections) {
      for (const item of section.items) {
        if (!map.has(item.refId)) {
          map.set(item.refId, section.name);
        }
      }
    }
    return map;
  }, [effectiveMenu]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedSearchQuery) {
      return [];
    }
    return effectiveRecipes.filter((recipe) => recipe.name.toLowerCase().includes(normalizedSearchQuery));
  }, [effectiveRecipes, normalizedSearchQuery]);
  const activeDemoTemplate = useMemo(() => {
    const value = new URLSearchParams(location.search).get("template");
    return value ? `?template=${encodeURIComponent(value)}` : "";
  }, [location.search]);

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

  const openExternal = (url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyCurrentUrl = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
    } catch (error) {
      console.error("Unable to copy URL", error);
    }
  };

  const handleNativeShare = async () => {
    if (!currentUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: effectiveMenu.name,
          text: `Guarda il menu ${effectiveMenu.name}`,
          url: currentUrl,
        });
        return;
      } catch (error) {
        console.error("Native share canceled or failed", error);
      }
    }

    await copyCurrentUrl();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notFound) {
    return <NotFound message={unavailableNow ? "Menu non disponibile in questo momento." : "Menu non trovato per questo locale."} />;
  }

  if (!menu || !effectiveMenu) {
    return <NotFound message="Menu non trovato per questo locale." />;
  }

  return (
    <div className="ord-page-bg min-h-screen">
      <Header
        showBack={false}
        title={effectiveMenu.name}
        leftContent={
          effectiveMenu.publicLogoUrl ? (
            <span className="mr-1 inline-flex h-9 w-9 overflow-hidden rounded-full bg-white ring-1 ring-[#e5daf5]">
              <img
                src={effectiveMenu.publicLogoUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </span>
          ) : (
            <LocalDemoLogo showName={false} size="sm" className="mr-1" />
          )
        }
        rightContent={
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as SupportedLanguage)}
          >
            <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-0 py-0 text-3xl leading-none shadow-none ring-0 [&>svg]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <span>{LANGUAGE_OPTIONS.find((option) => option.value === language)?.marker}</span>
                {translating && (
                  <Loader2
                    className="h-4 w-4 animate-spin text-[#6a5c86]"
                    aria-label={labels.translating}
                  />
                )}
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-[#e3d9f1] bg-white p-0">
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="h-12 border-b border-[#ece4f6] px-4 text-lg text-[#241833] last:border-b-0"
                >
                  <span>{option.marker}</span>
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
          navigate(`/${venueCode}/${isDemoRoute ? `menu_demo${activeDemoTemplate}` : "menu"}`);
        }}
        onCategoryChange={(name) => {
          const section = effectiveMenu.sections.find(s => s.name === name);
          if (section) handleCategoryChange(section.sectionId);
        }}
      />

      <div className={`max-w-7xl mx-auto px-4 py-6 ${isMobile ? "pb-28" : ""}`}>
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
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "h-auto max-h-[76vh] overflow-y-auto rounded-t-3xl"
              : "h-full w-full overflow-y-auto border-l md:w-[46rem] md:max-w-[46rem] md:rounded-l-3xl"
          }
        >
          {selectedRecipe ? (
            <div className={isMobile ? "mx-auto w-full max-w-2xl pb-8" : "mx-auto w-full max-w-3xl px-5 pb-8 md:px-6"}>
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedRecipe.name}</SheetTitle>
              </SheetHeader>
              
              {/*
              Hero Image (temporaneamente nascosta)
              <div className="relative mb-6 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-[#efe6ff] to-[#e9fdf8] md:h-64">
                <ImageWithFallback
                  src={getRecipeImageUrl(selectedRecipe, "hero")}
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              */}

              {/* Recipe Card */}
              <div className="ord-detail-card bg-white p-6 md:p-8 mb-6">
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

                {selectedRecipe.allergens && selectedRecipe.allergens.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-[#ff1dbb]" />
                      <h2 className="text-xl font-semibold text-[#1b0736]">{labels.allergens}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                      {getAllergensInfo(selectedRecipe.allergens).map((allergen) => (
                        <div
                          key={allergen.id}
                          className="rounded-xl border-2 border-[#f7c8eb] bg-gradient-to-br from-[#fff0fa] to-[#f4f0ff] p-4 text-center transition-shadow hover:shadow-md"
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

      {isMobile && (
        <>
          <Sheet open={Boolean(mobileSheet)} onOpenChange={(open) => !open && setMobileSheet(null)}>
            <SheetContent
              side="bottom"
              className={
                mobileSheet === "search"
                  ? "h-[90vh] max-h-[90vh] overflow-y-auto rounded-t-3xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
                  : "h-auto max-h-[88vh] overflow-y-auto rounded-t-3xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
              }
            >
              <SheetHeader className="px-1 pb-2">
                <SheetTitle className="text-2xl font-bold text-[#1b0736]">
                  {mobileSheet === "categories" && "Categorie"}
                  {mobileSheet === "search" && "Cerca piatto"}
                  {mobileSheet === "allergens" && "Allergeni"}
                  {mobileSheet === "contacts" && "Contatti"}
                  {mobileSheet === "share" && "Condividi Menù"}
                </SheetTitle>
              </SheetHeader>

              {mobileSheet === "categories" && (
                <div className="space-y-2 pb-2">
                  {effectiveMenu.sections.map((section) => (
                    <div key={section.sectionId} className="rounded-2xl border border-[#e8e0f4] bg-white p-3">
                      <button
                        onClick={() => {
                          handleCategoryChange(section.sectionId);
                          setMobileSheet(null);
                        }}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <span className="text-base font-semibold text-[#1b0736]">{section.name}</span>
                        <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                      </button>
                      {section.subSections?.length > 0 && (
                        <ul className="mt-2 space-y-1 border-t border-[#f0eafb] pt-2">
                          {section.subSections.map((subSection) => (
                            <li key={subSection.subSectionId} className="text-sm text-[#6a5c86]">
                              - {subSection.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mobileSheet === "allergens" && (
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {menuAllergens.length > 0 ? (
                    menuAllergens.map((allergen) => (
                      <div
                        key={allergen.id}
                        className="rounded-xl border-2 border-[#f7c8eb] bg-gradient-to-br from-[#fff0fa] to-[#f4f0ff] p-4 text-center"
                      >
                        <span className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e9dcfb] bg-white text-[#5f537d]">
                          <AllergenIcon allergenName={allergen.name} className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-semibold capitalize text-[#7d165f]">{allergen.name}</h3>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 rounded-xl bg-[#f7f3ff] p-4 text-sm text-[#5f537d]">
                      Nessun allergene disponibile in questo menù.
                    </p>
                  )}
                </div>
              )}

              {mobileSheet === "search" && (
                <div className="space-y-3 pb-2">
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Scrivi il nome del piatto"
                    className="h-12 rounded-xl border-[#e3d9f1] bg-white text-base"
                  />

                  <div className="space-y-2">
                    {!normalizedSearchQuery ? (
                      <p className="rounded-xl bg-[#f7f3ff] p-4 text-sm text-[#5f537d]">
                        Inizia a digitare per cercare un piatto.
                      </p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((recipe) => (
                        <button
                          key={recipe.recipeId}
                          onClick={() => {
                            setMobileSheet(null);
                            handleRecipeClick(recipe.recipeId);
                          }}
                          className="flex w-full items-center justify-between rounded-xl border border-[#ece4f6] px-4 py-3 text-left"
                        >
                          <span>
                            <span className="block font-medium text-[#1b0736]">{recipe.name}</span>
                            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wide text-[#6a5c86]">
                              {recipeCategoryMap.get(recipe.recipeId) || "Categoria non disponibile"}
                            </span>
                          </span>
                          <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                        </button>
                      ))
                    ) : (
                      <p className="rounded-xl bg-[#f7f3ff] p-4 text-sm text-[#5f537d]">
                        Nessun piatto trovato con questo nome.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {mobileSheet === "contacts" && (
                <div className="space-y-2 pb-2">
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-between rounded-xl border border-[#ece4f6] px-4 py-3"
                    >
                      <span className="flex items-center gap-3 text-[#1b0736]">
                        <Phone className="h-5 w-5" />
                        {contactPhone}
                      </span>
                      <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                    </a>
                  )}
                  {(contactMapsUrl || contactAddress) && (
                    <button
                      onClick={() =>
                        openExternal(
                          contactMapsUrl ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactAddress)}`,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-[#ece4f6] px-4 py-3 text-left"
                    >
                      <span className="flex items-start gap-3 text-[#1b0736]">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>
                          <span className="block font-semibold">Visualizza su Google Maps</span>
                          {contactAddress && <span className="block text-sm text-[#6a5c86]">{contactAddress}</span>}
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                    </button>
                  )}
                  {!contactPhone && !contactMapsUrl && !contactAddress && (
                    <p className="rounded-xl bg-[#f7f3ff] p-4 text-sm text-[#5f537d]">
                      Nessun contatto configurato. Puoi impostarli con `VITE_CONTACT_PHONE`,
                      `VITE_CONTACT_ADDRESS` e `VITE_CONTACT_MAPS_URL`.
                    </p>
                  )}
                </div>
              )}

              {mobileSheet === "share" && (
                <div className="space-y-2 pb-2">
                  <button
                    onClick={handleNativeShare}
                    className="flex w-full items-center justify-between rounded-xl border border-[#ece4f6] px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-3 text-[#1b0736]">
                      <Share2 className="h-5 w-5" />
                      Condividi ora
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                  </button>
                  <button
                    onClick={() =>
                      openExternal(
                        whatsappNumber
                          ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                              `Guarda questo menu: ${currentUrl}`,
                            )}`
                          : `https://wa.me/?text=${encodeURIComponent(`Guarda questo menu: ${currentUrl}`)}`,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-[#ece4f6] px-4 py-3 text-left text-[#1b0736]"
                  >
                    <span className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                  </button>
                  <a
                    href={`mailto:${emailAddress}?subject=${encodeURIComponent(
                      `Menu ${effectiveMenu.name}`,
                    )}&body=${encodeURIComponent(`Guarda questo menu: ${currentUrl}`)}`}
                    className="flex items-center justify-between rounded-xl border border-[#ece4f6] px-4 py-3 text-[#1b0736]"
                  >
                    <span className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      Email
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#6a5c86]" />
                  </a>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e8e0f4] bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
              <button
                onClick={() => {
                  if (!venueCode) return;
                  navigate(`/${venueCode}/${isDemoRoute ? `menu_demo${activeDemoTemplate}` : "menu"}`);
                }}
                className="flex min-w-0 flex-col items-center gap-1 px-1 text-[#2a0a4a]"
              >
                <MenuIcon className="h-6 w-6" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Menu</span>
              </button>
              <button
                onClick={() => setMobileSheet("categories")}
                className="flex min-w-0 flex-col items-center gap-1 px-1 text-[#2a0a4a]"
              >
                <List className="h-6 w-6" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Categoria</span>
              </button>
              <button
                onClick={() => {
                  setMobileSheet("search");
                }}
                className="flex min-w-0 flex-col items-center gap-1 px-1 text-[#2a0a4a]"
              >
                <Search className="h-6 w-6" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Cerca</span>
              </button>
              <button
                onClick={() => setMobileSheet("allergens")}
                className="flex min-w-0 flex-col items-center gap-1 px-1 text-[#2a0a4a]"
              >
                <ShieldAlert className="h-6 w-6" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Allergeni</span>
              </button>
              <button
                onClick={() => setMobileSheet("share")}
                className="flex min-w-0 flex-col items-center gap-1 px-1 text-[#2a0a4a]"
              >
                <Share2 className="h-6 w-6" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Condividi</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
