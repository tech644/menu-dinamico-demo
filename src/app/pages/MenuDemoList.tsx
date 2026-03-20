import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { Menu } from "../services/menuService";
import { getDemoMenus } from "../services/mockDemoService";
import NotFound from "./NotFound";
import { MenuChooser } from "../components/MenuChooser";

// Demo-only menu list used for showcase and test routes.
export default function MenuDemoList() {
  const { venueCode } = useParams<{ venueCode: string }>();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDemoMenus() {
      if (!venueCode) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getDemoMenus();
        setMenus(data);
      } catch (error) {
        console.error("Error loading demo menus:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadDemoMenus();
  }, [venueCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#2a0a4a]" />
      </div>
    );
  }

  if (notFound) {
    return <NotFound message="Percorso demo non disponibile." />;
  }

  return (
    <MenuChooser
      title="Menu Demo"
      subtitle="Versione  per test e presentazioni"
      ctaLabel="Entra Nel Menu Demo"
      menus={menus}
      onOpenMenu={(menuId) => navigate(`/${venueCode}/menu_demo/${menuId}`)}
    />
  );
}
