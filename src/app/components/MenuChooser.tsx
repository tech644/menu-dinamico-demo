import { Sparkles, UtensilsCrossed } from "lucide-react";
import { Menu } from "../services/menuService";

interface MenuChooserProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  menus: Menu[];
  onOpenMenu: (menuId: string) => void;
}

export function MenuChooser({ title, subtitle, ctaLabel, menus, onOpenMenu }: MenuChooserProps) {
  return (
    <div className="relative overflow-hidden px-2 py-4 pb-16 md:px-8 md:py-6 md:pb-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#2aebc9]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#ff1dbb]/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-6 text-center md:mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d9ccee] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4a3f63]">
            <Sparkles className="h-3.5 w-3.5 text-[#ff1dbb]" />
            Ordinoo
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1b0736] md:mt-4 md:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-base text-[#5f537d] md:mt-3 md:text-lg">{subtitle}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {menus.map((menu) => {
            const totalItems = menu.sections.reduce((count, section) => count + section.items.length, 0);
            return (
              <article
                key={menu.menuId}
                className="group w-full rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_14px_40px_rgba(42,10,74,0.12)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(42,10,74,0.2)] md:p-7"
              >
                <div className="mb-4 flex items-start justify-between gap-3 md:mb-5">
                  <h2 className="text-2xl font-black leading-tight text-[#1b0736] md:text-3xl">{menu.name}</h2>
                  <div className="rounded-2xl bg-[#2a0a4a] p-3 text-white">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                </div>

                <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-[#4f436b] md:mb-6">
                  <span className="rounded-full border border-[#d9ccee] bg-[#f6f2ff] px-3 py-1">
                    {menu.sections.length} sezioni
                  </span>
                  <span className="rounded-full border border-[#9cf3e3] bg-[#ecfffa] px-3 py-1 text-[#0f8f79]">
                    {totalItems} piatti
                  </span>
                </div>

                <button
                  onClick={() => onOpenMenu(menu.menuId)}
                  className="ord-cta inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold group-hover:pr-8 md:py-3"
                >
                  {ctaLabel}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
