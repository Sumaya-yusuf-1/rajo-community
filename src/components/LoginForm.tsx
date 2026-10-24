"use client";

import { browserDb } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Locale = "sv" | "so";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const so = locale === "so";

  const [register, setRegister] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [adult, setAdult] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [busy, setBusy] = useState(false);

  const t = {
    back: so ? "Ku noqo bogga hore" : "Tillbaka till startsidan",

    welcome: so
      ? "Ku soo dhawoow RAJO"
      : "Välkommen till RAJO",

    login: so ? "Soo gal" : "Logga in",

    signup: so ? "Samee koonto" : "Skapa konto",

    loginDesc: so
      ? "Soo gal si aad uga qaybqaadato hawlaha bulshada."
      : "Logga in för att delta i aktiviteter och rösta på idéer.",

    signupDesc: so
      ? "Ku biir RAJO Community oo qayb ka noqo bulshadeenna."
      : "Bli en del av RAJO Community och vår gemenskap.",

    fullName: so ? "Magaca oo buuxa" : "Fullständigt namn",

    namePlaceholder: so
      ? "Geli magacaaga oo buuxa"
      : "Ange ditt fullständiga namn",

    email: so ? "Iimayl" : "E-postadress",

    password: so ? "Furaha sirta" : "Lösenord",

    passwordHint: so
      ? "Ugu yaraan 8 xaraf"
      : "Minst 8 tecken",

    adult: so
      ? "Waxaan xaqiijinayaa inaan jiro ugu yaraan 18 sano."
      : "Jag bekräftar att jag är minst 18 år.",

    termsStart: so ? "Waxaan aqbalayaa" : "Jag godkänner",

    terms: so
      ? "Shuruudaha isticmaalka"
      : "användarvillkoren",

    and: so ? "iyo" : "och",

    privacy: so
      ? "Siyaasadda asturnaanta"
      : "integritetspolicyn",

    noAccount: so
      ? "Koonto ma lihid?"
      : "Har du inget konto?",

    hasAccount: so
      ? "Koonto ma leedahay?"
      : "Har du redan ett konto?",

    createAccount: so
      ? "Is diiwaangeli"
      : "Registrera dig",

    signingIn: so
      ? "Waa lagu gelinayaa..."
      : "Loggar in...",

    registering: so
      ? "Waa lagu diiwaangelinayaa..."
      : "Registrerar...",

    adultError: so
      ? "Waa inaad jirtaa ugu yaraan 18 sano."
      : "Du måste vara minst 18 år.",

    termsError: so
      ? "Waa inaad aqbashaa shuruudaha."
      : "Du måste godkänna användarvillkoren.",

    nameError: so
      ? "Fadlan geli magacaaga oo buuxa."
      : "Ange ditt fullständiga namn.",

    emailConfirm: so
      ? "Koontadaada waa la sameeyay! Hubi iimaylkaaga oo guji xiriirka xaqiijinta. Kadib ku soo noqo RAJO oo soo gal."
      : "Ditt konto har registrerats! Kontrollera din e-post och klicka på bekräftelselänken. Gå sedan tillbaka till RAJO och logga in.",

    registered: so
      ? "Koontadaada waa la sameeyay!"
      : "Ditt konto har skapats!",

    unexpectedError: so
      ? "Waxbaa khaldamay. Isku day mar kale."
      : "Något gick fel. Försök igen.",

    alreadyLoggedIn: so
      ? "Waxaa lagu geynayaa boggaaga."
      : "Du skickas till din medlemsprofil.",

    trust: so
      ? "RAJO Community — Bulsho ammaan ah oo ixtiraam leh."
      : "RAJO Community — En trygg och respektfull gemenskap.",
  };

  function showError(text: string) {
    setMessageType("error");
    setMessage(text);
  }

  function showSuccess(text: string) {
    setMessageType("success");
    setMessage(text);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (register) {
      if (fullName.trim().length < 2) {
        showError(t.nameError);
        return;
      }

      if (!adult) {
        showError(t.adultError);
        return;
      }

      if (!termsAccepted) {
        showError(t.termsError);
        return;
      }
    }

    setBusy(true);

    try {
      const supabase = browserDb();

      if (register) {
        // 1. Registrera användaren i Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,

          options: {
            // Namnet sparas i Auth metadata.
            // Databas-triggern kopierar det till profiles.
            data: {
              full_name: fullName.trim(),
            },

            // Användaren kommer tillbaka hit efter mejlbekräftelsen.
            emailRedirectTo: `${window.location.origin}/${locale}/login`,
          },
        });

        if (error) throw error;

        // 2. Om Supabase kräver e-postbekräftelse
        // finns normalt ingen aktiv session ännu.
        if (!data.session) {
          showSuccess(t.emailConfirm);

          setPassword("");
          setAdult(false);
          setTermsAccepted(false);

          return;
        }

        // 3. Om e-postbekräftelse är avstängd.
        // Vi rekommenderar att Confirm Email är aktiverat.
        showSuccess(t.registered);

        router.replace(`/${locale}/member`);
        router.refresh();
      } else {
        // 4. Logga in med e-post och lösenord.
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

        if (error) throw error;

        if (!data.user || !data.session) {
          throw new Error(t.unexpectedError);
        }

        showSuccess(t.alreadyLoggedIn);

        // 5. Skicka medlemmen till sin personliga profil.
        router.replace(`/${locale}`);
router.refresh();
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : t.unexpectedError
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleForm() {
    setRegister((prev) => !prev);

    setMessage("");
    setPassword("");
    setShowPassword(false);
    setAdult(false);
    setTermsAccepted(false);
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 text-slate-900 transition-colors duration-300 dark:bg-[#050d1b] dark:text-white sm:px-6">

      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[450px] w-[450px] animate-pulse rounded-full bg-blue-500/15 blur-[100px] dark:bg-blue-600/20" />

        <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] animate-pulse rounded-full bg-cyan-400/15 blur-[100px] dark:bg-cyan-500/10" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[120px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">

        {/* Back to home */}
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={17} />

          {t.back}
        </Link>

        {/* Main card */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-7 shadow-2xl shadow-slate-300/30 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#102341]/90 dark:shadow-black/30 sm:p-10">

          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400">
              <Users size={31} strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
              RAJO COMMUNITY
            </p>

            <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {register ? t.signup : t.welcome}
            </h1>

            <p className="mx-auto max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-300">
              {register ? t.signupDesc : t.loginDesc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">

            {/* Full name – only during registration */}
            {register && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  {t.fullName}
                </label>

                <div className="relative">

                  <UserRound
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />

                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    disabled={busy}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                {t.email}
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                {t.password}
              </label>

              <div className="relative">

                <LockKeyhole
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    register ? "new-password" : "current-password"
                  }
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordHint}
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                />

                {/* Show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? so
                        ? "Qari furaha sirta"
                        : "Dölj lösenord"
                      : so
                        ? "Muuji furaha sirta"
                        : "Visa lösenord"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Registration confirmation */}
            {register && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">

                {/* Age confirmation */}
                <label className="flex cursor-pointer items-start gap-3">

                  <input
                    type="checkbox"
                    checked={adult}
                    onChange={(e) => setAdult(e.target.checked)}
                    disabled={busy}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                  />

                  <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {t.adult}
                  </span>
                </label>

                {/* Terms confirmation */}
                <label className="flex cursor-pointer items-start gap-3">

                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) =>
                      setTermsAccepted(e.target.checked)
                    }
                    disabled={busy}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                  />

                  <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {t.termsStart}{" "}

                    <Link
                      href={`/${locale}/terms`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t.terms}
                    </Link>{" "}

                    {t.and}{" "}

                    <Link
                      href={`/${locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t.privacy}
                    </Link>
                    .
                  </span>
                </label>
              </div>
            )}

            {/* Status message */}
            {message && (
              <div
                role={messageType === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                )}

                <span>{message}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {busy ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  {register ? t.registering : t.signingIn}
                </>
              ) : (
                <>
                  {register ? t.createAccount : t.login}

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Switch login/register */}
          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-white/10">
            <p className="text-sm text-slate-600 dark:text-slate-400">

              {register ? t.hasAccount : t.noAccount}{" "}

              <button
                type="button"
                disabled={busy}
                onClick={toggleForm}
                className="font-bold text-blue-600 transition-colors hover:text-blue-500 disabled:opacity-60 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {register ? t.login : t.createAccount}
              </button>
            </p>
          </div>
        </section>

        {/* Bottom text */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck size={15} className="text-blue-500" />

          <span>{t.trust}</span>
        </div>
      </div>
    </main>
  );
}