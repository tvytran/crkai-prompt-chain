import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

async function tryTable(supabase: ReturnType<typeof createAdminClient>, ...tableNames: string[]) {
  for (const table of tableNames) {
    const { data, error } = await supabase.from(table).select("id, name").order("id");
    if (!error && data) return data;
  }
  return [];
}

export async function GET() {
  const supabase = createAdminClient();

  // Try multiple possible table name variations
  const [inputTypes, outputTypes, stepTypes, models, sampleSteps] = await Promise.all([
    tryTable(supabase, "llm_input_types", "llm_input_type", "input_types"),
    tryTable(supabase, "llm_output_types", "llm_output_type", "output_types"),
    tryTable(supabase, "humor_flavor_step_types", "humor_flavor_step_type", "flavor_step_types"),
    tryTable(supabase, "llm_models", "llm_model"),
    // Get sample of existing steps to see what valid IDs look like
    supabase.from("humor_flavor_steps")
      .select("llm_input_type_id, llm_output_type_id, humor_flavor_step_type_id, llm_model_id")
      .not("llm_input_type_id", "is", null)
      .limit(5)
      .then(r => r.data ?? []),
  ]);

  return NextResponse.json({
    inputTypes,
    outputTypes,
    stepTypes,
    models,
    debug: { sampleSteps },
  });
}
