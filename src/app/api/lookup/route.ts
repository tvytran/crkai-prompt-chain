import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();

  const [inputTypes, outputTypes, stepTypes, models] = await Promise.all([
    supabase.from("llm_input_types").select("id, slug, description").order("id"),
    supabase.from("llm_output_types").select("id, slug, description").order("id"),
    supabase.from("humor_flavor_step_types").select("id, slug, description").order("id"),
    supabase.from("llm_models").select("id, name").order("name"),
  ]);

  return NextResponse.json({
    inputTypes: inputTypes.data ?? [],
    outputTypes: outputTypes.data ?? [],
    stepTypes: stepTypes.data ?? [],
    models: models.data ?? [],
  });
}
