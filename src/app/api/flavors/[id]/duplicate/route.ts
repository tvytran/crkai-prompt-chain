import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const serverClient = await createClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await request.json();
  const newSlug = body.slug;

  if (!newSlug || typeof newSlug !== "string" || !newSlug.trim()) {
    return NextResponse.json(
      { error: "A unique slug is required" },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("humor_flavors")
    .select("id")
    .eq("slug", newSlug.trim())
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: `A flavor with slug "${newSlug.trim()}" already exists` },
      { status: 409 }
    );
  }

  // Fetch original flavor
  const { data: original, error: fetchError } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json(
      { error: "Flavor not found" },
      { status: 404 }
    );
  }

  // Create new flavor
  const { data: newFlavor, error: createError } = await supabase
    .from("humor_flavors")
    .insert({
      slug: newSlug.trim(),
      description: original.description,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select()
    .single();

  if (createError || !newFlavor) {
    return NextResponse.json(
      { error: createError?.message || "Failed to create flavor" },
      { status: 500 }
    );
  }

  // Fetch and duplicate all steps
  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", id)
    .order("order_by", { ascending: true });

  if (steps && steps.length > 0) {
    const newSteps = steps.map((step) => ({
      humor_flavor_id: newFlavor.id,
      order_by: step.order_by,
      llm_system_prompt: step.llm_system_prompt,
      llm_user_prompt: step.llm_user_prompt,
      description: step.description,
      llm_model_id: step.llm_model_id,
      llm_temperature: step.llm_temperature,
      llm_input_type_id: step.llm_input_type_id,
      llm_output_type_id: step.llm_output_type_id,
      humor_flavor_step_type_id: step.humor_flavor_step_type_id,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    }));

    const { error: stepsError } = await supabase
      .from("humor_flavor_steps")
      .insert(newSteps);

    if (stepsError) {
      return NextResponse.json(
        { error: `Flavor created but failed to copy steps: ${stepsError.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(newFlavor, { status: 201 });
}
