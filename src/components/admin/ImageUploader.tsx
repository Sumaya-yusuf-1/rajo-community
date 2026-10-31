"use client";

import { browserDb } from "@/lib/supabase/browser";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  locale: "sv" | "so";
  value: string;
  onChangeAction: (url: string) => void;
  folder?: "activities" | "moments";
  onUploadingChangeAction?: (uploading: boolean) => void;
};

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ImageUploader({
  locale,
  value,
  onChangeAction,
  folder = "activities",
  onUploadingChangeAction,
}: Props) {
  const so = locale === "so";

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function uploadImage(file: File) {
    if (uploading) return;

    setError("");
    setSuccess("");

    // Kontrollera filtyp
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        so
          ? "Dooro sawir JPG, PNG ama WebP ah."
          : "Välj en JPG-, PNG- eller WebP-bild."
      );
      return;
    }

    // Kontrollera filstorlek
    if (file.size > MAX_SIZE) {
      setError(
        so
          ? "Sawirku waa inuu ka yaraadaa 5 MB."
          : "Bilden får vara högst 5 MB."
      );
      return;
    }

    // Meddela AdminDashboard att uppladdningen börjar
    setUploading(true);
    onUploadingChangeAction?.(true);

    try {
      const supabase = browserDb();

      // Kontrollera inloggning
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          so
            ? "Waa inaad soo gashaa si aad sawir u geliso."
            : "Du måste vara inloggad för att ladda upp bilder."
        );
      }

      // Bestäm filändelse
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      // Skapa ett unikt filnamn
      const fileName = `${crypto.randomUUID()}.${extension}`;

      // Separata mappar för aktiviteter och minnen
      const filePath = `${folder}/${fileName}`;

      // Ladda upp bilden till Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("rajo-images")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Hämta bildens publika URL
      const { data } = supabase.storage
        .from("rajo-images")
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error(
          so
            ? "Lama helin cinwaanka sawirka."
            : "Kunde inte hämta bildens URL."
        );
      }

      // Skicka bildens URL till AdminDashboard
      onChangeAction(data.publicUrl);

      setSuccess(
        so
          ? "Sawirka si guul leh ayaa loo soo geliyay!"
          : "Bilden har laddats upp!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : so
            ? "Sawirka lama soo gelin karin."
            : "Kunde inte ladda upp bilden."
      );
    } finally {
      // Meddela AdminDashboard att uppladdningen är klar
      setUploading(false);
      onUploadingChangeAction?.(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    void uploadImage(file);

    // Tillåt att samma bild väljs igen
    event.target.value = "";
  }

  function removeImage() {
    if (uploading) return;

    // Tar bort bilden från formuläret,
    // men raderar inte filen från Supabase Storage.
    onChangeAction("");

    setError("");
    setSuccess("");
  }

  return (
    <div className="space-y-4">
      {/* RUBRIK */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-white">
          {folder === "moments"
            ? so
              ? "Sawirka xusuusta"
              : "Bild för minnet"
            : so
              ? "Sawirka hawsha"
              : "Aktivitetsbild"}
        </label>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {so
            ? "JPG, PNG ama WebP. Ugu badnaan 5 MB."
            : "JPG, PNG eller WebP. Max 5 MB."}
        </p>
      </div>

      {/* FILVÄLJARE */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        disabled={uploading}
        aria-label={
          so ? "Dooro sawir" : "Välj bild från datorn"
        }
      />

      {/* UPPLADDNINGSRUTA */}
      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="
            group flex min-h-52 w-full flex-col items-center
            justify-center rounded-2xl border-2 border-dashed
            border-blue-300 bg-blue-50/60 p-6 text-center
            transition hover:border-blue-500 hover:bg-blue-50
            disabled:cursor-not-allowed disabled:opacity-60
            dark:border-blue-400/30 dark:bg-blue-500/5
            dark:hover:bg-blue-500/10
          "
        >
          <div
            className="
              mb-4 flex h-14 w-14 items-center justify-center
              rounded-2xl bg-blue-100 text-blue-600
              transition group-hover:scale-110
              dark:bg-blue-500/15 dark:text-blue-300
            "
          >
            {uploading ? (
              <Loader2 size={27} className="animate-spin" />
            ) : (
              <UploadCloud size={27} />
            )}
          </div>

          <span className="font-bold text-slate-900 dark:text-white">
            {uploading
              ? so
                ? "Sawirka waa la soo gelinayaa..."
                : "Laddar upp bilden..."
              : so
                ? "Guji si aad sawir u doorato"
                : "Klicka för att välja en bild"}
          </span>

          <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {so
              ? "Ka dooro kombiyuutarkaaga"
              : "Välj en bild från din dator"}
          </span>
        </button>
      ) : (
        /* FÖRHANDSVISNING */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#162e4e]">
          <div className="relative">
            <img
              src={value}
              alt={
                so
                  ? "Sawir horudhac ah"
                  : "Förhandsvisning av uppladdad bild"
              }
              className="h-64 w-full object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  {so
                    ? "Waa la soo gelinayaa..."
                    : "Laddar upp..."}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
              {so
                ? "Sawir diyaar ah"
                : "Bilden är redo"}
            </span>

            <div className="flex gap-2">
              {/* BYT BILD */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-blue-50 px-4 py-2 text-sm font-semibold
                  text-blue-700 transition hover:bg-blue-100
                  disabled:opacity-50 dark:bg-blue-500/10
                  dark:text-blue-300
                "
              >
                <ImagePlus size={16} />
                {so ? "Beddel" : "Byt bild"}
              </button>

              {/* TA BORT BILD */}
              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-red-50 px-4 py-2 text-sm font-semibold
                  text-red-600 transition hover:bg-red-100
                  disabled:opacity-50 dark:bg-red-500/10
                  dark:text-red-300
                "
              >
                <Trash2 size={16} />
                {so ? "Ka saar" : "Ta bort"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LYCKAD UPPLADDNING */}
      {success && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 size={17} />
          {success}
        </p>
      )}

      {/* FELMEDDELANDE */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}