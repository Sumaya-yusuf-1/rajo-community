"use client";

import { browserDb } from "@/lib/supabase/browser";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Locale = "sv" | "so";

type Tab =
  | "activities"
  | "moments"
  | "ideas"
  | "membership_requests";

type Row = {
  id: string;
  title?: string;
  title_sv?: string;
  title_so?: string;
  full_name?: string;
  status?: string;
  interest?: string;
  description?: string;
  description_sv?: string;
  starts_at?: string;
  location?: string;
  image_url?: string;
  event_date?: string;
  phone?: string | null;
  whatsapp_consent?: boolean;
};

type FormState = {
  title_sv: string;
  title_so: string;
  description_sv: string;
  description_so: string;
  starts_at: string;
  event_date: string;
  location: string;
  image_url: string;
};

const emptyForm: FormState = {
  title_sv: "",
  title_so: "",
  description_sv: "",
  description_so: "",
  starts_at: "",
  event_date: "",
  location: "",
  image_url: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm text-slate-900 outline-none transition " +
  "placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 " +
  "focus:ring-blue-500/15 dark:border-white/10 " +
  "dark:bg-[#162e4e] dark:text-white dark:placeholder:text-slate-400";

const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm " +
  "dark:border-white/10 dark:bg-[#102640]";

export function AdminDashboard({ locale }: { locale: Locale }) {
  const so = locale === "so";

  const [tab, setTab] = useState<Tab>("activities");
  const [items, setItems] = useState<Row[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async (which: Tab) => {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/${which}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kunde inte hämta information.");
      }

      setItems(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ett fel uppstod."
      );
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  function changeTab(next: Tab) {
    setTab(next);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setItems([]);
  }

  function updateField(
    name: keyof FormState,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (tab !== "activities" && tab !== "moments") return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload =
        tab === "activities"
          ? {
              title_sv: form.title_sv.trim(),
              title_so: form.title_so.trim(),
              description_sv: form.description_sv.trim(),
              description_so: form.description_so.trim(),
              location: form.location.trim(),
              image_url: form.image_url.trim() || null,
              starts_at: new Date(form.starts_at).toISOString(),
            }
          : {
              title_sv: form.title_sv.trim(),
              title_so: form.title_so.trim(),
              description_sv: form.description_sv.trim(),
              description_so: form.description_so.trim(),
              location: form.location.trim(),
              image_url: form.image_url.trim() || null,
              event_date: form.event_date,
              photo_consent_confirmed: true,
            };

      const response = await fetch(`/api/admin/${tab}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kunde inte spara.");
      }

      setForm(emptyForm);

      setSuccess(
        so
          ? "Si guul leh ayaa loo kaydiyay!"
          : tab === "activities"
            ? "Aktiviteten har sparats!"
            : "Minnet har sparats!"
      );

      await load(tab);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ett fel uppstod."
      );
    } finally {
      setSaving(false);
    }
  }

  async function action(
    method: "PATCH" | "DELETE",
    id: string,
    status?: string
  ) {
    if (busy || saving) return;

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/${tab}${
          method === "DELETE"
            ? `?id=${encodeURIComponent(id)}`
            : ""
        }`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body:
            method === "PATCH"
              ? JSON.stringify({ id, status })
              : undefined,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Åtgärden misslyckades.");
      }

      setSuccess(
        so ? "Waa la cusbooneysiiyay." : "Ändringen har sparats."
      );

      await load(tab);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ett fel uppstod."
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const { error } = await browserDb().auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = `/${locale}/login`;
  }

  const tabs = [
    {
      id: "activities" as Tab,
      label: so ? "Hawlaha" : "Aktiviteter",
      icon: CalendarDays,
    },
    {
      id: "moments" as Tab,
      label: so ? "Xusuusaha" : "Minnen",
      icon: ImageIcon,
    },
    {
      id: "ideas" as Tab,
      label: so ? "Fikradaha" : "Idéer",
      icon: Lightbulb,
    },
    {
      id: "membership_requests" as Tab,
      label: so ? "Codsiyada" : "Medlemsansökningar",
      icon: Users,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-4 py-10 text-slate-900 transition-colors dark:bg-[#071426] dark:text-white sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              RAJO COMMUNITY
            </span>

            <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
              {so ? "Maamulka RAJO" : "RAJO Admin"}
            </h1>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {so
                ? "Maamul hawlaha, sawirrada iyo xubnaha."
                : "Hantera aktiviteter, minnen, idéer och medlemsansökningar."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              <ArrowLeft size={17} />
              {so ? "Bogga hore" : "Till hemsidan"}
            </Link>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            >
              <LogOut size={17} />
              {so ? "Ka bax" : "Logga ut"}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => changeTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                tab === id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-white/10 dark:bg-[#102640] dark:text-slate-200"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {/* MESSAGES */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Check size={18} />
            {success}
          </div>
        )}

        {/* CREATE ACTIVITY OR MOMENT */}
        {(tab === "activities" || tab === "moments") && (
          <section className={`${cardClass} mb-8`}>
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <Plus size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {tab === "activities"
                    ? so
                      ? "Ku dar hawl cusub"
                      : "Skapa ny aktivitet"
                    : so
                      ? "Ku dar xusuus cusub"
                      : "Lägg till nytt minne"}
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tab === "activities"
                    ? "Publicera en kommande aktivitet för RAJO."
                    : "Lägg till ett minne från en tidigare aktivitet."}
                </p>
              </div>
            </div>

            <form onSubmit={create} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold">
                    Titel – svenska *
                  </span>

                  <input
                    required
                    maxLength={120}
                    className={inputClass}
                    placeholder="Exempel: RAJO träff i Göteborg"
                    value={form.title_sv}
                    onChange={(e) =>
                      updateField("title_sv", e.target.value)
                    }
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold">
                    Cinwaan – Soomaali *
                  </span>

                  <input
                    required
                    maxLength={120}
                    className={inputClass}
                    placeholder="Tusaale: Kulanka RAJO"
                    value={form.title_so}
                    onChange={(e) =>
                      updateField("title_so", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold">
                    Beskrivning – svenska
                  </span>

                  <textarea
                    rows={4}
                    className={inputClass}
                    placeholder="Berätta vad aktiviteten handlar om..."
                    value={form.description_sv}
                    onChange={(e) =>
                      updateField("description_sv", e.target.value)
                    }
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold">
                    Faahfaahin – Soomaali
                  </span>

                  <textarea
                    rows={4}
                    className={inputClass}
                    placeholder="Sharax hawsha..."
                    value={form.description_so}
                    onChange={(e) =>
                      updateField("description_so", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin size={16} />
                    Plats
                  </span>

                  <input
                    className={inputClass}
                    placeholder="Göteborg eller Online"
                    value={form.location}
                    onChange={(e) =>
                      updateField("location", e.target.value)
                    }
                  />
                </label>

                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <ImageIcon size={16} />
                    Bildlänk
                  </span>

                  <input
                    type="url"
                    className={inputClass}
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) =>
                      updateField("image_url", e.target.value)
                    }
                  />
                </label>
              </div>

              {tab === "activities" ? (
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays size={17} />
                    Datum och tid *
                  </span>

                  <input
                    type="datetime-local"
                    required
                    className={inputClass}
                    value={form.starts_at}
                    onChange={(e) =>
                      updateField("starts_at", e.target.value)
                    }
                  />
                </label>
              ) : (
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays size={17} />
                    Datum *
                  </span>

                  <input
                    type="date"
                    required
                    className={inputClass}
                    value={form.event_date}
                    onChange={(e) =>
                      updateField("event_date", e.target.value)
                    }
                  />
                </label>
              )}

              {form.image_url && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                  <img
                    src={form.image_url}
                    alt="Förhandsvisning"
                    className="h-52 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Sparar..."
                    : tab === "activities"
                      ? "Publicera aktivitet"
                      : "Spara minne"}
                </button>

                <button
                  type="button"
                  onClick={() => setForm(emptyForm)}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Rensa
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SAVED ITEMS */}
        <section className={cardClass}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                {tab === "activities"
                  ? "Publicerade aktiviteter"
                  : tab === "moments"
                    ? "Sparade minnen"
                    : tab === "ideas"
                      ? "Inskickade idéer"
                      : "Medlemsansökningar"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {busy ? "Laddar..." : `${items.length} poster`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load(tab)}
              disabled={busy}
              aria-label="Uppdatera"
              className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white"
            >
              <RefreshCw
                size={18}
                className={busy ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="space-y-4">
            {!busy && items.length === 0 && (
              <p className="py-10 text-center text-slate-500 dark:text-slate-400">
                Inga poster ännu.
              </p>
            )}

            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-24 w-full rounded-xl object-cover sm:w-28"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">
                    {item.title_sv ||
                      item.title ||
                      item.full_name ||
                      "Utan titel"}
                  </h3>

                  {item.starts_at && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock3 size={15} />
                      {new Date(item.starts_at).toLocaleString("sv-SE")}
                    </p>
                  )}

                  {item.location && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin size={15} />
                      {item.location}
                    </p>
                  )}

                  {item.status && (
                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      {item.status}
                    </span>
                  )}

                  {tab === "membership_requests" && (
                    <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      {item.interest && <p>{item.interest}</p>}
                      {item.phone && <p>Telefon: {item.phone}</p>}

                      {item.phone && item.whatsapp_consent && (
                        <a
                          href={`https://wa.me/${item.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex font-semibold text-green-600 underline dark:text-green-400"
                        >
                          Kontakta via WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {(tab === "ideas" ||
                    tab === "membership_requests") &&
                    item.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          title="Godkänn"
                          onClick={() =>
                            void action("PATCH", item.id, "approved")
                          }
                          className="rounded-xl bg-emerald-50 p-3 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10"
                        >
                          <Check size={19} />
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          title="Avslå"
                          onClick={() =>
                            void action("PATCH", item.id, "rejected")
                          }
                          className="rounded-xl bg-amber-50 p-3 text-amber-600 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-500/10"
                        >
                          <X size={19} />
                        </button>
                      </>
                    )}

                  <button
                    type="button"
                    disabled={busy}
                    title="Radera"
                    onClick={() => {
                      if (window.confirm("Vill du radera posten?")) {
                        void action("DELETE", item.id);
                      }
                    }}
                    className="rounded-xl bg-red-50 p-3 text-red-500 hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10"
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}