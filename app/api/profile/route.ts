import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { display_name, weight_class, muay_thai, bjj, wrestling, boxing } = body;

  if (!display_name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: display_name.trim(),
      weight_class: weight_class || null,
      muay_thai: muay_thai || null,
      bjj: bjj || null,
      wrestling: wrestling || null,
      boxing: boxing || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
