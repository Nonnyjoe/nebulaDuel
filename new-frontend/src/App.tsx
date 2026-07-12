import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { appRoutes } from "./app-routes";
import { ErrorBoundary } from "./components/system/ErrorBoundary";
import { NotFound } from "./components/system/NotFound";

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="size-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Loading…
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {appRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
