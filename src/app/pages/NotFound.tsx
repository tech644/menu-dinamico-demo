import { Link } from "react-router";

interface NotFoundProps {
  message?: string;
}

export default function NotFound({ message }: NotFoundProps) {
  return (
    <div className="ord-page-bg flex min-h-screen items-center justify-center px-4">
      <div className="ord-detail-card w-full max-w-xl border border-[#e5dbf4] bg-white p-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-[#ff1dbb]">404</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1b0736]">Pagina non trovata</h1>
        <p className="mt-3 text-[#5f537d]">
          {message || "Il contenuto richiesto non esiste o non è più disponibile."}
        </p>
        <Link
          to="/"
          className="ord-cta mt-6 inline-flex items-center px-5 py-2 text-sm font-semibold"
        >
          Torna all'inizio
        </Link>
      </div>
    </div>
  );
}
