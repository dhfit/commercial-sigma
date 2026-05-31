"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const navLinks = [
  { href: "/properties", label: "Search" },
  { href: "/market", label: "Market Data" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="font-black text-sm">Σ</span>
              </div>
              <span className="font-bold text-lg tracking-tight">CommercialSigma</span>
            </Link>
            <div className="hidden md:flex gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(l.href)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/saved" className={`text-sm px-3 py-2 rounded-md transition-colors ${pathname === "/saved" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>
                  Saved
                </Link>
                <span className="text-slate-400 text-sm">{session.user.name ?? session.user.email}</span>
                <button onClick={() => signOut()} className="text-sm px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-slate-300 hover:text-white px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md font-medium transition-colors">
                  Get Free Access
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-md text-slate-300 hover:bg-slate-700" onClick={() => setOpen(!open)}>
            <div className="w-5 h-0.5 bg-current mb-1.5" />
            <div className="w-5 h-0.5 bg-current mb-1.5" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-slate-800 px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/saved" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700">Saved Properties</Link>
              <button onClick={() => { setOpen(false); signOut(); }} className="block w-full text-left px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700">Sign In</Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm bg-blue-600 text-white">Get Free Access</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
