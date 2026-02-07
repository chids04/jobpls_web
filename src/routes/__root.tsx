import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";

const links = [
  {
    name: "home",
    link: "/home",
  },
  {
    name: "about me",
    link: "/about-me",
  },
  {
    name: "templates",
    link: "/cv-template",
  },
  {
    name: "generate",
    link: "/generate",
  },
];

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Briefcase, CircleUser } from "lucide-react";

import appCss from "../styles.css?url";

// Create QueryClient singleton to prevent hydration mismatch
let queryClient: QueryClient | undefined;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    });
  }
  return queryClient;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "jobpls" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "module",
        src: "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst.ts/dist/esm/contrib/all-in-one-lite.bundle.js",
        id: "typst",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="min-h-screen bg-zinc-900 text-zinc-100 antialiased dark">
          <Link to={"/account"}>
            <CircleUser className="fixed top-0 right-0 mt-4 mr-4 w-10 h-10 z-50" />
          </Link>

          <div className="flex min-h-screen flex-col">
            <header className="w-full pt-8 pb-4 flex justify-center">
              <div className="relative inline-block">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                  jobpls
                </h1>
                <Briefcase
                  aria-hidden="true"
                  className="absolute -top-3 -right-6 h-5 w-5 sm:h-6 sm:w-6 rotate-12 text-zinc-400"
                  strokeWidth={2}
                />
              </div>
            </header>

            {/*nav bar*/}

            <div className="w-full px-3 sm:px-6 md:px-8">
              <nav className="w-full rounded-xl bg-zinc-800/80 shadow-lg ring-1 ring-black/10 backdrop-blur px-4 sm:px-6 py-2">
                <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm sm:text-base">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.link}
                        className="hover:text-white text-zinc-300 transition-colors"
                        activeProps={{ className: "font-bold text-xl" }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <main className="container mx-auto px-10 mt-5">
              <Outlet />
            </main>
          </div>

          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}
