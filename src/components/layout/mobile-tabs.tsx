import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Inicio", icon: "⌂", href: "/" },
  { label: "Pachangas", icon: "⚉", href: "/pachangas" },
  // { label: "Pistas", icon: "▦", href: "/reservas" }, // oculto: reservas se gestionan fuera de la app
  { label: "Yo", icon: "◉", href: "/perfil" },
] as const;

type TabLabel = (typeof TABS)[number]["label"];

interface MobileTabsProps {
  active?: TabLabel;
}

export function MobileTabs({ active = "Inicio" }: MobileTabsProps) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t-[1.5px] border-ink bg-paper px-2 pb-4 pt-2 md:hidden"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.label;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "flex min-w-12 flex-col items-center gap-0.5 text-[10px] font-medium",
              isActive ? "text-ink" : "text-muted",
            )}
          >
            <span aria-hidden className="text-base leading-none">
              {tab.icon}
            </span>
            <span className={cn(isActive && "font-bold")}>{tab.label}</span>
            {isActive && (
              <span aria-hidden className="mt-0.5 h-[2px] w-3.5 rounded bg-lime" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
