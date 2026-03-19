"use client";

import { Nav } from "@/components/nav";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface HumorFlavor {
  id: string;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

interface FlavorStep {
  id: string;
  humor_flavor_id: string;
  step_order: number;
  prompt_template: string | null;
  description: string | null;
  llm_model_id: string | null;
}

export default function FlavorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [flavor, setFlavor] = useState<HumorFlavor | null>(null);
  const [steps, setSteps] = useState<FlavorStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlavor, setEditingFlavor] = useState(false);
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step editing
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState({
    prompt_template: "",
    description: "",
    llm_model_id: "",
  });

  // New step form
  const [showNewStep, setShowNewStep] = useState(false);
  const [newStep, setNewStep] = useState({
    prompt_template: "",
    description: "",
    llm_model_id: "",
  });

  const loadData = useCallback(async () => {
    const [flavorRes, stepsRes] = await Promise.all([
      fetch(`/api/flavors/${id}`),
      fetch(`/api/flavors/${id}/steps`),
    ]);
    const flavorData = await flavorRes.json();
    const stepsData = await stepsRes.json();
    setFlavor(flavorData);
    setSlug(flavorData.slug);
    setDescription(flavorData.description || "");
    setSteps(stepsData);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpdateFlavor(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/flavors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, description }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    } else {
      const data = await res.json();
      setFlavor(data);
      setEditingFlavor(false);
    }
    setSaving(false);
  }

  async function handleCreateStep(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/flavors/${id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStep),
    });
    if (res.ok) {
      setNewStep({ prompt_template: "", description: "", llm_model_id: "" });
      setShowNewStep(false);
      await loadData();
    }
    setSaving(false);
  }

  async function handleUpdateStep(stepId: string) {
    setSaving(true);
    await fetch(`/api/flavors/${id}/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stepForm),
    });
    setEditingStep(null);
    await loadData();
    setSaving(false);
  }

  async function handleDeleteStep(stepId: string) {
    if (!confirm("Delete this step?")) return;
    await fetch(`/api/flavors/${id}/steps/${stepId}`, { method: "DELETE" });
    await loadData();
  }

  async function handleMoveStep(stepId: string, direction: "up" | "down") {
    const idx = steps.findIndex((s) => s.id === stepId);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === steps.length - 1)
    )
      return;

    const newSteps = [...steps];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;

    // Swap step_order values
    const tempOrder = newSteps[idx].step_order;
    newSteps[idx].step_order = newSteps[swapIdx].step_order;
    newSteps[swapIdx].step_order = tempOrder;

    // Swap positions in array
    [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
    setSteps(newSteps);

    await fetch(`/api/flavors/${id}/steps/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: newSteps.map((s) => ({ id: s.id, step_order: s.step_order })),
      }),
    });
  }

  function startEditStep(step: FlavorStep) {
    setEditingStep(step.id);
    setStepForm({
      prompt_template: step.prompt_template || "",
      description: step.description || "",
      llm_model_id: step.llm_model_id || "",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  if (!flavor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Flavor not found.{" "}
            <Link href="/flavors" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to list
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/flavors"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            &larr; Back to Flavors
          </Link>
        </div>

        {/* Flavor Details */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {flavor.slug}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingFlavor(!editingFlavor)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {editingFlavor ? "Cancel" : "Edit"}
              </button>
              <Link
                href={`/flavors/${id}/test`}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
              >
                Test Flavor
              </Link>
              <Link
                href={`/flavors/${id}/captions`}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
              >
                View Captions
              </Link>
            </div>
          </div>

          {editingFlavor ? (
            <form onSubmit={handleUpdateFlavor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <>
              {flavor.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {flavor.description}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                ID: {flavor.id} &middot; Created:{" "}
                {new Date(flavor.created_datetime_utc).toLocaleDateString()}
              </p>
            </>
          )}
        </div>

        {/* Steps Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Steps ({steps.length})
          </h2>
          <button
            onClick={() => setShowNewStep(!showNewStep)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {showNewStep ? "Cancel" : "Add Step"}
          </button>
        </div>

        {/* New Step Form */}
        {showNewStep && (
          <form
            onSubmit={handleCreateStep}
            className="rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-5 mb-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              New Step (will be added as Step {steps.length + 1})
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newStep.description}
                  onChange={(e) =>
                    setNewStep({ ...newStep, description: e.target.value })
                  }
                  placeholder="e.g. Describe the image in detail"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prompt Template
                </label>
                <textarea
                  value={newStep.prompt_template}
                  onChange={(e) =>
                    setNewStep({ ...newStep, prompt_template: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter the prompt template for this step..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LLM Model ID (optional)
                </label>
                <input
                  type="text"
                  value={newStep.llm_model_id}
                  onChange={(e) =>
                    setNewStep({ ...newStep, llm_model_id: e.target.value })
                  }
                  placeholder="UUID of the LLM model"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Step"}
            </button>
          </form>
        )}

        {/* Steps List */}
        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            No steps yet. Add your first step to define the prompt chain.
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-700 dark:text-blue-300">
                      {step.step_order}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.description || `Step ${step.step_order}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveStep(step.id, "up")}
                      disabled={idx === 0}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveStep(step.id, "down")}
                      disabled={idx === steps.length - 1}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        editingStep === step.id
                          ? setEditingStep(null)
                          : startEditStep(step)
                      }
                      className="rounded p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="rounded p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingStep === step.id ? (
                  <div className="mt-3 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={stepForm.description}
                        onChange={(e) =>
                          setStepForm({ ...stepForm, description: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prompt Template
                      </label>
                      <textarea
                        value={stepForm.prompt_template}
                        onChange={(e) =>
                          setStepForm({ ...stepForm, prompt_template: e.target.value })
                        }
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        LLM Model ID
                      </label>
                      <input
                        type="text"
                        value={stepForm.llm_model_id}
                        onChange={(e) =>
                          setStepForm({ ...stepForm, llm_model_id: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStep(step.id)}
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingStep(null)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  step.prompt_template && (
                    <div className="mt-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {step.prompt_template}
                      </pre>
                    </div>
                  )
                )}

                {step.llm_model_id && editingStep !== step.id && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Model: {step.llm_model_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
