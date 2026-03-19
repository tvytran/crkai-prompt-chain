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
    .order("step_order", { ascending: true });

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

  // Get max step_order for this flavor
  const { data: existing } = await supabase
    .from("humor_flavor_steps")
    .select("step_order")
    .eq("humor_flavor_id", id)
    .order("step_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].step_order + 1 : 1;

  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .insert({
      humor_flavor_id: id,
      step_order: body.step_order ?? nextOrder,
      prompt_template: body.prompt_template,
      description: body.description,
      llm_model_id: body.llm_model_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
