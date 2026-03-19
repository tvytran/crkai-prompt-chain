"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function Nav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/flavors"
              className="text-sm font-bold text-gray-900 dark:text-white"
            >
              Prompt Chain Tool
            </Link>
            <Link
              href="/flavors"
              className={`text-sm transition-colors ${
                pathname.startsWith("/flavors")
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Flavors
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {email && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                {email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
