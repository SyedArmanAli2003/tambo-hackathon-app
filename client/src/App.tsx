import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Documentation from "@/pages/Documentation";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { DashboardNavProvider } from "./contexts/DashboardNavContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import { TamboProvider } from "@tambo-ai/react";
import { tamboComponents } from "@/lib/tamboComponents";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/docs"} component={Documentation} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const isDev = import.meta.env.DEV;
  const tamboApiKey = import.meta.env.VITE_TAMBO_API_KEY?.trim() || undefined;

  return (
    <ErrorBoundary>
      <ThemeProvider defaultPreference="system">
        <TooltipProvider>
          <Toaster />
          {tamboApiKey ? (
            <TamboProvider apiKey={tamboApiKey} components={tamboComponents}>
              <DataProvider>
                <DashboardNavProvider>
                  <Navbar />
                  <Router />
                </DashboardNavProvider>
              </DataProvider>
            </TamboProvider>
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
              <div className="max-w-lg w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  AI features are not configured
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  This app requires a Tambo API key to generate dashboards.
                </p>
                {isDev ? (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Set <span className="font-mono">VITE_TAMBO_API_KEY</span> in your
                      <span className="font-mono"> .env.local</span> file (recommended) or
                      as an environment variable.
                    </p>
                    <pre className="mt-4 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-3 overflow-auto text-slate-800 dark:text-slate-300">
VITE_TAMBO_API_KEY=your_key_here
                    </pre>
                    <p className="text-sm text-slate-600 mt-3">
                      See <span className="font-mono">TAMBO_SETUP.md</span> for setup
                      steps.
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
