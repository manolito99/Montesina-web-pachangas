"use client";

import { useEffect } from "react";

const STORAGE_KEY = "montesina-font-size";
const ZOOM_LEVELS: Record<string, number> = {
  normal: 1,
  grande: 1.15,
  "muy-grande": 1.3,
};

export function FontSizeProvider() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "normal";
    applyZoom(saved);
  }, []);

  return null;
}

function applyZoom(size: string) {
  const zoom = ZOOM_LEVELS[size] || 1;
  document.body.style.zoom = String(zoom);
}

export function setFontSize(size: string) {
  localStorage.setItem(STORAGE_KEY, size);
  applyZoom(size);
}

export function getFontSize(): string {
  if (typeof window === "undefined") return "normal";
  return localStorage.getItem(STORAGE_KEY) || "normal";
}
