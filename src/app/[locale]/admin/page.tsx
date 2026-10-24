import { AdminDashboard } from "@/components/AdminDashboard";
import { currentUser } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Locale = "sv" | "so";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "sv" && locale !== "so") {
    notFound();
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Supabase är inte konfigurerat.
      </main>
    );
  }

  const { supabase, user } = await currentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-6 text-slate-900 dark:bg-[#071426] dark:text-white">
        <h1 className="text-4xl font-bold">403</h1>

        <p className="text-center">
          {locale === "so"
            ? "Ma lihid oggolaansho maamulka."
            : "Du har inte behörighet till adminpanelen."}
        </p>

        <a
          href={`/${locale}`}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          {locale === "so" ? "Bogga hore" : "Tillbaka till startsidan"}
        </a>
      </main>
    );
  }

  return <AdminDashboard locale={locale as Locale} />;
}