import { useEffect } from "react";

/** SPA replacement for TanStack Start's per-route `head: { meta: [{ title }] }`. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
