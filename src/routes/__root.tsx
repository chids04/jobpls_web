import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
// import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
// import { TanStackDevtools } from "@tanstack/react-devtools";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "jobpls" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

const queryClient = new QueryClient();

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="min-h-screen bg-zinc-900 text-zinc-100 antialiased dark">
          {/* dev note: laying out the page as a simple flex column for readability */}
          <div className="flex min-h-screen flex-col">
            {/* header - centered 'jobpls' with a tiny rotated icon on the top-right */}
            <header className="w-full pt-8 pb-4 flex justify-center">
              {/* dev note: using relative so i can position the icon nicely */}
              <div className="relative inline-block">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                  jobpls
                </h1>
                {/* dev note: small rotated icon to add a bit of character */}
                <Briefcase
                  aria-hidden="true"
                  className="absolute -top-3 -right-6 h-5 w-5 sm:h-6 sm:w-6 rotate-12 text-zinc-400"
                  strokeWidth={2}
                />
              </div>
            </header>

            {/* navbar - full width with margins, rounded corners and shadow; wraps on small screens */}
            <div className="w-full px-3 sm:px-6 md:px-8">
              <nav className="w-full rounded-xl bg-zinc-800/80 shadow-lg ring-1 ring-black/10 backdrop-blur px-4 sm:px-6 py-2">
                {/* dev note: keeping the items simple text links with pipes between */}
                <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm sm:text-base">
                  <li>
                    <Link
                      to="/about-me"
                      className="hover:text-white text-zinc-300 transition-colors"
                    >
                      about me
                    </Link>
                  </li>
                  <li className="text-zinc-500">|</li>
                  <li>
                    <Link
                      to="/cv-template"
                      className="hover:text-white text-zinc-300 transition-colors"
                    >
                      cv template
                    </Link>
                  </li>
                  <li className="text-zinc-500">|</li>
                  <li>
                    <a
                      href="/generate"
                      className="hover:text-white text-zinc-300 transition-colors"
                    >
                      generate
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* main outlet - routes will render here */}
            <main className="flex-1 w-full px-3 sm:px-6 md:px-8 py-6">
              <div className="mx-auto max-w-6xl">
                {children ?? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-300">
                    {/* dev note: placeholder content since there are no routes right now */}
                    <p>
                      this is the default root. routes will render here later.
                    </p>
                  </div>
                )}
              </div>
            </main>

            {/* dev note: small spacer so content doesn't stick to bottom */}
            <div className="h-6" />
          </div>

          {/* TanStack devtools temporarily disabled due to module export mismatch */}

          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}
