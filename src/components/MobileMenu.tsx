"use client";

import { browserDb } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  Heart,
  Home,
  Images,
  Info,
  Lightbulb,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  X,
} from "lucide-react";

type Locale = "sv" | "so";

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
};

type Member = {
  name: string;
  email: string;
  role: "member" | "admin";
};

export default function MobileMenu({
  locale,
  open,
  onClose,
  theme,
  toggleTheme,
}: Props) {
  const router = useRouter();
  const so = locale === "so";

  const [member, setMember] = useState<Member | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = browserDb();
    let active = true;

    async function loadUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (error || !user) {
          setMember(null);
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
        console.error("Failed to load user:", error);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Read user after auth state has been updated.
      setTimeout(() => {
        if (active) void loadUser();
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  async function logout() {
    try {
      const supabase = browserDb();

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setMember(null);
      onClose();

      router.replace(`/${locale}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : so
            ? "Ka bixitaanku wuu fashilmay."
            : "Kunde inte logga ut."
      );
    }
  }

  const links = [
    {
      href: `/${locale}`,
      icon: Home,
      sv: "Startsida",
      so: "Bogga Hore",
    },
    {
      href: `/${locale}/moments`,
      icon: Images,
      sv: "Våra minnen",
      so: "Xusuusaheenna",
    },
    {
      href: `/${locale}/activities`,
      icon: CalendarDays,
      sv: "Aktiviteter",
      so: "Hawlaha",
    },
    {
      href: `/${locale}/ideas`,
      icon: Lightbulb,
      sv: "Idéer & röstning",
      so: "Fikrado & Codbixin",
    },
    {
      href: `/${locale}/about`,
      icon: Info,
      sv: "Om RAJO",
      so: "Ku Saabsan RAJO",
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-300 min-[1025px]:hidden ${
        open ? "visible" : "invisible pointer-events-none"
      }`}
    >
      {/* Dark overlay */}
      <button
        type="button"
        onClick={onClose}
        aria-label={so ? "Xir liiska" : "Stäng menyn"}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 h-full w-full bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding drawer */}
      <aside
        id="rajo-mobile-navigation"
        role="dialog"
        aria-modal={open}
        aria-label={so ? "Liiska RAJO" : "RAJO-meny"}
        inert={!open}
        className={`absolute right-0 top-0 flex h-dvh w-[min(88vw,390px)] flex-col overflow-hidden border-l border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-500 ease-out dark:border-white/10 dark:bg-[#0b1c33] dark:text-white ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/images/rajo-logo.jpeg"
              alt="RAJO Community"
              className="h-11 w-11 rounded-full object-contain"
            />

            <div>
              <h2 className="text-lg font-extrabold tracking-widest text-blue-700 dark:text-blue-300">
                RAJO
              </h2>

              <p className="text-[9px] font-bold tracking-[0.3em] text-slate-500 dark:text-slate-400">
                COMMUNITY
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={so ? "Xir" : "Stäng"}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition hover:bg-blue-100 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* Member profile */}
          {member ? (
            <Link
              href={`/${locale}/member`}
              onClick={onClose}
              className="group mb-7 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:border-blue-400 dark:border-blue-400/20 dark:bg-blue-500/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white">
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {so ? "Soo dhowow!" : "Välkommen tillbaka!"}
                </p>

                <p className="truncate font-bold text-slate-900 dark:text-white">
                  {member.name}
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {member.email}
                </p>
              </div>

              <ArrowRight size={18} className="text-blue-500" />
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              onClick={onClose}
              className="mb-7 flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <UserRound size={24} />
              </div>

              <div className="flex-1">
                <p className="font-bold">
                  {so ? "Soo gal" : "Logga in"}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {so
                    ? "Ku biir bulshadeenna"
                    : "Bli en del av gemenskapen"}
                </p>
              </div>

              <ArrowRight size={18} />
            </Link>
          )}

          {/* Navigation */}
          <nav className="space-y-1" aria-label="RAJO navigation">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:translate-x-1 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-blue-300"
                >
                  <Icon size={20} />

                  <span>{so ? item.so : item.sv}</span>

                  <ArrowRight
                    size={16}
                    className="ml-auto opacity-30 transition group-hover:opacity-100"
                  />
                </Link>
              );
            })}

          {member ? (
  <Link
    href={`/${locale}/member`}
    onClick={onClose}
    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-white/10"
  >
    <UserRound size={20} />
    {so ? "Boggeyga" : "Min profil"}
  </Link>
) : (
  <Link
    href={`/${locale}/join`}
    onClick={onClose}
    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-white/10"
  >
    <Heart size={20} />
    {so ? "Nagu Soo Biir" : "Bli medlem"}
  </Link>
)}

            {member && (
              <>
                {member.role === "admin" && (
                  <Link
                    href={`/${locale}/admin`}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <ShieldCheck size={20} />

                    {so ? "Maamulka" : "Adminpanel"}
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Settings */}
          <div className="mt-7 border-t border-slate-200 pt-6 dark:border-white/10">
            <p className="mb-3 flex items-center gap-2 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Settings size={16} />

              {so ? "Dejinta" : "Inställningar"}
            </p>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {theme === "dark" ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}

              <span className="flex-1">
                {theme === "dark"
                  ? so
                    ? "Muuqaal mugdi ah"
                    : "Mörkt tema"
                  : so
                    ? "Muuqaal iftiin ah"
                    : "Ljust tema"}
              </span>

              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  theme === "dark" ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </button>

            {member && (
              <button
                type="button"
                onClick={logout}
                className="mt-2 flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={20} />

                {so ? "Ka bax" : "Logga ut"}
              </button>
            )}

            {errorMessage && (
              <p role="alert" className="px-4 py-2 text-sm text-red-500">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 px-6 py-5 text-center dark:border-white/10">
          <p className="text-xs font-bold tracking-[0.18em] text-blue-600 dark:text-blue-400">
            CONNECT · SHARE · GROW
          </p>

          <p className="mt-2 text-xs text-slate-400">
            © RAJO Community
          </p>
        </div>
      </aside>
    </div>
  );
}