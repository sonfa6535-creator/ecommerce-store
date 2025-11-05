"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AppProvider } from "@/contexts/AppContext";
import ThemeWrapper from "@/components/ThemeWrapper";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </AppProvider>
    </SessionProvider>
  );
}
