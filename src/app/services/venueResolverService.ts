import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { menuData } from "../data/menuData";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";

// Resolves route venue codes to business/local identifiers.
export interface VenueContext {
  businessId: string;
  localId: string;
  venueCode: string;
}

const VENUE_CODE_REGEX = /^[A-Z0-9]{6}-[A-Z0-9]{6}$/;
const MOCK_BUSINESS_ID = "default-business";
const MOCK_LOCAL_ID = menuData.menu.localId;
const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log("[venueResolver]", ...args);
  }
};

function normalizeVenueCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function shortHash6(value: string, salt: string): string {
  const input = `${salt}:${value}`;
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
}

export function buildVenueCode(businessId: string, localId: string): string {
  return `${shortHash6(businessId, "BIZ")}-${shortHash6(localId, "LOC")}`;
}

function deriveBusinessId(localId: string, fallback?: string): string {
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  const match = localId.match(/(\d+)/);
  return match?.[1] || "";
}

const mockVenueCode = buildVenueCode(MOCK_BUSINESS_ID, MOCK_LOCAL_ID);

export async function resolveVenueCode(rawVenueCode: string): Promise<VenueContext | null> {
  const venueCode = normalizeVenueCode(rawVenueCode);
  debug("resolve start", { rawVenueCode, normalized: venueCode, isFirebaseConfigured });

  if (!VENUE_CODE_REGEX.test(venueCode)) {
    debug("invalid venueCode format");
    return null;
  }

  if (isFirebaseConfigured) {
    try {
      const db = getFirestoreDb();

      // Preferred shape: route_keys/{VENUE_CODE} => { businessId, localId, active }
      const routeDoc = await getDoc(doc(db, "route_keys", venueCode));
      if (routeDoc.exists()) {
        debug("route_keys direct doc found", { id: venueCode, data: routeDoc.data() });
        const data = routeDoc.data() as {
          businessId?: string;
          localId?: string;
          active?: boolean;
        };

        if (data.active === false) {
          return null;
        }

        if (data.businessId && data.localId) {
          debug("route_keys direct resolved", { businessId: data.businessId, localId: data.localId });
          return { businessId: data.businessId, localId: data.localId, venueCode };
        }
      }
      debug("route_keys direct doc not found", { id: venueCode });

      // Fallback shape: route_keys documents with `code` field
      const routesRef = collection(db, "route_keys");
      const byCodeQuery = query(routesRef, where("code", "==", venueCode), limit(1));
      const snapshot = await getDocs(byCodeQuery);

      if (!snapshot.empty) {
        debug("route_keys by code found", { count: snapshot.size, data: snapshot.docs[0].data() });
        const data = snapshot.docs[0].data() as {
          businessId?: string;
          localId?: string;
          active?: boolean;
        };

        if (data.active === false) {
          return null;
        }

        if (data.businessId && data.localId) {
          debug("route_keys by code resolved", { businessId: data.businessId, localId: data.localId });
          return { businessId: data.businessId, localId: data.localId, venueCode };
        }
      }
      debug("route_keys by code not found", { code: venueCode });

      // Final fallback: infer from menus collection when route_keys is not populated yet.
      const menusRef = collection(db, "menus");
      const menusSnapshot = await getDocs(query(menusRef, limit(200)));
      debug("menus fallback scan", { count: menusSnapshot.size });

      for (const menuDoc of menusSnapshot.docs) {
        const data = menuDoc.data() as {
          businessId?: string;
          localId?: string;
          active?: boolean;
        };

        if (!data.localId) {
          continue;
        }

        const businessId = deriveBusinessId(data.localId, data.businessId);
        if (!businessId) {
          continue;
        }

        if (data.active === false) {
          continue;
        }

        const computed = buildVenueCode(businessId, data.localId);
        debug("menus fallback candidate", {
          menuDocId: menuDoc.id,
          businessId,
          localId: data.localId,
          computed,
          expected: venueCode,
        });
        if (computed === venueCode) {
          debug("menus fallback resolved", { businessId, localId: data.localId });
          return { businessId, localId: data.localId, venueCode };
        }
      }
      debug("menus fallback unresolved");
    } catch (error) {
      console.error("Error resolving venue code from Firestore:", error);
    }
  }

  if (venueCode === mockVenueCode) {
    debug("mock fallback resolved");
    return {
      businessId: MOCK_BUSINESS_ID,
      localId: MOCK_LOCAL_ID,
      venueCode,
    };
  }

  debug("resolve failed");
  return null;
}
