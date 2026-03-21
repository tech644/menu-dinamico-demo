import { menuData } from "../data/menuData";
import { buildVenueCode } from "../services/venueResolverService";
import { Link } from "react-router";

const demoVenueCode = buildVenueCode("default-business", menuData.menu.localId);
const demoMenuListPath = `/${demoVenueCode}/menu_demo`;

// Friendly entry point with a one-click path to the local demo restaurant menus.
export default function Landing() {
  return (
    <div className="ord-page-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-[#e5dbf4] bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[#1b0736]">Benvenuto</h1>
        <p className="mt-3 text-[#5f537d]">
          Per iniziare puoi entrare subito nella lista menu del ristorante demo.
        </p>
        <div className="mt-6">
          <Link
            to={demoMenuListPath}
            className="inline-flex items-center justify-center rounded-lg bg-[#2a0a4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f0738]"
          >
            Vai alla lista menu demo
          </Link>
        </div>
      </div>
    </div>
  );
}
