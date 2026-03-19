import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.prompt_template !== undefined) updates.prompt_template = body.prompt_template;
  if (body.description !== undefined) updates.description = body.description;
  if (body.step_order !== undefined) updates.step_order = body.step_order;
  if (body.llm_model_id !== undefined) updates.llm_model_id = body.llm_model_id || null;

  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .update(updates)
    .eq("id", stepId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("id", stepId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
