import { MenuTemplateId } from "../theme/menuTemplates";

// Type definitions for Menu structure
export interface MenuItem {
  itemId: string;
  type: string;
  refId: string;
}

export interface MenuSubSection {
  subSectionId: string;
  name: string;
  items: MenuItem[];
}

export interface MenuSection {
  sectionId: string;
  name: string;
  subSections: MenuSubSection[];
  items: MenuItem[];
}

export interface Menu {
  menuId: string;
  localId: string;
  name: string;
  isPublic: boolean;
  menuTemplateId: MenuTemplateId;
  publicLogoUrl?: string | null;
  hasSchedule: boolean;
  activeFromDateIso: string;
  activeToDateIso: string;
  activeFromTime24h: string;
  activeToTime24h: string;
  activeWeekdays: number[];
  type: string;
  sections: MenuSection[];
  price: number | null;
  eventDate: string | null;
  createdBy: string;
  createdAt: string;
}

export interface MenuData {
  menu: Menu;
}
