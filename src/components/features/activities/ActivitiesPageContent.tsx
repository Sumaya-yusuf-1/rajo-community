"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { photos } from "@/lib/content";
import { browserDb } from "@/lib/supabase/browser";

import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { RajoTalkSection } from "@/components/features/rajo-talk/RajoTalkSection";

import { EventCard, type Activity } from "./EventCard";

type Props = {
  translateAction: (swedish: string, somali: string) => string;
  navigateAction: (page: string) => void;
  locale: "sv" | "so";
};

export function ActivitiesPageContent({
  translateAction,
  navigateAction,
  locale,
}: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const somali = locale === "so";

  // FETCH UPCOMING ACTIVITIES
  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setError("");

      try {
        const supabase = browserDb();

        const { data, error: fetchError } = await supabase
          .from("activities")
          .select(
            "id, title_sv, title_so, description_sv, description_so, starts_at, location, image_url",
          )
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true });

        if (!active) return;

        if (fetchError) {
          throw fetchError;
        }

        setActivities((data ?? []) as Activity[]);
      } catch (fetchError) {
        if (!active) return;

        console.error("Unable to load RAJO activities:", fetchError);

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load activities",
        );

        setActivities([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadActivities();

    return () => {
      active = false;
    };
  }, []);

  // RAJO Talk already has its own event information and voting system.
  // Avoid showing the same event twice if it also exists in "activities".
  const otherActivities = activities.filter((event) => {
    const titleSv = event.title_sv?.toLowerCase() ?? "";
    const titleSo = event.title_so?.toLowerCase() ?? "";

    return (
      !titleSv.includes("rajo talk") &&
      !titleSo.includes("rajo talk")
    );
  });

  return (
    <>
      {/* PAGE HERO */}
      <PageHero
        tag={translateAction(
          "LET’S GET TOGETHER",
          "AAN ISU IMAANNO",
        )}
        title={translateAction(
          "Good people. Great moments.",
          "Dad wanaagsan. Waqtiyo qurux badan.",
        )}
        description={translateAction(
          "From online hangouts to real-world gatherings, find your next moment with RAJO.",
          "Kulamada internetka iyo kuwa fool-ka-foolka ah, ka hel kulankaaga xiga RAJO.",
        )}
        image={photos.girls}
      />

      {/* UPCOMING ACTIVITIES */}
      <section className="section container">
        <SectionHeading
          eyebrow={translateAction(
            "WHAT’S NEXT",
            "MAXAA SOO SOCDA",
          )}
          title={translateAction(
            "Upcoming activities",
            "Hawlaha soo socda",
          )}
          subtitle={translateAction(
            "Discover an event, meet someone new and feel part of something bigger.",
            "Hel kulan cusub, la kulan dad cusub oo ka mid noqo bulshada.",
          )}
        />

        {/* FEATURED ACTIVITY: RAJO TALK */}
        <div
          id="rajo-talk"
          className="mt-10 w-full min-w-0 scroll-mt-24"
          aria-label="RAJO Talk"
        >
          <RajoTalkSection locale={locale} />
        </div>

        {/* OTHER UPCOMING ACTIVITIES */}
        {loading ? (
          <div className="py-8 text-center" role="status">
            <p className="muted">
              {translateAction(
                "Laddar övriga aktiviteter...",
                "Hawlaha kale waa la soo rarayaa...",
              )}
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            <p>
              {translateAction(
                "Kunde inte hämta övriga aktiviteter.",
                "Lama soo qaadi karin hawlaha kale.",
              )}
            </p>

            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : otherActivities.length > 0 ? (
          <div className="mt-12">
            <SectionHeading
              eyebrow={translateAction(
                "MORE ACTIVITIES",
                "HAWLO KALE",
              )}
              title={translateAction(
                "More upcoming activities",
                "Hawlaha kale ee soo socda",
              )}
              subtitle={translateAction(
                "Explore more opportunities to meet and connect.",
                "Soo ogow fursado kale oo aad dadka kula kulmi karto.",
              )}
            />

            <div className="events-grid">
              {otherActivities.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  somali={somali}
                  joinLabel={translateAction(
                    "Bli en del av gemenskapen",
                    "Nagu soo biir",
                  )}
                  onJoinAction={() => navigateAction("join")}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* PREVIOUS MOMENTS */}
      <section className="section container">
        <div className="past-banner">
          <h2>
            {translateAction(
              "Har ni redan skapat minnen?",
              "Xusuus hore ma leedahay?",
            )}
          </h2>

          <p>
            {translateAction(
              "Ta en titt på minnen från tidigare träffar.",
              "Eeg xusuusaha kulamadii hore.",
            )}
          </p>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigateAction("moments")}
          >
            {translateAction(
              "Se våra minnen",
              "Eeg xusuusaheenna",
            )}

            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}