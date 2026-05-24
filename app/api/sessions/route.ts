import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*, signups(id, user_id, display_name, created_at)")
    .gte("date_time", new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString())
    .order("date_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { title, date_time, location, notes } = body;

  if (!title || !date_time || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ title, date_time, location, notes: notes || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
