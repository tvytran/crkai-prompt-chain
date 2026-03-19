"use client";

import { Nav } from "@/components/nav";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HumorFlavor {
  id: string;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

export default function FlavorsPage() {
  const [flavors, setFlavors] = useState<HumorFlavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadFlavors() {
    const res = await fetch("/api/flavors");
    const data = await res.json();
    setFlavors(data);
    setLoading(false);
  }

  useEffect(() => {
    loadFlavors();
  }, []);

  async function handleDelete(id: string, slug: string) {
    if (!confirm(`Delete flavor "${slug}"? This will also delete all its steps.`)) {
      return;
    }
    setDeleting(id);
    await fetch(`/api/flavors/${id}`, { method: "DELETE" });
    setFlavors((prev) => prev.filter((f) => f.id !== id));
    setDeleting(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Humor Flavors
          </h1>
          <Link
            href="/flavors/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            New Flavor
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : flavors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No humor flavors yet.
            </p>
            <Link
              href="/flavors/new"
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              Create your first flavor
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {flavors.map((flavor) => (
              <div
                key={flavor.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/flavors/${flavor.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {flavor.slug}
                    </Link>
                    {flavor.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {flavor.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      ID: {flavor.id} &middot; Created:{" "}
                      {new Date(flavor.created_datetime_utc).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/flavors/${flavor.id}`}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/flavors/${flavor.id}/test`}
                      className="rounded-lg border border-green-300 dark:border-green-700 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    >
                      Test
                    </Link>
                    <Link
                      href={`/flavors/${flavor.id}/captions`}
                      className="rounded-lg border border-purple-300 dark:border-purple-700 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      Captions
                    </Link>
                    <button
                      onClick={() => handleDelete(flavor.id, flavor.slug)}
                      disabled={deleting === flavor.id}
                      className="rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      {deleting === flavor.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
