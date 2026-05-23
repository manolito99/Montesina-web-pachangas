import FlatLogo from "@/assets/logo-montesina-flat.svg";

export function SiteFooter() {
  return (
    <footer className="border-t border-dashed border-muted/70 bg-paper-alt px-6 py-10">
      <div className="container flex flex-col items-start justify-between gap-4 text-sm text-ink-2 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <FlatLogo className="h-5 w-5 text-ink-2" aria-hidden />
          <p>© {new Date().getFullYear()} Montesiña Padel · Club deportivo.</p>
        </div>
        <p className="font-hand text-muted">
          Hecho con cariño para los socios del club.
        </p>
      </div>
    </footer>
  );
}
