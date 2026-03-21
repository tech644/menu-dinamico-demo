interface LocalDemoLogoProps {
  showName?: boolean;
  size?: "sm" | "md";
  theme?: "light" | "dark";
  className?: string;
}

const DEMO_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt0AcQRP76qLCQslBZCQqIbF9l2L6G0x_MhA&s";

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
  const iconSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const textColor = theme === "light" ? "text-white" : "text-[#1b0736]";
  const iconBg = theme === "light" ? "bg-white/90 ring-white/30" : "bg-white ring-[#e5daf5]";
  const secondaryColor = theme === "light" ? "text-white/70" : "text-[#6a5c86]";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span
        className={`inline-flex ${iconSize} items-center justify-center overflow-hidden rounded-full ${iconBg} ring-1`}
        aria-hidden="true"
      >
        <img
          src={DEMO_LOGO_URL}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
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
