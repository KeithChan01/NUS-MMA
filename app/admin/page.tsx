import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import type { Session } from "@/lib/types";

export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const supabase = createAdminClient();

  const [{ data: sessions }, { data: profiles }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*, signups(id, user_id, display_name, created_at)")
      .order("date_time", { ascending: true }),
    supabase.from("profiles").select("*"),
  ]);

  // Merge profiles into signups
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const sessionsWithProfiles: Session[] = (sessions ?? []).map((s) => ({
    ...s,
    signups: (s.signups ?? []).map((su: { user_id: string }) => ({
      ...su,
      profile: profileMap[su.user_id] ?? null,
    })),
  }));

  return <AdminDashboard sessions={sessionsWithProfiles} />;
}
