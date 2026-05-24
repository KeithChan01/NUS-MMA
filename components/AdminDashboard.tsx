"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/types";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isPast(iso: string) {
  return new Date(iso) < new Date();
}

function CreateSessionForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const date_time = new Date(`${form.date}T${form.time}`).toISOString();

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        date_time,
        location: form.location,
        notes: form.notes || undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setForm({ title: "", date: "", time: "", location: "", notes: "" });
      onCreated();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  };

  const field =
    "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className={field}
        placeholder="Session title (e.g. Sparring Night)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          className={field}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          type="time"
          className={field}
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />
      </div>
      <input
        className={field}
        placeholder="Location (e.g. MPSH 3)"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        required
      />
      <textarea
        className={`${field} resize-none`}
        rows={2}
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create session"}
      </button>
    </form>
  );
}

function SessionRow({ session, onDeleted, onUpdated }: { session: Session; onDeleted: () => void; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const past = isPast(session.date_time);
  const signups = session.signups ?? [];

  const dt = new Date(session.date_time);
  const [editForm, setEditForm] = useState({
    title: session.title,
    date: dt.toLocaleDateString("en-CA"),
    time: dt.toTimeString().slice(0, 5),
    location: session.location,
    notes: session.notes ?? "",
  });

  const handleDelete = async () => {
    if (!confirm(`Delete "${session.title}"? This will remove all sign-ups.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
    else setDeleting(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    const date_time = new Date(`${editForm.date}T${editForm.time}`).toISOString();
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        date_time,
        location: editForm.location,
        notes: editForm.notes || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      onUpdated();
    } else {
      const data = await res.json();
      setEditError(data.error ?? "Something went wrong");
    }
  };

  const field = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm";

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden ${past ? "border-gray-800 opacity-60" : "border-gray-700"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          className="flex-1 text-left min-w-0"
          onClick={() => { setExpanded(!expanded); setEditing(false); }}
        >
          <p className={`font-medium text-sm ${past ? "text-gray-400" : "text-white"}`}>
            {session.title}
            {past && <span className="ml-2 text-xs text-gray-500">(past)</span>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDateTime(session.date_time)} · {session.location}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {signups.length} signed up
          </p>
        </button>
        {/* Edit button */}
        <button
          onClick={() => { setEditing(!editing); setExpanded(true); }}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-400 transition-colors"
          title="Edit session"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete session"
        >
          {deleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
        <svg
          className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          onClick={() => setExpanded(!expanded)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-3">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-2">
              <input className={field} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" required />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className={field} value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
                <input type="time" className={field} value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} required />
              </div>
              <input className={field} value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Location" required />
              <textarea className={`${field} resize-none`} rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes (optional)" />
              {editError && <p className="text-xs text-red-400">{editError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-600 text-gray-300 text-sm rounded-lg hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {signups.length === 0 ? (
                <p className="text-sm text-gray-500">No sign-ups yet.</p>
              ) : (
                <ul className="space-y-1">
                  {signups.map((s, i) => (
                    <li key={s.id} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-4 text-right">{i + 1}.</span>
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const upcoming = sessions.filter((s) => !isPast(s.date_time));
  const past = sessions.filter((s) => isPast(s.date_time));

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥊</span>
            <div>
              <h1 className="font-bold text-white text-sm">Coach Admin</h1>
              <p className="text-xs text-gray-400">NUS MMA</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create session */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="font-semibold text-white text-sm">Create new session</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showForm ? "rotate-45" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {showForm && (
            <div className="mt-4">
              <CreateSessionForm
                onCreated={() => {
                  setShowForm(false);
                  router.refresh();
                }}
              />
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
            Upcoming ({upcoming.length})
          </p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No upcoming sessions. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((s) => (
                <SessionRow key={s.id} session={s} onDeleted={() => router.refresh()} onUpdated={() => router.refresh()} />
              ))}
            </div>
          )}
        </div>

        {/* Past sessions */}
        {past.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
              Past sessions
            </p>
            <div className="space-y-2">
              {past.map((s) => (
                <SessionRow key={s.id} session={s} onDeleted={() => router.refresh()} onUpdated={() => router.refresh()} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
