import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SessionList from "@/components/SessionList";
import SignInButton from "@/components/SignInButton";
import UserMenu from "@/components/UserMenu";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const serviceClient = createAdminClient();

  const [{ data: sessions }, { data: profile }] = await Promise.all([
    serviceClient
      .from("sessions")
      .select("*, signups(id, user_id, display_name, created_at)")
      .gte("date_time", new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString())
      .order("date_time", { ascending: true }),
    user
      ? serviceClient.from("profiles").select("*").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const needsProfile = !!user && !profile;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/NUS_MMA_Logo_No BG.png" alt="NUS MMA" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">NUS MMA</h1>
              <p className="text-gray-400 text-sm">Training Sessions</p>
            </div>
          </div>
          {user ? <UserMenu user={user} profile={profile} /> : <SignInButton />}
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {!user && (
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-300">
            Sign in with Google to sign up for training sessions.
          </div>
        )}

        <SessionList
          sessions={sessions ?? []}
          currentUserId={user?.id ?? null}
          needsProfile={needsProfile}
        />
      </main>
    </div>
  );
}
