import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  ssr: false,

  loader: () => {
    throw redirect({ to: "/home" });
  },
});

function Home() {
  return (
    <section className="mx-auto max-w-3xl">
      {/* dev note: this is just a simple placeholder until i add real routes */}
      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-300">
        <h2 className="text-lg font-medium text-zinc-100">default root</h2>
        <p className="mt-2 text-sm">
          this is a placeholder, the real pages will go here later
        </p>
      </div>
    </section>
  );
}
