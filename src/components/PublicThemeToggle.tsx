"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export default function PublicThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const isDark = document.documentElement.classList.contains("public-dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  const toggle = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("public-dark", nextTheme === "dark");
    try {
      localStorage.setItem("public-theme", nextTheme);
    } catch (error) {
      void error;
    }
    try {
      document.cookie = `public-theme=${encodeURIComponent(nextTheme)}; Max-Age=31536000; Path=/; SameSite=Lax`;
    } catch (error) {
      void error;
    }
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
      aria-label={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
      title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
