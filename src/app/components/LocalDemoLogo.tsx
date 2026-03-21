interface LocalDemoLogoProps {
  showName?: boolean;
  size?: "sm" | "md";
  theme?: "light" | "dark";
  className?: string;
}

function getLocalDemoName() {
  return import.meta.env.VITE_DEMO_LOCAL_NAME?.trim() || "Ristorante Belvedere";
}

export function LocalDemoLogo({
  showName = true,
  size = "md",
  theme = "dark",
  className = "",
}: LocalDemoLogoProps) {
  const localName = getLocalDemoName();
  const iconSize = size === "sm" ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const textColor = theme === "light" ? "text-white" : "text-[#1b0736]";
  const iconBg = theme === "light" ? "bg-white/12 ring-white/30" : "bg-[#1b0736] ring-[#e5daf5]";
  const iconFg = theme === "light" ? "text-white" : "text-white";
  const secondaryColor = theme === "light" ? "text-white/70" : "text-[#6a5c86]";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span
        className={`inline-flex ${iconSize} items-center justify-center rounded-full ${iconBg} ${iconFg} ring-1`}
        aria-hidden="true"
      >
        ND
      </span>
      {showName && (
        <span className={`inline-flex flex-col leading-tight ${textColor}`}>
          <span className={`${textSize} font-extrabold tracking-tight`}>{localName}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${secondaryColor}`}>
            Demo Locale
          </span>
        </span>
      )}
    </span>
  );
}
