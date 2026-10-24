"use client";

import { browserDb } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  ChevronDown,
  LogOut,
  UserRound,
  ShieldCheck,
} from "lucide-react";

type Locale = "sv" | "so";

type Props = {
  locale: Locale;
};

type Member = {
  name: string;
  email: string;
  role: "member" | "admin";
};

export default function UserMenu({ locale }: Props) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const so = locale === "so";

  const [member, setMember] = useState<Member | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = browserDb();
    let active = true;

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setMember(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        setMember({
          name:
            profile?.full_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "RAJO Member",

          email: user.email || "",

          role: profile?.role === "admin" ? "admin" : "member",
        });
      } catch (error) {
        console.error("Failed to load member:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        if (active) void loadUser();
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Stäng menyn när användaren klickar utanför
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function logout() {
    const supabase = browserDb();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message);
      return;
    }

    setMember(null);
    setOpen(false);

    router.replace(`/${locale}`);
    router.refresh();
  }

  // Laddning
  if (loading) {
    return (
      <div className="h-10 w-28 animate-pulse rounded-full bg-blue-500/10" />
    );
  }

  // Inte inloggad
  if (!member) {
    return (
      <Link
        href={`/${locale}/login`}
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
      >
        <UserRound size={17} />
        {so ? "Soo gal" : "Logga in"}
      </Link>
    );
  }

  const firstName = member.name.split(" ")[0];

  return (
    <div ref={menuRef} className="relative z-110">

      {/* Profile button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 py-1.5 pl-1.5 pr-4 transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-500/15"
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
          {member.name.charAt(0).toUpperCase()}
        </div>

        <span className="max-w-28 truncate text-sm font-semibold text-slate-800 dark:text-white">
          {firstName}
        </span>

        <ChevronDown
          size={16}
          className={`text-blue-600 transition-transform duration-300 dark:text-blue-400 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-[120] w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-[#102341] dark:text-white"
        >

          {/* Member information */}
          <div className="border-b border-slate-200 px-3 py-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white">
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {member.name}
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {member.email}
                </p>
              </div>
            </div>
          </div>

          {/* My profile */}
          <Link
            href={`/${locale}/member`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <UserRound size={18} className="text-blue-500" />

            {so ? "Boggeyga" : "Min profil"}
          </Link>

          {/* Admin - endast administratörer */}
          {member.role === "admin" && (
            <Link
              href={`/${locale}/admin`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <ShieldCheck size={18} className="text-blue-500" />

              {so ? "Maamulka" : "Adminpanel"}
            </Link>
          )}

          {/* Logout */}
          <div className="mt-2 border-t border-slate-200 pt-2 dark:border-white/10">
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={18} />

              {so ? "Ka bax" : "Logga ut"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}