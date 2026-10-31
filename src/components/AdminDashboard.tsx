"use client";

import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminTabs } from "@/components/admin/AdminTabs";
import ImageUploader from "@/components/admin/ImageUploader";
import { browserDb } from "@/lib/supabase/browser";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
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

type Tab = "activities" | "moments" | "ideas" | "membership_requests";

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
  description_so?: string;
  starts_at?: string;
  location?: string;
  image_url?: string;
  event_date?: string;
  phone?: string | null;
  whatsapp_consent?: boolean;
  created_at?: string;
};

type FormState = {
  title_sv: string;
  title_so: string;
  description_sv: string;
  description_so: string;
  starts_at: string;
  event_date: string;
  category: string;
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
  category: "Community",
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

function whatsappLink(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, "");

  let number: string;

  if (cleaned.startsWith("+")) {
    number = cleaned.slice(1);
  } else if (cleaned.startsWith("00")) {
    number = cleaned.slice(2);
  } else {
    // Nationella nummer behöver en landskod.
    // Vi gissar inte landskod för internationella medlemmar.
    return null;
  }

  if (!/^[1-9]\d{6,14}$/.test(number)) {
    return null;
  }

  return `https://wa.me/${number}`;
}

export function AdminDashboard({ locale }: { locale: Locale }) {
  const so = locale === "so";

  const [tab, setTab] = useState<Tab>("activities");
  const [items, setItems] = useState<Row[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

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
      setError(err instanceof Error ? err.message : "Ett fel uppstod.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  // ==========================================
  // CHANGE TAB
  // ==========================================

  function changeTab(next: Tab) {
    if (imageUploading || saving) return;

    setTab(next);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setItems([]);
  }

  // ==========================================
  // UPDATE FORM
  // ==========================================

  function updateField(name: keyof FormState, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==========================================
  // CREATE ACTIVITY / MOMENT
  // ==========================================

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (tab !== "activities" && tab !== "moments") {
      return;
    }

    if (imageUploading) {
      setError(
        so
          ? "Sug inta sawirka la soo gelinayo."
          : "Vänta tills bilden har laddats upp.",
      );
      return;
    }

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
              category: form.category,
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
            ? "Aktiviteten har publicerats!"
            : "Minnet har sparats!",
      );

      await load(tab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod.");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // APPROVE / REJECT / DELETE
  // ==========================================

  async function action(
    method: "PATCH" | "DELETE",
    id: string,
    status?: string,
  ) {
    if (busy || saving || imageUploading) return;

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/${tab}${
          method === "DELETE" ? `?id=${encodeURIComponent(id)}` : ""
        }`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: method === "PATCH" ? JSON.stringify({ id, status }) : undefined,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Åtgärden misslyckades.");
      }

      setSuccess(so ? "Waa la cusbooneysiiyay." : "Ändringen har sparats.");

      await load(tab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod.");
    } finally {
      setBusy(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function logout() {
    const { error } = await browserDb().auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = `/${locale}/login`;
  }

  // ==========================================
  // TABS
  // ==========================================

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
    <main className='min-h-screen bg-[#f5f8fc] px-4 py-10 text-slate-900 transition-colors dark:bg-[#071426] dark:text-white sm:px-6'>
      <div className='mx-auto max-w-6xl'>
        {/* =====================================
            HEADER
        ===================================== */}

        <div className='mb-10 flex flex-wrap items-start justify-between gap-5'>
          <div>
            <span className='text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400'>
              RAJO COMMUNITY
            </span>

            <h1 className='mt-3 text-3xl font-extrabold sm:text-5xl'>
              {so ? "Maamulka RAJO" : "RAJO Admin"}
            </h1>

            <p className='mt-3 text-slate-600 dark:text-slate-300'>
              {so
                ? "Maamul hawlaha, sawirrada, fikradaha iyo xubnaha."
                : "Hantera aktiviteter, minnen, idéer och medlemsansökningar."}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href={`/${locale}`}
              className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
            >
              <ArrowLeft size={17} />
              {so ? "Bogga hore" : "Till hemsidan"}
            </Link>

            <button
              type='button'
              onClick={logout}
              className='inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
            >
              <LogOut size={17} />
              {so ? "Ka bax" : "Logga ut"}
            </button>
          </div>
        </div>

        {/* =====================================
            ADMIN TABS
        ===================================== */}

        <AdminTabs
          tabs={tabs}
          activeTab={tab}
          onChange={(next) => changeTab(next as Tab)}
        />

        <AdminMessages error={error} success={success} />

        {/* =====================================
            CREATE ACTIVITY / MOMENT
        ===================================== */}

        {(tab === "activities" || tab === "moments") && (
          <section className={`${cardClass} mb-8`}>
            <div className='mb-7 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'>
                <Plus size={24} />
              </div>

              <div>
                <h2 className='text-xl font-bold'>
                  {tab === "activities"
                    ? so
                      ? "Ku dar hawl cusub"
                      : "Skapa ny aktivitet"
                    : so
                      ? "Ku dar xusuus cusub"
                      : "Lägg till nytt minne"}
                </h2>

                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  {tab === "activities"
                    ? so
                      ? "Daabac hawl cusub oo RAJO ah."
                      : "Publicera en kommande aktivitet för RAJO."
                    : so
                      ? "Ku dar xusuus kulan hore."
                      : "Lägg till ett minne från en tidigare aktivitet."}
                </p>
              </div>
            </div>

            <form onSubmit={create} className='space-y-6'>
              {/* TITLES */}

              <div className='grid gap-5 md:grid-cols-2'>
                <label className='block space-y-2'>
                  <span className='text-sm font-semibold'>
                    Titel – svenska *
                  </span>

                  <input
                    required
                    maxLength={120}
                    className={inputClass}
                    placeholder='Exempel: RAJO träff i Göteborg'
                    value={form.title_sv}
                    onChange={(event) =>
                      updateField("title_sv", event.target.value)
                    }
                  />
                </label>

                <label className='block space-y-2'>
                  <span className='text-sm font-semibold'>
                    Cinwaan – Soomaali *
                  </span>

                  <input
                    required
                    maxLength={120}
                    className={inputClass}
                    placeholder='Tusaale: Kulanka RAJO'
                    value={form.title_so}
                    onChange={(event) =>
                      updateField("title_so", event.target.value)
                    }
                  />
                </label>
              </div>

              {/* DESCRIPTIONS */}

              <div className='grid gap-5 md:grid-cols-2'>
                <label className='block space-y-2'>
                  <span className='text-sm font-semibold'>
                    Beskrivning – svenska
                  </span>

                  <textarea
                    rows={4}
                    className={inputClass}
                    placeholder='Berätta vad aktiviteten handlar om...'
                    value={form.description_sv}
                    onChange={(event) =>
                      updateField("description_sv", event.target.value)
                    }
                  />
                </label>

                <label className='block space-y-2'>
                  <span className='text-sm font-semibold'>
                    Faahfaahin – Soomaali
                  </span>

                  <textarea
                    rows={4}
                    className={inputClass}
                    placeholder='Sharax hawsha...'
                    value={form.description_so}
                    onChange={(event) =>
                      updateField("description_so", event.target.value)
                    }
                  />
                </label>
              </div>

              {/* LOCATION */}

              <label className='block space-y-2'>
                <span className='flex items-center gap-2 text-sm font-semibold'>
                  <MapPin size={17} />
                  {so ? "Goobta" : "Plats"}
                </span>

                <input
                  className={inputClass}
                  placeholder='Göteborg eller Online'
                  value={form.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                />
              </label>

              {/* =====================================
                  IMAGE UPLOAD
              ===================================== */}

        <ImageUploader
  locale={locale}
  folder={tab === "moments" ? "moments" : "activities"}
  value={form.image_url}
  onChangeAction={(url) => updateField("image_url", url)}
  onUploadingChangeAction={setImageUploading}
/>

              {/* DATE */}

              {tab === "activities" ? (
                <label className='block space-y-2'>
                  <span className='flex items-center gap-2 text-sm font-semibold'>
                    <CalendarDays size={17} />
                    {so ? "Taariikh iyo waqti" : "Datum och tid *"}
                  </span>

                  <input
                    type='datetime-local'
                    required
                    className={inputClass}
                    value={form.starts_at}
                    onChange={(event) =>
                      updateField("starts_at", event.target.value)
                    }
                  />
                </label>
              ) : (
                <label className='block space-y-2'>
                  <span className='flex items-center gap-2 text-sm font-semibold'>
                    <CalendarDays size={17} />
                    {so ? "Taariikh" : "Datum *"}
                  </span>

                  <input
                    type='date'
                    required
                    className={inputClass}
                    value={form.event_date}
                    onChange={(event) =>
                      updateField("event_date", event.target.value)
                    }
                  />
                </label>
              )}

              {tab === "moments" && (
                <label className='block space-y-2'>
                  <span className='text-sm font-semibold'>
                    {so ? "Qaybta" : "Kategori"}
                  </span>
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                  >
                    <option>Community</option>
                    <option>Meetups</option>
                    <option>Activities</option>
                    <option>RAJO Sisters</option>
                    <option>Workshops</option>
                  </select>
                </label>
              )}

              {/* SUBMIT BUTTONS */}

              <div className='flex flex-wrap items-center gap-4 pt-2'>
                <button
                  type='submit'
                  disabled={saving || imageUploading}
                  className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {saving || imageUploading ? (
                    <Loader2 size={18} className='animate-spin' />
                  ) : (
                    <Save size={18} />
                  )}

                  {imageUploading
                    ? so
                      ? "Sawirka waa la soo gelinayaa..."
                      : "Laddar upp bild..."
                    : saving
                      ? so
                        ? "Waa la kaydinayaa..."
                        : "Sparar..."
                      : tab === "activities"
                        ? so
                          ? "Daabac hawsha"
                          : "Publicera aktivitet"
                        : so
                          ? "Kaydi xusuusta"
                          : "Spara minne"}
                </button>

                <button
                  type='button'
                  disabled={saving || imageUploading}
                  onClick={() => setForm(emptyForm)}
                  className='rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/10'
                >
                  {so ? "Nadiifi" : "Rensa"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =====================================
            SAVED ITEMS
        ===================================== */}

        <section className={cardClass}>
          <div className='mb-6 flex items-center justify-between gap-4'>
            <div>
              <h2 className='text-xl font-bold'>
                {tab === "activities"
                  ? so
                    ? "Hawlaha la daabacay"
                    : "Publicerade aktiviteter"
                  : tab === "moments"
                    ? so
                      ? "Xusuusaha"
                      : "Sparade minnen"
                    : tab === "ideas"
                      ? so
                        ? "Fikradaha"
                        : "Inskickade idéer"
                      : so
                        ? "Codsiyada xubnaha"
                        : "Medlemsansökningar"}
              </h2>

              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                {busy
                  ? so
                    ? "Waa la soo rarayaa..."
                    : "Laddar..."
                  : `${items.length} ${so ? "qoraal" : "poster"}`}
              </p>
            </div>

            <button
              type='button'
              onClick={() => void load(tab)}
              disabled={busy}
              aria-label={so ? "Cusboonaysii" : "Uppdatera"}
              className='rounded-xl bg-slate-100 p-3 text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white'
            >
              <RefreshCw size={18} className={busy ? "animate-spin" : ""} />
            </button>
          </div>

          <div className='space-y-4'>
            {!busy && items.length === 0 && (
              <p className='py-10 text-center text-slate-500 dark:text-slate-400'>
                {so ? "Weli wax xog ah ma jiraan." : "Inga poster ännu."}
              </p>
            )}

            {items.map((item) => {
              const waUrl =
                item.phone && item.whatsapp_consent
                  ? whatsappLink(item.phone)
                  : null;

              return (
                <article
                  key={item.id}
                  className='flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 dark:border-white/10 dark:hover:border-blue-400/30 sm:flex-row sm:items-center'
                >
                  {/* IMAGE */}

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=''
                      className='h-24 w-full rounded-xl object-cover sm:w-28'
                    />
                  )}

                  {/* CONTENT */}

                  <div className='min-w-0 flex-1'>
                    <h3 className='font-bold'>
                      {locale === "so"
                        ? item.title_so ||
                          item.title_sv ||
                          item.title ||
                          item.full_name ||
                          item.id
                        : item.title_sv ||
                          item.title ||
                          item.full_name ||
                          item.id}
                    </h3>

                    {item.description_sv && (
                      <p className='mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400'>
                        {so
                          ? item.description_so || item.description_sv
                          : item.description_sv}
                      </p>
                    )}

                    {item.starts_at && (
                      <p className='mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                        <Clock3 size={15} />

                        {new Date(item.starts_at).toLocaleString(
                          locale === "so" ? "so-SO" : "sv-SE",
                        )}
                      </p>
                    )}

                    {item.event_date && (
                      <p className='mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                        <CalendarDays size={15} />
                        {item.event_date}
                      </p>
                    )}

                    {item.location && (
                      <p className='mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                        <MapPin size={15} />
                        {item.location}
                      </p>
                    )}

                    {item.status && (
                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : item.status === "rejected"
                              ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        {item.status === "approved"
                          ? so
                            ? "La aqbalay"
                            : "Godkänd"
                          : item.status === "rejected"
                            ? so
                              ? "La diiday"
                              : "Avslagen"
                            : so
                              ? "Sugaya"
                              : "Väntar"}
                      </span>
                    )}

                    {/* MEMBERSHIP DETAILS */}

                    {tab === "membership_requests" && (
                      <div className='mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300'>
                        {item.interest && (
                          <p>
                            <strong>{so ? "Xiisaha:" : "Intresse:"}</strong>{" "}
                            {item.interest}
                          </p>
                        )}

                        {item.phone && (
                          <p className='flex items-center gap-2'>
                            <Phone size={15} />

                            <span>{item.phone}</span>
                          </p>
                        )}

                        {waUrl && (
                          <a
                            href={waUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700'
                          >
                            <MessageCircle size={16} />
                            {so
                              ? "Kala xiriir WhatsApp"
                              : "Kontakta via WhatsApp"}
                            <ExternalLink size={14} />
                          </a>
                        )}

                        {!item.whatsapp_consent && (
                          <p className='text-xs text-slate-400'>
                            {so
                              ? "Oggolaansho WhatsApp lama bixin."
                              : "Inget WhatsApp-samtycke."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className='flex shrink-0 gap-2'>
                    {(tab === "ideas" || tab === "membership_requests") &&
                      item.status === "pending" && (
                        <>
                          <button
                            type='button'
                            disabled={busy || saving}
                            title={so ? "Aqbal" : "Godkänn"}
                            aria-label={so ? "Aqbal" : "Godkänn"}
                            onClick={() =>
                              void action("PATCH", item.id, "approved")
                            }
                            className='rounded-xl bg-emerald-50 p-3 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400'
                          >
                            <Check size={19} />
                          </button>

                          <button
                            type='button'
                            disabled={busy || saving}
                            title={so ? "Diid" : "Avslå"}
                            aria-label={so ? "Diid" : "Avslå"}
                            onClick={() =>
                              void action("PATCH", item.id, "rejected")
                            }
                            className='rounded-xl bg-amber-50 p-3 text-amber-600 transition hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-500/10 dark:text-amber-400'
                          >
                            <X size={19} />
                          </button>
                        </>
                      )}

                    <button
                      type='button'
                      disabled={busy || saving}
                      title={so ? "Tirtir" : "Radera"}
                      aria-label={so ? "Tirtir" : "Radera"}
                      onClick={() => {
                        if (
                          window.confirm(
                            so
                              ? "Ma hubtaa inaad tirtirayso?"
                              : "Vill du verkligen radera posten?",
                          )
                        ) {
                          void action("DELETE", item.id);
                        }
                      }}
                      className='rounded-xl bg-red-50 p-3 text-red-500 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400'
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
