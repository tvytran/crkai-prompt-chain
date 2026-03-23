import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await request.json();

  const updates: Record<string, unknown> = { modified_by_user_id: user.id };
  if (body.llm_system_prompt !== undefined) updates.llm_system_prompt = body.llm_system_prompt;
  if (body.llm_user_prompt !== undefined) updates.llm_user_prompt = body.llm_user_prompt;
  if (body.description !== undefined) updates.description = body.description;
  if (body.order_by !== undefined) updates.order_by = body.order_by;
  if (body.llm_model_id !== undefined) updates.llm_model_id = body.llm_model_id || null;
  if (body.llm_temperature !== undefined) updates.llm_temperature = body.llm_temperature;
  if (body.llm_input_type_id !== undefined) updates.llm_input_type_id = body.llm_input_type_id || null;
  if (body.llm_output_type_id !== undefined) updates.llm_output_type_id = body.llm_output_type_id || null;
  if (body.humor_flavor_step_type_id !== undefined) updates.humor_flavor_step_type_id = body.humor_flavor_step_type_id || null;

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
