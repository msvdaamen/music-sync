import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools/production";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </>
  );
}
