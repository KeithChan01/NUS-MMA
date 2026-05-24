"use client";

import { useState } from "react";
import { WEIGHT_CLASSES, EXPERIENCE_LEVELS, MARTIAL_ARTS, type Profile } from "@/lib/types";

type Props = {
  existing?: Profile | null;
  onClose?: () => void;
};

export default function ProfileSetup({ existing, onClose }: Props) {
  const [form, setForm] = useState({
    display_name: existing?.display_name ?? "",
    weight_class: existing?.weight_class ?? "",
    muay_thai: existing?.muay_thai ?? "",
    kickboxing: existing?.kickboxing ?? "",
    bjj: existing?.bjj ?? "",
    wrestling: existing?.wrestling ?? "",
    boxing: existing?.boxing ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      window.location.reload();
      onClose?.();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  };

  const select =
    "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm appearance-none";
  const input =
    "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm";

  const isEditing = !!existing;

  return (
    <div className={isEditing ? "" : "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0"}>
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-base">
            {isEditing ? "Edit profile" : "Set up your profile"}
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {!isEditing && (
          <p className="text-sm text-gray-400 mb-4">
            Tell the coach a bit about yourself. Only your name is required.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Name <span className="text-brand">*</span>
            </label>
            <input
              className={input}
              placeholder="Your name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              required
            />
          </div>

          {/* Weight class */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Weight class</label>
            <select
              className={select}
              value={form.weight_class}
              onChange={(e) => setForm({ ...form, weight_class: e.target.value })}
            >
              <option value="">— Not specified —</option>
              {WEIGHT_CLASSES.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Martial arts experience */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Experience level</label>
            <div className="space-y-2">
              {MARTIAL_ARTS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-24 flex-shrink-0">{label}</span>
                  <select
                    className={`${select} flex-1`}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  >
                    <option value="">— None —</option>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : isEditing ? "Save profile" : "Save and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
