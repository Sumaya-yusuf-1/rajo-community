import { notFound, redirect } from "next/navigation";

import MemberProfile from "@/components/MemberProfile";
import { currentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Locale = "sv" | "so";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "sv" && locale !== "so") {
    notFound();
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect(`/${locale}/login`);
  }

  const { user } = await currentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <MemberProfile locale={locale as Locale} />;
}
