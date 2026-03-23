import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getMenusByVenue, Menu } from "../services/menuService";
import { Loader2 } from "lucide-react";
import { resolveVenueCode } from "../services/venueResolverService";
import NotFound from "./NotFound";
import { MenuChooser } from "../components/MenuChooser";
import { isMenuAvailableNow } from "../utils/menuAvailability";

// Venue landing page: resolves venue code and shows available menus.
export default function Home() {
  const { venueCode } = useParams<{ venueCode: string }>();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [noAvailableMenus, setNoAvailableMenus] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMenus() {
      setLoading(true);
      setNotFound(false);
      setNoAvailableMenus(false);

      if (!venueCode) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const venue = await resolveVenueCode(venueCode);
        if (import.meta.env.DEV) {
          console.log("[Home] venue resolve result", { venueCode, venue });
        }
        if (!venue) {
          setNotFound(true);
          return;
        }

        const data = await getMenusByVenue(venue);
        const venueTimeZone = venue.timeZone || "Europe/Rome";
        const availableMenus = data.filter((menu) =>
          isMenuAvailableNow(menu, { timeZone: venueTimeZone }),
        );
        if (import.meta.env.DEV) {
          console.log("[Home] menus loaded", {
            count: data.length,
            availableCount: availableMenus.length,
            menuIds: availableMenus.map((m) => m.menuId),
            venueTimeZone,
          });
        }
        setMenus(availableMenus);
        setNoAvailableMenus(availableMenus.length === 0);

      } catch (error) {
        console.error("Error loading menus:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadMenus();
  }, [navigate, venueCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#2a0a4a]" />
      </div>
    );
  }

  if (notFound) {
    return <NotFound message="Percorso non valido o menu non disponibili per questo locale." />;
  }

  if (noAvailableMenus) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-3xl border border-[#e7ddf6] bg-white/85 p-8 text-center shadow-[0_12px_40px_rgba(42,10,74,0.08)]">
          <h1 className="text-2xl font-black tracking-tight text-[#1b0736] md:text-3xl">
            Nessun menu disponibile in questo momento
          </h1>
          <p className="mt-3 text-sm text-[#5f537d] md:text-base">
            Torna più tardi per visualizzare i menu attivi in base a calendario, giorni e orari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MenuChooser
      title="Scopri I Nostri Menu"
      subtitle="Scegli il percorso perfetto per il momento: pranzo, cena o degustazione."
      ctaLabel="Apri Menu"
      menus={menus}
      onOpenMenu={(menuId) => navigate(`/${venueCode}/menu/${menuId}`)}
    />
  );
}
