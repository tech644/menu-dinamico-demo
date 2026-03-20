import { menuData } from "../data/menuData";
import { buildVenueCode } from "../services/venueResolverService";

const demoVenueCode = buildVenueCode("default-business", menuData.menu.localId);

// Entry page that documents the expected route format for local testing.
export default function Landing() {
  return (
    <div className="ord-page-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#e5dbf4] bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[#1b0736]">Route Entry</h1>
        <p className="mt-3 text-[#5f537d]">
          Usa il formato URL `/:venueCode/menu` oppure `/:venueCode/menu/:menuId`.
        </p>
        <p className="mt-4 text-sm text-[#746797]">
          Demo locale: <code className="font-mono">{demoVenueCode}</code>
        </p>
      </div>
    </div>
  );
}
