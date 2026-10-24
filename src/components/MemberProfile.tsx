"use client";

import { browserDb } from "@/lib/supabase/browser";

import {
  ArrowLeft,
  CalendarDays,
  Lightbulb,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Locale = "sv" | "so";

type Profile = {
  full_name: string | null;
  role: string;
};

export default function MemberProfile({
  locale,
}: {
  locale: Locale;
}) {
  const router = useRouter();
  const so = locale === "so";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = browserDb();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/${locale}/login`);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle<Profile>();

      setName(
        data?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "RAJO Member"
      );

      setEmail(user.email || "");
      setRole(data?.role || "member");
      setVerified(Boolean(user.email_confirmed_at));
      setLoading(false);
    }

    void loadProfile();
  }, [locale, router]);

  async function logout() {
    const supabase = browserDb();

    await supabase.auth.signOut();

    router.replace(`/${locale}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#071426]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </main>
    );
  }

  const firstName = name.split(" ")[0];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 dark:bg-[#071426] dark:text-white">
      <div className="mx-auto max-w-5xl">

        {/* Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            <ArrowLeft size={18} />
            {so ? "Bogga hore" : "Tillbaka till startsidan"}
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-white/10 dark:bg-white/5"
          >
            <LogOut size={17} />
            {so ? "Ka bax" : "Logga ut"}
          </button>
        </div>

        {/* Welcome */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#104f9e] via-blue-600 to-cyan-600 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>

            <span className="text-sm font-bold tracking-[0.2em] text-blue-100">
              RAJO COMMUNITY
            </span>

            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
              {so
                ? `Soo dhowow, ${firstName}! 👋`
                : `Välkommen, ${firstName}! 👋`}
            </h1>

            <p className="mt-4 max-w-lg text-blue-100">
              {so
                ? "Waa ku faraxsanahay inaad qayb ka tahay bulshadeenna."
                : "Här hittar du din profil och dina aktiviteter i RAJO Community."}
            </p>
          </div>
        </section>

        {/* Profile details */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#102640] sm:p-9">
          <div className="mb-8 flex items-center gap-3">
            <UserRound className="text-blue-600 dark:text-blue-400" />

            <h2 className="text-2xl font-bold">
              {so ? "Macluumaadkayga" : "Mina uppgifter"}
            </h2>
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {so ? "Magaca oo buuxa" : "Fullständigt namn"}
              </p>

              <p className="mt-2 font-semibold">{name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {so ? "Iimayl" : "E-postadress"}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <span className="break-all font-semibold">{email}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {so ? "Nooca koontada" : "Kontotyp"}
              </p>

              <p className="mt-2 font-semibold">
                {role === "admin"
                  ? "Admin"
                  : so
                    ? "Xubin"
                    : "Medlem"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {so ? "Xaqiijinta iimaylka" : "E-postbekräftelse"}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <ShieldCheck
                  size={18}
                  className={
                    verified ? "text-emerald-500" : "text-amber-500"
                  }
                />

                <span className="font-semibold">
                  {verified
                    ? so
                      ? "La xaqiijiyay"
                      : "Verifierad"
                    : so
                      ? "Lama xaqiijin"
                      : "Inte verifierad"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Member actions */}
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-bold">
            {so ? "Bulshada RAJO" : "Min gemenskap"}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">

            <Link
              href={`/${locale}/activities`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-white/10 dark:bg-[#102640]"
            >
              <CalendarDays
                size={28}
                className="mb-4 text-blue-600 dark:text-blue-400"
              />

              <h3 className="text-lg font-bold">
                {so ? "Hawlaha" : "Aktiviteter"}
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {so
                  ? "Eeg hawlaha bulshada."
                  : "Upptäck RAJO:s kommande aktiviteter."}
              </p>
            </Link>

            <Link
              href={`/${locale}/ideas`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-white/10 dark:bg-[#102640]"
            >
              <Lightbulb
                size={28}
                className="mb-4 text-blue-600 dark:text-blue-400"
              />

              <h3 className="text-lg font-bold">
                {so ? "Fikradaha" : "Idéer & röstning"}
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {so
                  ? "La wadaag fikradahaaga."
                  : "Dela dina idéer med gemenskapen."}
              </p>
            </Link>

          </div>
        </section>
      </div>
    </main>
  );
}