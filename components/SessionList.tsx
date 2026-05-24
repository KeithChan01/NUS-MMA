"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, Signup } from "@/lib/types";
import ProfileSetup from "@/components/ProfileSetup";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function MemberRow({ signup, isMe }: { signup: Signup; isMe: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {signup.display_name[0]?.toUpperCase()}
      </div>
      <span className={isMe ? "text-white font-medium" : "text-gray-300"}>
        {signup.display_name}{isMe && " (you)"}
      </span>
    </li>
  );
}

function SessionCard({
  session,
  currentUserId,
}: {
  session: Session;
  currentUserId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signups = session.signups ?? [];
  const mySignup = signups.find((s) => s.user_id === currentUserId);
  const isSignedUp = !!mySignup;

  const handleSignup = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!mySignup) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/signups/${mySignup.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-4 py-4 flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 w-12 text-center">
          <p className="text-xs text-gray-500 uppercase">
            {formatDate(session.date_time).split(" ")[0]}
          </p>
          <p className="text-2xl font-bold text-white leading-none">
            {new Date(session.date_time).getDate()}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(session.date_time).split(" ").slice(1).join(" ")}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white">{session.title}</h2>
            {isSignedUp && (
              <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full font-medium">
                Going
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {formatTime(session.date_time)} · {session.location}
          </p>
          <p className="text-xs text-gray-500 mt-1">{signups.length} signed up</p>
        </div>

        <svg
          className={`w-4 h-4 text-gray-500 mt-1 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 px-4 py-4 space-y-4">
          {session.notes && <p className="text-sm text-gray-400">{session.notes}</p>}

          {currentUserId ? (
            isSignedUp ? (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2.5 rounded-lg border border-gray-600 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? "Cancelling…" : "Cancel my spot"}
              </button>
            ) : (
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Signing up…" : "Sign up for this session"}
              </button>
            )
          ) : (
            <p className="text-sm text-gray-500 text-center">Sign in to join this session</p>
          )}

          {signups.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Who&apos;s coming ({signups.length})
              </p>
              <ul className="space-y-1">
                {signups.map((s) => (
                  <MemberRow key={s.id} signup={s} isMe={s.user_id === currentUserId} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionList({
  sessions,
  currentUserId,
  needsProfile,
}: {
  sessions: Session[];
  currentUserId: string | null;
  needsProfile: boolean;
}) {
  const [showProfileSetup, setShowProfileSetup] = useState(needsProfile);

  return (
    <>
      {showProfileSetup && (
        <ProfileSetup onClose={() => setShowProfileSetup(false)} />
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🥋</p>
          <p className="font-medium text-gray-400">No upcoming sessions yet</p>
          <p className="text-sm mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Upcoming sessions
          </p>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </>
  );
}
