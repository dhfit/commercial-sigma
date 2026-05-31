"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SaveButton({ propertyId, fullWidth = false }: { propertyId: string; fullWidth?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) { router.push("/auth/signin"); return; }
    setLoading(true);
    const res = await fetch("/api/saved", { method: "POST", body: JSON.stringify({ propertyId }), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setSaved(data.saved);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${fullWidth ? "w-full" : ""} flex items-center justify-center gap-2 border ${saved ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"} px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50`}
    >
      {saved ? "★ Saved" : "☆ Save Property"}
    </button>
  );
}
