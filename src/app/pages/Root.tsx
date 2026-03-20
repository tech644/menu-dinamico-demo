import { Outlet } from "react-router";
import { ScrollToTop } from "../components/ScrollToTop";
import { AppFooter } from "../components/AppFooter";

export default function Root() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <main className="ord-page-bg">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
