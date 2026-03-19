"use client";

import { Nav } from "@/components/nav";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API_BASE = "https://api.almostcrackd.ai";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface GeneratedCaption {
  id: string;
  content: string;
  [key: string]: unknown;
}

export default function TestFlavorPage() {
  const { id } = useParams<{ id: string }>();
  const [flavorSlug, setFlavorSlug] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
    });
    fetch(`/api/flavors/${id}`)
      .then((r) => r.json())
      .then((d) => setFlavorSlug(d.slug || ""));
  }, [id]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Unsupported file type.");
      return;
    }
    setFile(selected);
    setError(null);
    setCaptions([]);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleGenerate() {
    if (!file || !token) return;
    setLoading(true);
    setError(null);
    setCaptions([]);

    try {
      // Step 1: Get presigned URL
      setStatus("Getting upload URL...");
      const step1 = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!step1.ok) throw new Error(`Failed to get upload URL (${step1.status})`);
      const { presignedUrl, cdnUrl } = await step1.json();

      // Step 2: Upload image
      setStatus("Uploading image...");
      const step2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!step2.ok) throw new Error(`Failed to upload image (${step2.status})`);

      // Step 3: Register image
      setStatus("Registering image...");
      const step3 = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      if (!step3.ok) throw new Error(`Failed to register image (${step3.status})`);
      const { imageId } = await step3.json();

      // Step 4: Generate captions using humor flavor
      setStatus("Generating captions with this flavor...");
      const step4 = await fetch(`/api/flavors/${id}/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });
      if (!step4.ok) {
        const errData = await step4.json();
        throw new Error(errData.error || `Failed to generate captions (${step4.status})`);
      }

      const data = await step4.json();
      setCaptions(data.captions || []);
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href={`/flavors/${id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            &larr; Back to {flavorSlug || "Flavor"}
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Test: {flavorSlug}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Upload an image to generate captions using this humor flavor&apos;s prompt chain.
        </p>

        {/* Upload Area */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-5">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />

          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={preview}
                alt="Selected"
                className="max-h-64 rounded-xl object-contain"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setCaptions([]);
                  setError(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Remove image
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 py-12 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Click to select an image</span>
              <span className="text-xs">JPEG, PNG, WebP, or GIF</span>
            </button>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!file || loading}
          className={`mb-5 w-full rounded-lg px-6 py-3 text-sm font-medium transition-all ${
            file && !loading
              ? "bg-green-600 text-white hover:bg-green-700"
              : "cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-400"
          }`}
        >
          {loading ? status || "Processing..." : "Generate Captions"}
        </button>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Generated Captions */}
        {captions.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Generated Captions ({captions.length})
            </h2>
            <div className="space-y-3">
              {captions.map((caption, i) => (
                <div
                  key={caption.id || i}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {caption.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
