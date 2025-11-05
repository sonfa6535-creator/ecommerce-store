"use client";

import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
