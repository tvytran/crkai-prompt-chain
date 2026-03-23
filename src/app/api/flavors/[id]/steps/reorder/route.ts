import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await request.json();

  // body.steps: [{ id: number, order_by: number }]
  const updates = body.steps as { id: number; order_by: number }[];

  for (const step of updates) {
    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({ order_by: step.order_by, modified_by_user_id: user.id })
      .eq("id", step.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
