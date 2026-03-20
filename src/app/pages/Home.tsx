import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getMenusByVenue, Menu } from "../services/menuService";
import { Loader2 } from "lucide-react";
import { resolveVenueCode } from "../services/venueResolverService";
import NotFound from "./NotFound";
import { MenuChooser } from "../components/MenuChooser";

export default function Home() {
  const { venueCode } = useParams<{ venueCode: string }>();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMenus() {
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
        if (import.meta.env.DEV) {
          console.log("[Home] menus loaded", { count: data.length, menuIds: data.map((m) => m.menuId) });
        }
        setMenus(data);
        
        if (data.length === 0) {
          setNotFound(true);
          return;
        }

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
