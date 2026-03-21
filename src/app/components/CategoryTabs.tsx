import { useRef, useEffect } from "react";

// Horizontal section selector with auto-centering on the active tab.
interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  leadingActionLabel?: string;
  onLeadingActionClick?: () => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  leadingActionLabel,
  onLeadingActionClick,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Keep the active tab centered in the horizontal viewport.
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const nextLeft =
        container.scrollLeft +
        (buttonRect.left - containerRect.left - containerRect.width / 2 + buttonRect.width / 2);

      // Avoid tiny re-centering motions that can look like jitter.
      if (Math.abs(nextLeft - container.scrollLeft) > 6) {
        container.scrollTo({ left: nextLeft, behavior: "smooth" });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-20 z-40 border-b border-[#e8e0f4] bg-white/95 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto py-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {leadingActionLabel && onLeadingActionClick && (
            <button
              onClick={onLeadingActionClick}
              className="rounded-full border border-[#d7caec] bg-white px-6 py-2 text-sm font-medium whitespace-nowrap text-[#4a3f63] transition-all hover:border-[#9f86d7]"
            >
              {leadingActionLabel}
            </button>
          )}

          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                ref={isActive ? activeButtonRef : null}
                onClick={() => onCategoryChange(category)}
                className={`
                  min-h-11 rounded-full border px-6 py-2 text-sm font-medium whitespace-nowrap
                  transition-[background-color,color,border-color,box-shadow] duration-200 ease-out
                  ${isActive 
                    ? 'ord-cta border-transparent text-white shadow-md' 
                    : 'border-[#d7caec] bg-white text-[#4a3f63] hover:border-[#9f86d7]'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
