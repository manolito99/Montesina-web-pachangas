import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Montesiña Padel — Pachangas y reservas",
    short_name: "Montesiña",
    description:
      "Organiza pachangas de pádel, reserva pistas y gestiona tus partidos en el club Montesiña Padel.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2ea",
    theme_color: "#0F1A2E",
    orientation: "portrait-primary",
    categories: ["sports", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
