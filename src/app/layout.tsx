import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Kalam } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const kalam = Kalam({
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Montesiña Padel — Pachangas y reservas",
  description:
    "Organiza pachangas de pádel masculino, femenino y mixto. Reserva pistas en el club Montesiña Padel.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Montesiña Padel",
    description: "Pachangas y reservas de pista en el club Montesiña Padel.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${grotesk.variable} ${kalam.variable}`}>
      <body className="font-sans antialiased text-ink">{children}</body>
    </html>
  );
}
