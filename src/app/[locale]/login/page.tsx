import { LoginForm } from "@/components/LoginForm";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!["sv", "so"].includes(locale)) notFound();
  return <LoginForm locale={locale as "sv" | "so"} />;
}
