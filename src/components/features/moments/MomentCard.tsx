"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  X,
} from "lucide-react";

import type { Moment } from "@/lib/content";

type Props = {
  item: Moment;
  somali: boolean;
};

export function MomentCard({ item, somali }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const title = somali ? item.so || item.title : item.title;

  const description = somali
    ? item.description_so || item.description_sv || ""
    : item.description_sv || item.description_so || "";

  const formattedDate = (() => {
    if (!item.date) return "";

    const date = new Date(`${item.date}T12:00:00`);

    if (Number.isNaN(date.getTime())) return item.date;

    return date.toLocaleDateString(somali ? "so-SO" : "sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previousFocus = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
      (triggerRef.current ?? previousFocus)?.focus();
    };
  }, [isOpen]);

  return (
    <>
      {/* MOMENT CARD */}
      <article className="moment-card overflow-hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={
            somali
              ? `Akhri xusuusta: ${title}`
              : `Läs mer om: ${title}`
          }
          className="block w-full cursor-pointer text-left"
        >
          <div
            className="moment-photo"
            role="img"
            aria-label={title}
            style={{
              backgroundImage: item.image
                ? `url("${item.image}")`
                : "linear-gradient(135deg, #0c3c78, #3b82f6)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="moment-bottom">
            <div className="min-w-0 flex-1">
              <h3>{title}</h3>

              <span>
                {formattedDate} · {item.location}
              </span>

              {description && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                  {description}
                </p>
              )}

              <span className="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400">
                {somali ? "Wax badan akhri" : "Läs mer"}
              </span>
            </div>

            <ArrowUpRight size={20} className="shrink-0 text-blue-600" />
          </div>
        </button>
      </article>

      {/* RESPONSIVE MODAL - PORTAL */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`moment-title-${item.id}`}
              className="relative flex max-h-[92dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
            >
              {/* FIXED CLOSE BUTTON */}
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={somali ? "Xir" : "Stäng"}
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 sm:right-5 sm:top-5"
              >
                <X size={20} />
              </button>

              {/* SCROLLABLE AREA */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {/* IMAGE */}
                {item.image && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 sm:h-64">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* CONTENT */}
                <div className="p-5 sm:p-8">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    RAJO Community
                  </span>

                  <h2
                    id={`moment-title-${item.id}`}
                    className="mt-4 break-words text-2xl font-bold leading-tight text-slate-950 dark:text-white sm:text-3xl"
                  >
                    {title}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      {formattedDate}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      {item.location}
                    </span>
                  </div>

                  <div className="my-5 border-t border-slate-200 dark:border-slate-700" />

                  {description ? (
                    <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-base sm:leading-8">
                      {description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {somali
                        ? "Faahfaahin weli lama soo gelin."
                        : "Ingen beskrivning har lagts till ännu."}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {somali ? "Xir" : "Stäng"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}