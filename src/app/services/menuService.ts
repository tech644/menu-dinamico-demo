import { menuData } from '../data/menuData';
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { VenueContext } from "./venueResolverService";

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
  type: string;
  sections: MenuSection[];
  price: number | null;
  eventDate: string | null;
  createdBy: string;
  createdAt: string;
}

export async function getAllMenus(): Promise<Menu[]> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [menuData.menu as Menu];
  }

  try {
    const db = getFirestoreDb();
    const menusRef = collection(db, "menus");
    const snapshot = await getDocs(menusRef);

    return snapshot.docs.map((menuDoc) => {
      const data = menuDoc.data() as Partial<Menu>;
      return {
        ...data,
        menuId: data.menuId || menuDoc.id,
      } as Menu;
    });
  } catch (error) {
    console.error("Error loading menus from Firestore, using mock data:", error);
    return [menuData.menu as Menu];
  }
}

export async function getMenusByVenue(venue: VenueContext): Promise<Menu[]> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (menuData.menu.localId === venue.localId) {
      return [menuData.menu as Menu];
    }
    return [];
  }

  try {
    const db = getFirestoreDb();
    const menusRef = collection(db, "menus");
    const byLocalQuery = query(menusRef, where("localId", "==", venue.localId));
    const snapshot = await getDocs(byLocalQuery);

    return snapshot.docs
      .map((menuDoc) => {
        const data = menuDoc.data() as Partial<Menu>;
        return {
          ...data,
          menuId: data.menuId || menuDoc.id,
        } as Menu;
      })
      .filter((menu) => !menu.businessId || menu.businessId === venue.businessId);
  } catch (error) {
    console.error("Error loading venue menus from Firestore, using mock data:", error);
    if (menuData.menu.localId === venue.localId) {
      return [menuData.menu as Menu];
    }
    return [];
  }
}

export async function getMenuById(menuId: string): Promise<Menu | null> {
  if (!isFirebaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return menuData.menu.menuId === menuId ? (menuData.menu as Menu) : null;
  }

  try {
    const db = getFirestoreDb();
    const menuRef = doc(db, "menus", menuId);
    const menuSnapshot = await getDoc(menuRef);

    if (menuSnapshot.exists()) {
      const data = menuSnapshot.data() as Partial<Menu>;
      return { ...data, menuId: data.menuId || menuSnapshot.id } as Menu;
    }

    const menusRef = collection(db, "menus");
    const q = query(menusRef, where("menuId", "==", menuId), limit(1));
    const fallbackSnapshot = await getDocs(q);

    if (!fallbackSnapshot.empty) {
      const foundDoc = fallbackSnapshot.docs[0];
      const data = foundDoc.data() as Partial<Menu>;
      return { ...data, menuId: data.menuId || foundDoc.id } as Menu;
    }

    return null;
  } catch (error) {
    console.error("Error loading menu from Firestore, using mock data:", error);
    if (menuData.menu.menuId === menuId) {
      return menuData.menu as Menu;
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
