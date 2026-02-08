import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { TamboProvider } from "@tambo-ai/react";
import { tamboComponents } from "@/lib/tamboComponents";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
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
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          {tamboApiKey ? (
            <TamboProvider apiKey={tamboApiKey} components={tamboComponents}>
              <Router />
            </TamboProvider>
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
              <div className="max-w-lg w-full bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">
                  AI features are not configured
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                  This app requires a Tambo API key to generate dashboards.
                </p>
                {isDev ? (
                  <>
                    <p className="text-sm text-slate-600 mt-2">
                      Set <span className="font-mono">VITE_TAMBO_API_KEY</span> in your
                      <span className="font-mono"> .env</span> file or environment.
                    </p>
                    <pre className="mt-4 text-xs bg-slate-50 border border-slate-200 rounded-md p-3 overflow-auto">
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
