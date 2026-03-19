import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // validate route param exists
  const supabase = createAdminClient();
  const body = await request.json();

  // body.steps: [{ id: string, step_order: number }]
  const updates = body.steps as { id: string; step_order: number }[];

  for (const step of updates) {
    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({ step_order: step.step_order })
      .eq("id", step.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
