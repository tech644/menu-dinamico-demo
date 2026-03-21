export type MenuTemplateId = "amethyst" | "ocean" | "ember";

export interface MenuTemplateOption {
  id: MenuTemplateId;
  name: string;
  description: string;
}

export const MENU_TEMPLATES: MenuTemplateOption[] = [
  {
    id: "amethyst",
    name: "Stile 1",
    description: "Amethyst · elegante e raffinato",
  },
  {
    id: "ocean",
    name: "Stile 2",
    description: "Ocean · fresh e contemporaneo",
  },
  {
    id: "ember",
    name: "Stile 3",
    description: "Ember · caldo e deciso",
  },
];

export function isMenuTemplateId(value: string | null | undefined): value is MenuTemplateId {
  return value === "amethyst" || value === "ocean" || value === "ember";
}
