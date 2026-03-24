import { menuData } from '../data/menuData';
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { VenueContext } from "./venueResolverService";
import { isMenuTemplateId, MenuTemplateId } from "../theme/menuTemplates";

// Menu data access with Firebase-first strategy and local fallback data.
export interface MenuItem {
  itemId: string;
  type: string;
  refId: string;
}

export interface MenuSection {
  sectionId: string;
  name: string;
  subSections: any[];
  items: MenuItem[];
}

export interface Menu {
  menuId: string;
  businessId?: string;
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

function normalizeMenu(rawData: Partial<Menu> | undefined, fallbackId: string): Menu {
  const data = rawData || {};
  const isPublic = data.isPublic === true;
  const menuTemplateId = isMenuTemplateId(data.menuTemplateId) ? data.menuTemplateId : "amethyst";
  const publicLogoUrl =
    typeof data.publicLogoUrl === "string" && data.publicLogoUrl.trim() ? data.publicLogoUrl : null;
  const hasSchedule = data.hasSchedule === true;
  const activeFromDateIso = typeof data.activeFromDateIso === "string" ? data.activeFromDateIso : "";
  const activeToDateIso = typeof data.activeToDateIso === "string" ? data.activeToDateIso : "";
  const activeFromTime24h = typeof data.activeFromTime24h === "string" ? data.activeFromTime24h : "";
  const activeToTime24h = typeof data.activeToTime24h === "string" ? data.activeToTime24h : "";
  const activeWeekdays = Array.isArray(data.activeWeekdays)
    ? data.activeWeekdays.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7)
    : [];

  return {
    menuId: data.menuId || fallbackId,
    businessId: data.businessId,
    localId: data.localId || "",
    name: data.name || "",
    isPublic,
    menuTemplateId,
    publicLogoUrl,
    hasSchedule,
    activeFromDateIso,
    activeToDateIso,
    activeFromTime24h,
    activeToTime24h,
    activeWeekdays,
    type: data.type || "",
    sections: Array.isArray(data.sections) ? data.sections : [],
    price: typeof data.price === "number" ? data.price : null,
    eventDate: data.eventDate ?? null,
    createdBy: data.createdBy || "",
    createdAt: data.createdAt || "",
  };
}

export async function getAllMenus(): Promise<Menu[]> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [normalizeMenu(menuData.menu as Partial<Menu>, (menuData.menu as Partial<Menu>)?.menuId || "fallback_menu")];
  }

  try {
    const db = getFirestoreDb();
    const menusRef = collection(db, "menus");
    const snapshot = await getDocs(menusRef);

    return snapshot.docs.map((menuDoc) => normalizeMenu(menuDoc.data() as Partial<Menu>, menuDoc.id));
  } catch (error) {
    console.error("Error loading menus from Firestore, using mock data:", error);
    return [normalizeMenu(menuData.menu as Partial<Menu>, (menuData.menu as Partial<Menu>)?.menuId || "fallback_menu")];
  }
}

export async function getMenusByVenue(venue: VenueContext): Promise<Menu[]> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const fallbackMenu = normalizeMenu(
      menuData.menu as Partial<Menu>,
      (menuData.menu as Partial<Menu>)?.menuId || "fallback_menu",
    );

    if (fallbackMenu.localId === venue.localId && fallbackMenu.isPublic) {
      return [fallbackMenu];
    }

    return [];
  }

  try {
    const db = getFirestoreDb();

    // 🚀 query DIRETTA (no business read)
    const menusRef = collection(db, "business", venue.businessId, "fbMenus");

    const q = query(
      menusRef,
      where("isPublic", "==", true),
      where("localId", "==", venue.localId) // 🔥 filtro diretto
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((menuDoc) =>
      normalizeMenu(menuDoc.data() as Partial<Menu>, menuDoc.id)
    );

  } catch (error) {
    console.error("Error loading venue menus:", error);
    return [];
  }
}

export async function getMenuById(menuId: string): Promise<Menu | null> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const fallbackMenu = normalizeMenu(
      menuData.menu as Partial<Menu>,
      (menuData.menu as Partial<Menu>)?.menuId || "fallback_menu",
    );
    return fallbackMenu.menuId === menuId ? fallbackMenu : null;
  }

  try {
    const db = getFirestoreDb();
    const menuRef = doc(db, "menus", menuId);
    const menuSnapshot = await getDoc(menuRef);

    if (menuSnapshot.exists()) {
      return normalizeMenu(menuSnapshot.data() as Partial<Menu>, menuSnapshot.id);
    }

    const menusRef = collection(db, "menus");
    const q = query(menusRef, where("menuId", "==", menuId), limit(1));
    const fallbackSnapshot = await getDocs(q);

    if (!fallbackSnapshot.empty) {
      const foundDoc = fallbackSnapshot.docs[0];
      return normalizeMenu(foundDoc.data() as Partial<Menu>, foundDoc.id);
    }

    return null;
  } catch (error) {
    console.error("Error loading menu from Firestore, using mock data:", error);
    const fallbackMenu = normalizeMenu(
      menuData.menu as Partial<Menu>,
      (menuData.menu as Partial<Menu>)?.menuId || "fallback_menu",
    );
    if (fallbackMenu.menuId === menuId) {
      return fallbackMenu;
    }
    return null;
  }
}

export async function getMenuByIdForVenue(menuId: string, venue: VenueContext): Promise<Menu | null> {
  const menus = await getMenusByVenue(venue);
  return menus.find((menu) => menu.menuId === menuId) || null;
}

export async function getMenuSections(menuId: string): Promise<MenuSection[]> {
  const menu = await getMenuById(menuId);
  return menu?.sections || [];
}
