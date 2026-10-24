"use client";

import { browserDb } from "@/lib/supabase/browser";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Heart,
  Lightbulb,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type MemberProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "member" | "admin";
};

type Member = {
  name: string;
  email: string;
  profile: MemberProfile | null;
};

export default function MemberPage() {
  const router = useRouter();
  const params = useParams();

  const locale = params.locale === "so" ? "so" : "sv";
  const so = locale === "so";

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const supabase = browserDb();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace(`/${locale}/login`);
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", user.id)
            .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        const name =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "RAJO Member";

        if (active) {
          setMember({
            name,
            email: user.email || "",
            profile: profile || null,
          });
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Kunde inte hämta profilen."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [locale, router]);

  async function logout() {
    const supabase = browserDb();

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace(`/${locale}/login`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#050d1b]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </main>
    );
  }

  if (!member) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 dark:bg-[#050d1b]">
        <p className="text-center text-red-600 dark:text-red-400">
          {errorMessage || (so ? "Koontada lama helin." : "Ingen profil hittades.")}
        </p>

        <Link
          href={`/${locale}/login`}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          {so ? "Soo gal" : "Logga in"}
        </Link>
      </main>
    );
  }

  const firstName = member.name.split(" ")[0];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-[#050d1b] dark:text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Top navigation */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-300"
          >
            <ArrowLeft size={18} />
            {so ? "Bogga hore" : "Tillbaka till startsidan"}
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-red-300 hover:text-red-500 dark:border-white/10 dark:bg-white/5"
          >
            <LogOut size={17} />
            {so ? "Ka bax" : "Logga ut"}
          </button>
        </div>

        {/* Welcome */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-8 text-white shadow-xl shadow-blue-600/10 sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-md">
              {member.name.charAt(0).toUpperCase()}
            </div>

            <p className="mb-3 text-sm font-semibold tracking-widest text-blue-100">
              RAJO COMMUNITY
            </p>

            <h1 className="text-3xl font-extrabold sm:text-5xl">
              {so
                ? `Soo dhowow, ${firstName}! 👋`
                : `Välkommen, ${firstName}! 👋`}
            </h1>

            <p className="mt-5 max-w-lg text-blue-100">
              {so
                ? "Waa ku faraxsanahay inaad qayb ka tahay bulshadeenna."
                : "Vad roligt att du är här. Tillsammans bygger vi en gemenskap fylld av vänskap och möjligheter."}
            </p>
          </div>
        </section>

        {/* Profile card */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#102341] sm:p-9">
          <div className="mb-7 flex items-center gap-3">
            <UserRound className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold">
              {so ? "Macluumaadkaaga" : "Min profil"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                {so ? "Magaca" : "Fullständigt namn"}
              </p>

              <p className="font-semibold">{member.name}</p>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                {so ? "Iimayl" : "E-postadress"}
              </p>

              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <p className="break-all font-semibold">{member.email}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                {so ? "Doorka" : "Kontotyp"}
              </p>

              <p className="font-semibold">
                {member.profile?.role === "admin"
                  ? "Admin"
                  : so
                    ? "Xubin"
                    : "Medlem"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                {so ? "Xaqiijinta iimaylka" : "E-postverifiering"}
              </p>

              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={17} />
                <span className="font-semibold">
                  {so ? "La xaqiijiyay" : "Verifierad"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="mt-8">
          <h2 className="mb-6 text-2xl font-bold">
            {so ? "Bulshada RAJO" : "Utforska RAJO"}
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: CalendarDays,
                title: so ? "Hawlaha" : "Aktiviteter",
                description: so
                  ? "Eeg hawlaha soo socda"
                  : "Upptäck kommande aktiviteter",
                href: `/${locale}/activities`,
              },
              {
                icon: Lightbulb,
                title: so ? "Fikradaha" : "Idéer",
                description: so
                  ? "La wadaag fikradahaaga"
                  : "Dela dina idéer",
                href: `/${locale}/ideas`,
              },
              {
                icon: Heart,
                title: so ? "Bulshadeenna" : "Bli medlem",
                description: so
                  ? "Ka qayb noqo bulshada"
                  : "Läs om RAJO:s medlemskap",
                href: `/${locale}/join`,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-white/10 dark:bg-[#102341] dark:hover:border-blue-500/40"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Icon size={23} />
                  </div>

                  <h3 className="mb-2 text-lg font-bold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Error */}
        {errorMessage && (
          <p role="alert" className="mt-6 text-sm text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}