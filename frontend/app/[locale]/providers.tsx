"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/shared/providers/AuthProvider";
import { queryClient } from "@/shared/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
