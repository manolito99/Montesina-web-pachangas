"use client";

import { useEffect } from "react";

const STORAGE_KEY = "montesina-font-size";
const LEVELS: Record<string, { zoom: number; fontSize: string }> = {
  normal: { zoom: 1, fontSize: "16px" },
  grande: { zoom: 1.1, fontSize: "18px" },
  "muy-grande": { zoom: 1.2, fontSize: "20px" },
};

export function FontSizeProvider() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "normal";
    applySize(saved);
  }, []);

  return null;
}

function applySize(size: string) {
  if (size === "normal") {
    // Limpiar cualquier estilo previo para no romper position:fixed en iOS
    document.body.style.zoom = "";
    document.documentElement.style.fontSize = "";
    return;
  }
  const level = LEVELS[size] || LEVELS.normal;
  document.body.style.zoom = String(level.zoom);
  document.documentElement.style.fontSize = level.fontSize;
}

export function setFontSize(size: string) {
  localStorage.setItem(STORAGE_KEY, size);
  applySize(size);
}

export function getFontSize(): string {
  if (typeof window === "undefined") return "normal";
  return localStorage.getItem(STORAGE_KEY) || "normal";
}
