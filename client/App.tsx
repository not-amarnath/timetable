import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-dvh flex flex-col bg-gradient-to-b from-white to-secondary/40 dark:from-background dark:to-secondary/10">
            <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="container flex h-16 items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-primary to-purple-500" />
                  <span className="font-extrabold tracking-tight text-lg">TimeMatrix</span>
                </a>
                <nav className="flex items-center gap-2 text-sm">
                  <a href="/" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">Home</a>
                  <ModeToggle />
                </nav>
              </div>
            </header>
            <main className="flex-1"><Routes><Route path="/" element={<Index />} /><Route path="*" element={<NotFound />} /></Routes></main>
            <footer className="border-t">
              <div className="container py-6 text-sm text-muted-foreground flex items-center justify-between">
                <span>© {new Date().getFullYear()} TimeMatrix Timetabling</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Engine: Greedy prototype • OptaPlanner-ready</span>
                </span>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);