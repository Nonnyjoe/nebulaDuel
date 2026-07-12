import { type ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider } from "./ProfileProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Inspect reads are cheap and state changes often; keep them fresh-ish
      // but avoid hammering the node.
      staleTime: 4_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </ProfileProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
