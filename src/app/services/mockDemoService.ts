import menuJson from "../data/mocks/menu.json";
import recipesJson from "../data/mocks/ricette.json";
import { Menu } from "./menuService";
import { Ingredient, Recipe } from "./recipeService";

// Demo-only service used by /menu_demo routes.
const baseMenu = menuJson.menu as Menu;

const demoMenus: Menu[] = [
  buildDemoMenu({
    menuId: "menu_demo_alla_carta",
    name: "Menu alla Carta",
    type: "aLaCarte",
    sectionConfigs: [
      {
        sourceSectionName: "Antipasti",
        sectionId: "section_demo_carta_antipasti",
        refIds: ["recipe_9265f568", "recipe_2d25f5fd", "recipe_758b8854", "recipe_20969d42", "recipe_0152e9c4"],
      },
      {
        sourceSectionName: "Le Nostre Paste",
        sectionId: "section_demo_carta_paste",
        refIds: ["recipe_ad3feff5", "recipe_0639e8e1", "recipe_2318210f", "recipe_aa6431fb"],
      },
      {
        sourceSectionName: "Secondi",
        sectionId: "section_demo_carta_secondi",
        refIds: ["recipe_24c7743b", "recipe_2b8a007f", "recipe_e0daa9aa", "recipe_1697e17f"],
      },
      {
        sourceSectionName: "Le Pizze",
        sectionId: "section_demo_carta_pizze",
        refIds: [
          "recipe_8d6721ae",
          "recipe_5eecb7c3",
          "recipe_41d95624",
          "recipe_96e8ba8c",
          "recipe_0fc19679",
          "recipe_7c303927",
        ],
      },
      {
        sourceSectionName: "I dessert",
        sectionId: "section_demo_carta_dessert",
        refIds: ["recipe_8f7e4e48", "recipe_8003ad55", "recipe_04dfa49b"],
      },
    ],
  }),
  buildDemoMenu({
    menuId: "menu_demo_pranzo",
    name: "Menu Pranzo Veloce",
    type: "daily",
    sectionConfigs: [
      {
        sourceSectionName: "Antipasti",
        sectionId: "section_demo_pranzo_antipasti",
        refIds: ["recipe_a9426b8f", "recipe_fca994d5", "recipe_8a48a54e"],
      },
      {
        sourceSectionName: "Le Nostre Paste",
        sectionId: "section_demo_pranzo_paste",
        refIds: ["recipe_09093be2", "recipe_ad318b18", "recipe_39a3a576"],
      },
      {
        sourceSectionName: "Le Pizze",
        sectionId: "section_demo_pranzo_pizze",
        refIds: ["recipe_bde98f9c", "recipe_19ddc198", "recipe_78cf97c3", "recipe_987bc251"],
      },
      {
        sourceSectionName: "I dessert",
        sectionId: "section_demo_pranzo_dessert",
        refIds: ["recipe_fe384411", "recipe_7ba1de20"],
      },
    ],
  }),
  buildDemoMenu({
    menuId: "menu_demo_serata",
    name: "Menu Serata Pizza & Grill",
    type: "dinner",
    sectionConfigs: [
      {
        sourceSectionName: "Secondi",
        sectionId: "section_demo_serata_secondi",
        refIds: ["recipe_df0a1f71", "recipe_a2beaf1a", "recipe_113b7e62", "recipe_d399f940", "recipe_24c7743b"],
      },
      {
        sourceSectionName: "Le Pizze",
        sectionId: "section_demo_serata_pizze",
        refIds: [
          "recipe_565bd614",
          "recipe_02bd026d",
          "recipe_4d3c2951",
          "recipe_858adf59",
          "recipe_7c00b622",
          "recipe_96dcd3c9",
          "recipe_5eecb7c3",
        ],
      },
      {
        sourceSectionName: "Antipasti",
        sectionId: "section_demo_serata_antipasti",
        refIds: ["recipe_2d25f5fd", "recipe_758b8854"],
      },
      {
        sourceSectionName: "I dessert",
        sectionId: "section_demo_serata_dessert",
        refIds: ["recipe_8003ad55", "recipe_8f7e4e48", "recipe_fe384411"],
      },
    ],
  }),
];

export async function getDemoMenus(): Promise<Menu[]> {
  return demoMenus;
}

export async function getDemoMenuById(menuId: string): Promise<Menu | null> {
  return demoMenus.find((menu) => menu.menuId === menuId) || null;
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

function buildDemoMenu({
  menuId,
  name,
  type,
  sectionConfigs,
}: {
  menuId: string;
  name: string;
  type: string;
  sectionConfigs: Array<{
    sourceSectionName: string;
    sectionId: string;
    refIds: string[];
  }>;
}): Menu {
  const sections = sectionConfigs.map(({ sourceSectionName, sectionId, refIds }) =>
    createSectionFromRefs(sourceSectionName, sectionId, refIds),
  );

  return {
    ...baseMenu,
    menuId,
    name,
    type,
    isPublic: true,
    menuTemplateId: "amethyst",
    publicLogoUrl: null,
    hasSchedule: false,
    activeFromDateIso: "",
    activeToDateIso: "",
    activeFromTime24h: "",
    activeToTime24h: "",
    activeWeekdays: [],
    sections,
  };
}

function createSectionFromRefs(sourceSectionName: string, sectionId: string, refIds: string[]) {
  const sourceSection = baseMenu.sections.find((section) => section.name === sourceSectionName);
  if (!sourceSection) {
    throw new Error(`Missing source section "${sourceSectionName}" in demo menu mock`);
  }

  const itemsByRef = new Map(sourceSection.items.map((item) => [item.refId, item]));
  const items = refIds.map((refId, index) => {
    const sourceItem = itemsByRef.get(refId);
    if (!sourceItem) {
      throw new Error(`Missing recipe "${refId}" in source section "${sourceSectionName}"`);
    }

    return {
      ...sourceItem,
      itemId: `${sectionId}_item_${index + 1}`,
    };
  });

  return {
    ...sourceSection,
    sectionId,
    items,
  };
}
