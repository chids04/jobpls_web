import { Link, createRootRoute, Outlet } from "@tanstack/react-router";

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
  component: RootComponent,
  notFoundComponent: () => (
    <div className="p-3 text-center">
      <h1 className="text-4xl font-bold">you shouldn't be here</h1>
      <Link to="/" className="text-blue-500 underline text-2xl p-5">
        go home
      </Link>
    </div>
  ),
});

function RootDocument() {
  return (
    <div className="flex min-h-screen flex-col">
      <Link to={"/account"}>
        <CircleUser className="fixed top-0 right-0 mt-4 mr-4 w-10 h-10 z-50 text-zinc-100" />
      </Link>

      <header className="w-full pt-8 pb-4 flex justify-center">
        <div className="relative inline-block">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
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

      <div className="w-full px-3 sm:px-6 md:px-8 sticky top-10 z-10">
        <nav className="w-full rounded-xl bg-zinc-800/80 shadow-lg ring-1 ring-black/10 backdrop-blur px-4 sm:px-6 py-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-1 text-sm sm:text-base font-medium">
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.link}
                  className="px-4 py-2 hover:text-white text-zinc-400 transition-all duration-200 rounded-lg"
                  activeProps={{
                    className: "text-white bg-zinc-700/50",
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <main className="container mx-auto px-10 mt-5 text-zinc-100 mb-5">
        <Outlet />
      </main>
    </div>
  );
}

function RootComponent() {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <RootDocument />
    </QueryClientProvider>
  );
}
