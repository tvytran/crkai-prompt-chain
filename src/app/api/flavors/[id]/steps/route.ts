import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", id)
    .order("order_by", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  // Get max order_by for this flavor
  const { data: existing } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", id)
    .order("order_by", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].order_by + 1 : 1;

  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .insert({
      humor_flavor_id: id,
      order_by: body.order_by ?? nextOrder,
      llm_system_prompt: body.llm_system_prompt,
      llm_user_prompt: body.llm_user_prompt,
      description: body.description,
      llm_model_id: body.llm_model_id || null,
      llm_temperature: body.llm_temperature ?? 0.7,
      llm_input_type_id: body.llm_input_type_id || null,
      llm_output_type_id: body.llm_output_type_id || null,
      humor_flavor_step_type_id: body.humor_flavor_step_type_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
