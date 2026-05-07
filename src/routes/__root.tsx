import { Link, createRootRoute, Outlet } from "@tanstack/react-router";
import { useSession, signOut, signIn } from "@/lib/auth-client";
import { DevPanel } from "@/components/debug/DevPanel";
import { DEBUG_MENU } from "@/lib/vars";

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
import {
  Briefcase,
  CircleUser,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";

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
  errorComponent: ({ error, reset }) => (
    <div className="flex flex-col items-center gap-4 p-10 text-center">
      <h1 className="text-3xl font-bold">something went wrong</h1>
      <p className="text-zinc-400 max-w-md">
        an unexpected error occurred. you can try again, or go back to the home
        page.
      </p>
      {import.meta.env.DEV && (
        <pre className="text-xs text-red-400 bg-zinc-900 p-3 rounded max-w-2xl overflow-auto text-left">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg"
        >
          try again
        </button>
        <Link
          to="/"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg border border-zinc-700"
        >
          go home
        </Link>
      </div>
    </div>
  ),
});

function RootDocument() {
  const { data: session, isPending } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      {DEBUG_MENU && <DevPanel />}

      <div className="w-full px-3 sm:px-6 md:px-8 sticky top-0 z-10">
        <nav className="w-full rounded-xl bg-zinc-800/80 shadow-lg ring-1 ring-black/10 backdrop-blur px-4 sm:px-6 py-2">
          <div className="flex items-center">
            <div className="flex-1" />
            <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3 text-sm sm:text-base font-medium">
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
            <div className="flex-1 flex items-center justify-end gap-3">
              {!isPending && !session && (
                <Link to="/account">
                  <button className="bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-600 transition-colors border border-zinc-600">
                    Sign In
                  </button>
                </Link>
              )}
              {!isPending && session?.user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 hidden sm:inline">
                    {session.user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
              <Link to="/account">
                <CircleUser className="w-7 h-7 text-zinc-100" />
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="w-full flex justify-center pt-6 pb-2">
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
