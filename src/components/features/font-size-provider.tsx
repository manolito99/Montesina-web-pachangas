"use client";

import { useEffect } from "react";

const STORAGE_KEY = "montesina-font-size";
const SIZES: Record<string, string> = {
  normal: "16px",
  grande: "18px",
  "muy-grande": "20px",
};

export function FontSizeProvider() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "normal";
    document.documentElement.style.fontSize = SIZES[saved] || "16px";
  }, []);

  return null;
}

export function setFontSize(size: string) {
  localStorage.setItem(STORAGE_KEY, size);
  document.documentElement.style.fontSize = SIZES[size] || "16px";
}

export function getFontSize(): string {
  if (typeof window === "undefined") return "normal";
  return localStorage.getItem(STORAGE_KEY) || "normal";
}
