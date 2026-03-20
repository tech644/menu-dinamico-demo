export function AppFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_20%_120%,rgba(42,235,201,0.22),transparent_38%),linear-gradient(135deg,#1B0736_0%,#2A0A4A_45%,#14042A_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
        <div className="flex items-center gap-3">
          <img
            src="https://ordinoo.com/img/logo/logo-white.svg"
            alt="Ordinoo"
            className="h-5 w-auto opacity-95"
          />
        </div>

        <div className="text-xs text-white/80 md:text-right">
          <p>v1.0.0</p>
          <p>© Ordinoo SRL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
