import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { ReactNode } from "react";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export function Header({ showBack = false, title, leftContent, rightContent }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e0f4] bg-white/95 backdrop-blur-md">
      <div className="h-20 max-w-7xl mx-auto px-4 flex items-center">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 transition-colors hover:bg-[#f2ebff]"
              aria-label="Torna indietro"
            >
              <ChevronLeft className="h-6 w-6 text-[#2a0a4a]" />
            </button>
          )}
          {leftContent}
          {title && (
            <h1 className="truncate text-2xl font-black tracking-tight text-[#1b0736]">
              {title}
            </h1>
          )}
        </div>
        {rightContent && <div className="ml-3 shrink-0">{rightContent}</div>}
      </div>
    </header>
  );
}
