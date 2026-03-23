import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { ScrollToTop } from "../components/ScrollToTop";
import { AppFooter } from "../components/AppFooter";
import { isMenuTemplateId, MenuTemplateId } from "../theme/menuTemplates";

// Shared shell used by all routes.
export default function Root() {
  const location = useLocation();

  useEffect(() => {
    const isDemoRoute = location.pathname.includes("/menu_demo");
    if (!isDemoRoute) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const queryTemplate = params.get("template");
    const storedTemplate =
      typeof window !== "undefined" ? localStorage.getItem("ord.menuTemplate") : null;

    const activeTemplate: MenuTemplateId = isMenuTemplateId(queryTemplate)
      ? queryTemplate
      : isMenuTemplateId(storedTemplate)
        ? storedTemplate
        : "amethyst";

    if (typeof window !== "undefined") {
      localStorage.setItem("ord.menuTemplate", activeTemplate);
    }

    document.documentElement.setAttribute("data-menu-template", activeTemplate);
    document.body.setAttribute("data-menu-template", activeTemplate);
  }, [location.pathname, location.search]);

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
