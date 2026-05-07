import { useState } from "react";
import { Settings, Shield, User, RotateCcw } from "lucide-react";
import { signIn, signOut } from "@/lib/auth-client";

export function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const isDev = import.meta.env.VITE_DEBUG_MENU === "true";

  if (!isDev) return null;

  const loginAs = async (email: string) => {
    try {
      await signIn.email({
        email,
        password: "password123",
        callbackURL: window.location.pathname,
      });
    } catch (error) {
      alert(error);
    }
  };

  const resetTiers = async () => {
    try {
      await fetch("/api/dev/seed", {
        method: "POST",
        body: JSON.stringify({ reset: true }),
        headers: { "Content-Type": "application/json" },
      });
      window.location.reload();
    } catch (e) {
      console.error("Failed to reset tiers", e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen ? (
        <div className="bg-zinc-900 border-2 border-yellow-500/50 p-4 rounded-xl shadow-2xl flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-yellow-500 text-sm uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" /> Dev Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => loginAs("pro@test.com")}
              className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors"
            >
              <Shield className="w-4 h-4" /> Login as Pro
            </button>
            <button
              onClick={() => loginAs("free@test.com")}
              className="flex items-center gap-2 bg-zinc-700 text-zinc-100 px-3 py-2 rounded-lg text-sm font-bold hover:bg-zinc-600 transition-colors"
            >
              <User className="w-4 h-4" /> Login as Free
            </button>
          </div>

          <button
            onClick={resetTiers}
            className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset Tiers
          </button>

          <button
            onClick={() => signOut()}
            className="text-xs text-zinc-500 hover:text-red-400 mt-2 underline text-center"
          >
            Clear Session
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Dev Panel"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
