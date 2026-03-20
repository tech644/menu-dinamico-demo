import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="ord-page-bg flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#2a0a4a]" />
        <p className="text-[#5f537d]">Caricamento...</p>
      </div>
    </div>
  );
}
