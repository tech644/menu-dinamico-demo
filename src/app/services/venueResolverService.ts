import { menuData } from "../data/menuData";

// ===============================
// TYPES
// ===============================
export interface VenueContext {
  businessId: string;
  localId: string;
  venueCode: string;
  timeZone?: string;
}

// ===============================
// CONFIG
// ===============================
const SECRET = "gizmo";

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log("[venueResolver]", ...args);
  }
};

// ===============================
// NORMALIZE
// ===============================
function normalizeVenueCode(value: string): string {
  return value.trim();
}

// ===============================
// 🔐 NEW SYSTEM (BASE64 ENCODED)
// ===============================
function decodeVenueCode(code: string): {
  businessId: string;
  localId: string;
} | null {
  try {
    // supporta base64 url-safe (Flutter web friendly)
    const normalized = code.replace(/-/g, "+").replace(/_/g, "/");

    // fix padding
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

    const decoded = atob(padded);

    const parts = decoded.split("|");

    // supporta sia 2 che 3 parti (mock + prod)
    const businessId = parts[0];
    const localId = parts[1];
    const secret = parts[2];

    if (!businessId || !localId) {
      return null;
    }

    // 🔐 se c'è secret → validalo
    if (secret !== undefined && secret !== SECRET) {
      debug("invalid secret");
      return null;
    }

    return { businessId, localId };
  } catch (e) {
    debug("decode error", e);
    return null;
  }
}

// ===============================
// 🆕 BUILD VENUE CODE (NEW SYSTEM)
// ===============================
export function buildVenueCode(
  businessId: string,
  localId: string
): string {
  const raw = `${businessId}|${localId}|${SECRET}`;

  // base64 url-safe
  return btoa(raw)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ===============================
// 🔙 LEGACY SUPPORT (HASH)
// ===============================
const VENUE_CODE_REGEX = /^[A-Z0-9]{6}-[A-Z0-9]{6}$/;

function shortHash6(value: string, salt: string): string {
  const input = `${salt}:${value}`;
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0)
    .toString(36)
    .toUpperCase()
    .padStart(6, "0")
    .slice(-6);
}

function buildVenueCodeLegacy(
  businessId: string,
  localId: string
): string {
  return `${shortHash6(businessId, "BIZ")}-${shortHash6(localId, "LOC")}`;
}

function deriveBusinessId(localId: string, fallback?: string): string {
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  const match = localId.match(/(\d+)/);
  return match?.[1] || "";
}

// ===============================
// MOCK (DEV ONLY)
// ===============================
const MOCK_BUSINESS_ID = "default-business";
const MOCK_LOCAL_ID = menuData.menu.localId;

const mockVenueCode = buildVenueCodeLegacy(
  MOCK_BUSINESS_ID,
  MOCK_LOCAL_ID
);

// ===============================
// 🚀 MAIN RESOLVER
// ===============================
export async function resolveVenueCode(
  rawVenueCode: string
): Promise<VenueContext | null> {
  const venueCode = normalizeVenueCode(rawVenueCode);

  debug("resolve start", {
    rawVenueCode,
    normalized: venueCode,
  });

  // ===============================
  // 1️⃣ NEW SYSTEM (FAST PATH - base64)
  // ===============================
  const decoded = decodeVenueCode(venueCode);

  if (decoded) {
    debug("✅ decoded (new system)", decoded);

    return {
      businessId: decoded.businessId,
      localId: decoded.localId,
      venueCode,
    };
  }

  // ===============================
  // 2️⃣ 🔥 MOCK FALLBACK (CRITICO per dev)
  // ===============================
  try {
    const decodedRaw = atob(venueCode);
    const [businessId, localId] = decodedRaw.split("|");

    if (businessId && localId) {
      debug("✅ decoded (mock fallback)", {
        businessId,
        localId,
      });

      return {
        businessId,
        localId,
        venueCode,
      };
    }
  } catch (e) {
    debug("mock decode failed", e);
  }

  // ===============================
  // 3️⃣ LEGACY SUPPORT (vecchio hash)
  // ===============================
  if (VENUE_CODE_REGEX.test(venueCode)) {
    debug("legacy code detected");

    if (venueCode === mockVenueCode) {
      debug("mock legacy resolved");

      return {
        businessId: MOCK_BUSINESS_ID,
        localId: MOCK_LOCAL_ID,
        venueCode,
      };
    }

    debug("legacy code not resolvable without DB");
  }

  // ===============================
  // ❌ FAIL
  // ===============================
  debug("resolve failed");

  return null;
}