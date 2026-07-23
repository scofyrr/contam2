import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@/hooks/use-session";
import { PermissionsProvider } from "@/hooks/use-permissions";
import { AccessibilityProvider } from "@/hooks/use-accessibility";
import { PerformanceSessionInit } from "@/components/performance/performance-session-init";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { buildPublicEnvScript } from "@/lib/public-env";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CONTAM — Contabilidad y Facturación Electrónica SIRE" },
      { name: "description", content: "Sistema contable peruano con generación automática de asientos PCGE y exportación SIRE (RVIE 140400 / RCE 130400)." },
      { name: "author", content: "CONTAM" },
      { property: "og:title", content: "CONTAM — Contabilidad y Facturación Electrónica SIRE" },
      { property: "og:description", content: "Sistema contable peruano con generación automática de asientos PCGE y exportación SIRE (RVIE 140400 / RCE 130400)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "CONTAM — Contabilidad y Facturación Electrónica SIRE" },
      { name: "twitter:description", content: "Sistema contable peruano con generación automática de asientos PCGE y exportación SIRE (RVIE 140400 / RCE 130400)." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f85529df-176e-4246-bef8-7575fc549d0c/id-preview-251a2dc7--094ea446-e262-429d-8869-700c117a0eca.lovable.app-1779571975827.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f85529df-176e-4246-bef8-7575fc549d0c/id-preview-251a2dc7--094ea446-e262-429d-8869-700c117a0eca.lovable.app-1779571975827.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: buildPublicEnvScript(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.documentElement;var raw=localStorage.getItem('contam-theme-config');var cfg=raw?JSON.parse(raw):null;var mode=cfg&&cfg.mode?cfg.mode:(localStorage.getItem('contam-dark-mode')==='true'?'dark':'light');if(mode==='system')mode=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(mode==='dark')r.classList.add('dark');else r.classList.remove('dark');r.dataset.theme=mode;if(cfg){if(cfg.fontScale)r.dataset.fontScale=cfg.fontScale;if(cfg.colorBlindMode)r.dataset.colorBlind=cfg.colorBlindMode;if(cfg.contrastLevel)r.dataset.contrast=cfg.contrastLevel;var bp=mode==='light'?17:16;r.style.fontSize='calc('+bp+'px * '+(cfg.fontScale||100)/100+')';}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <SessionProvider>
          <PermissionsProvider>
            <PerformanceSessionInit />
            <Outlet />
            <Toaster richColors position="top-right" />
          </PermissionsProvider>
        </SessionProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}
