import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the signup belongs to this user before deleting
  const serviceClient = await createServiceClient();
  const { data: signup, error: fetchError } = await serviceClient
    .from("signups")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !signup) {
    return NextResponse.json({ error: "Signup not found" }, { status: 404 });
  }

  if (signup.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await serviceClient.from("signups").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
