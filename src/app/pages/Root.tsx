import { Outlet } from "react-router";
import { ScrollToTop } from "../components/ScrollToTop";
import { AppFooter } from "../components/AppFooter";

// Shared shell used by all routes.
export default function Root() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <main className="ord-page-bg flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
