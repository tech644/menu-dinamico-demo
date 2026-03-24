import { UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { Menu } from "../services/menuService";
//import { LocalDemoLogo } from "./LocalDemoLogo";
import { isMenuTemplateId, MENU_TEMPLATES, MenuTemplateId } from "../theme/menuTemplates";

// Shared menu picker used by both production and demo listing pages.
interface MenuChooserProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  menus: Menu[];
  showTemplateSelector?: boolean;
  onOpenMenu: (menuId: string, templateId?: MenuTemplateId) => void;
}

export function MenuChooser({
  title,
  subtitle,
  ctaLabel,
  menus,
  showTemplateSelector = false,
  onOpenMenu,
}: MenuChooserProps) {
  const initialTemplate = useMemo<MenuTemplateId>(() => {
    if (typeof window === "undefined") {
      return "amethyst";
    }
    const storedTemplate = localStorage.getItem("ord.menuTemplate");
    return isMenuTemplateId(storedTemplate) ? storedTemplate : "amethyst";
  }, []);

  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplateId>(initialTemplate);

  const applyTemplate = (templateId: MenuTemplateId) => {
    setSelectedTemplate(templateId);
    if (typeof window !== "undefined") {
      localStorage.setItem("ord.menuTemplate", templateId);
    }
    document.documentElement.setAttribute("data-menu-template", templateId);
    document.body.setAttribute("data-menu-template", templateId);
  };

  const handleOpenMenu = (menuId: string) => {
    onOpenMenu(menuId, showTemplateSelector ? selectedTemplate : undefined);
  };

  return (
    <div className="relative overflow-hidden px-2 py-4 pb-16 md:px-8 md:py-6 md:pb-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#2aebc9]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#ff1dbb]/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-6 text-center md:mb-10">
          {/* <div className="inline-flex rounded-full border border-[#d9ccee] bg-white/70 px-3 py-1.5">
            <LocalDemoLogo size="sm" />
          </div> */}
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1b0736] md:mt-4 md:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-base text-[#5f537d] md:mt-3 md:text-lg">{subtitle}</p>
        </div>

        {showTemplateSelector && (
          <div className="mb-6 rounded-3xl border border-white/60 bg-white/70 p-3 backdrop-blur-sm md:mb-8 md:p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#5f537d] md:mb-4">
              Scegli il tuo stile
            </p>
            <div className="grid gap-2 md:grid-cols-3 md:gap-3">
              {MENU_TEMPLATES.map((template) => {
                const isActive = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className={`ord-template-tile border px-3 py-2 text-left transition-all ${
                      isActive
                        ? "border-[#2a0a4a] bg-[#f4efff] shadow-[0_8px_24px_rgba(42,10,74,0.16)]"
                        : "border-[#e7ddf6] bg-white hover:border-[#d5c5ef]"
                    }`}
                  >
                    <span className="block text-sm font-bold text-[#1b0736]">{template.name}</span>
                    <span className="block text-xs text-[#6a5c86]">{template.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {menus.map((menu) => {
            const totalItems = menu.sections.reduce((count, section) => count + section.items.length, 0);
            return (
              <article
                key={menu.menuId}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenMenu(menu.menuId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenMenu(menu.menuId);
                  }
                }}
                className="ord-menu-card group w-full border bg-white/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 md:p-7"
              >
                <div className="mb-4 flex items-start justify-between gap-3 md:mb-5">
                  <h2 className="text-2xl font-black leading-tight text-[#1b0736] md:text-3xl">{menu.name}</h2>
                  {menu.publicLogoUrl ? (
                    <div className="h-11 w-11 overflow-hidden rounded-2xl ring-1 ring-[#e5daf5]">
                      <img
                        src={menu.publicLogoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#2a0a4a] p-3 text-white">
                      <UtensilsCrossed className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#4f436b] md:mb-6">
                  <span className="rounded-full border border-[#d9ccee] bg-[#f6f2ff] px-3 py-1">
                    {menu.sections.length} sezioni
                  </span>
                  <span className="rounded-full border border-[#9cf3e3] bg-[#ecfffa] px-3 py-1 text-[#0f8f79]">
                    {totalItems} piatti
                  </span>
                </div>

                <span className="ord-cta inline-flex items-center px-6 py-2.5 text-sm font-semibold group-hover:pr-8 md:py-3">
                  {ctaLabel}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
