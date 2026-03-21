interface AllergenIconProps {
  allergenName: string;
  className?: string;
}

type AllergenIconKey =
  | "gluten"
  | "milk"
  | "egg"
  | "fish"
  | "shellfish"
  | "nuts"
  | "seed"
  | "soy"
  | "celery"
  | "mustard"
  | "sulfites"
  | "default";

function resolveAllergenKey(allergenName: string): AllergenIconKey {
  const normalized = allergenName.toLowerCase().trim();

  if (normalized.includes("glutine")) return "gluten";
  if (normalized.includes("lattici") || normalized.includes("latte")) return "milk";
  if (normalized.includes("uova") || normalized.includes("uovo")) return "egg";
  if (normalized.includes("pesce")) return "fish";
  if (normalized.includes("crostacei") || normalized.includes("molluschi")) return "shellfish";
  if (normalized.includes("arachidi") || normalized.includes("frutta a guscio") || normalized.includes("noci")) return "nuts";
  if (normalized.includes("sesamo")) return "seed";
  if (normalized.includes("soia") || normalized.includes("lupini")) return "soy";
  if (normalized.includes("sedano")) return "celery";
  if (normalized.includes("senape")) return "mustard";
  if (normalized.includes("solfiti") || normalized.includes("anidride solforosa")) return "sulfites";

  return "default";
}

export function AllergenIcon({ allergenName, className = "h-4 w-4" }: AllergenIconProps) {
  const key = resolveAllergenKey(allergenName);
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (key) {
    case "gluten":
      return (
        <svg {...commonProps}>
          <path d="M12 4v16" />
          <path d="M12 8c-2 0-3-1-3-2" />
          <path d="M12 8c2 0 3-1 3-2" />
          <path d="M12 12c-2 0-3-1-3-2" />
          <path d="M12 12c2 0 3-1 3-2" />
          <path d="M12 16c-2 0-3-1-3-2" />
          <path d="M12 16c2 0 3-1 3-2" />
        </svg>
      );
    case "milk":
      return (
        <svg {...commonProps}>
          <path d="M9 4h6" />
          <path d="M10 4v4l-2 3v7h8v-7l-2-3V4" />
          <path d="M9 18h6" />
        </svg>
      );
    case "egg":
      return (
        <svg {...commonProps}>
          <path d="M12 4c-3.3 0-5.5 4-5.5 7.2 0 3 2.4 6.8 5.5 6.8s5.5-3.8 5.5-6.8C17.5 8 15.3 4 12 4z" />
        </svg>
      );
    case "fish":
      return (
        <svg {...commonProps}>
          <path d="M5 12c3.5-4 8.5-4 12 0-3.5 4-8.5 4-12 0z" />
          <path d="M17 12l3-2v4z" />
          <path d="M9 12h0.01" />
        </svg>
      );
    case "shellfish":
      return (
        <svg {...commonProps}>
          <path d="M12 6v6" />
          <path d="M8 8l4 4 4-4" />
          <path d="M6.5 12.5c1.5 3.5 3.3 5.5 5.5 5.5s4-2 5.5-5.5" />
          <path d="M9 18v-2" />
          <path d="M12 18v-2" />
          <path d="M15 18v-2" />
        </svg>
      );
    case "nuts":
      return (
        <svg {...commonProps}>
          <path d="M12 5c-3.2 0-5 2.5-5 5.8 0 3.7 2 7.2 5 7.2s5-3.5 5-7.2C17 7.5 15.2 5 12 5z" />
          <path d="M12 5c0-1.2.8-2 2-2" />
        </svg>
      );
    case "seed":
      return (
        <svg {...commonProps}>
          <path d="M12 6c-2.5 2-4 4.2-4 6.4A4 4 0 0 0 12 16a4 4 0 0 0 4-3.6C16 10.2 14.5 8 12 6z" />
          <path d="M12 16v3" />
        </svg>
      );
    case "soy":
      return (
        <svg {...commonProps}>
          <path d="M9 7c-1.6 1.2-2.5 2.8-2.5 4.6A3.5 3.5 0 0 0 10 15c1.8 0 3.3-1.4 3.5-3.2" />
          <path d="M15 9c1.6 1.2 2.5 2.8 2.5 4.6A3.5 3.5 0 0 1 14 17c-1.8 0-3.3-1.4-3.5-3.2" />
        </svg>
      );
    case "celery":
      return (
        <svg {...commonProps}>
          <path d="M12 19V8" />
          <path d="M12 10c-2 0-3.5-1.5-3.5-3.5" />
          <path d="M12 12c2 0 3.5-1.5 3.5-3.5" />
          <path d="M12 14c-2 0-3.5 1.5-3.5 3.5" />
        </svg>
      );
    case "mustard":
      return (
        <svg {...commonProps}>
          <path d="M12 5c3 2.4 4.5 4.6 4.5 6.7A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.3C7.5 9.6 9 7.4 12 5z" />
          <path d="M12 16v3" />
        </svg>
      );
    case "sulfites":
      return (
        <svg {...commonProps}>
          <path d="M9 5h6" />
          <path d="M10 5v4a4 4 0 0 0 1 2.7L12 13l1-1.3A4 4 0 0 0 14 9V5" />
          <path d="M8 18h8" />
          <path d="M12 13v5" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </svg>
      );
  }
}
