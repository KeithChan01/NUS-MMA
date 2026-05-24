import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const supabase = await createServiceClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, signups(id, user_id, display_name, created_at)")
    .order("date_time", { ascending: true });

  return <AdminDashboard sessions={sessions ?? []} />;
}
