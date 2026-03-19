"use client";

import { Nav } from "@/components/nav";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Caption {
  id: string;
  content: string;
  created_datetime_utc: string;
  profile_id: string;
  image_id: string;
}

export default function FlavorCaptionsPage() {
  const { id } = useParams<{ id: string }>();
  const [flavorSlug, setFlavorSlug] = useState("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Load flavor info
      const flavorRes = await fetch(`/api/flavors/${id}`);
      const flavorData = await flavorRes.json();
      setFlavorSlug(flavorData.slug || "");

      // Load captions associated with this humor flavor
      const supabase = createClient();
      const { data } = await supabase
        .from("captions")
        .select("*")
        .eq("humor_flavor_id", id)
        .order("created_datetime_utc", { ascending: false })
        .limit(100);

      setCaptions(data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href={`/flavors/${id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            &larr; Back to {flavorSlug || "Flavor"}
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Captions: {flavorSlug}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Captions generated using this humor flavor.
        </p>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : captions.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              No captions found for this flavor.
            </p>
            <Link
              href={`/flavors/${id}/test`}
              className="text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              Test this flavor to generate some
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {captions.map((caption) => (
              <div
                key={caption.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
              >
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                  {caption.content}
                </p>
                <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span>
                    {new Date(caption.created_datetime_utc).toLocaleString()}
                  </span>
                  <span>Image: {caption.image_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
