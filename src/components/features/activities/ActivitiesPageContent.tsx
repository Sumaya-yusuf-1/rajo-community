"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

import { photos } from "@/lib/content";
import { browserDb } from "@/lib/supabase/browser";

import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Activity, EventCard } from "./EventCard";

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

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setError("");

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
        setError(fetchError.message);
        setActivities([]);
      } else {
        setActivities((data || []) as Activity[]);
      }

      setLoading(false);
    }

    void loadActivities();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHero
        tag={translateAction("LET’S GET TOGETHER", "AAN ISU IMAANNO")}
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

      <section className='section container'>
        <SectionHeading
          eyebrow={translateAction("WHAT’S NEXT", "MAXAA SOO SOCDA")}
          title={translateAction("Upcoming activities", "Hawlaha soo socda")}
          subtitle={translateAction(
            "Discover an event, meet someone new and feel part of something bigger.",
            "Hel kulan cusub, la kulan dad cusub oo ka mid noqo bulshada.",
          )}
        />

        {loading ? (
          <div className='py-12 text-center'>
            <p className='muted'>
              {translateAction(
                "Laddar kommande aktiviteter...",
                "Hawlaha soo socda waa la soo rarayaa...",
              )}
            </p>
          </div>
        ) : error ? (
          <div
            role='alert'
            className='rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700'
          >
            <p>
              {translateAction(
                "Kunde inte hämta aktiviteter.",
                "Lama soo qaadi karin hawlaha.",
              )}
            </p>

            <p className='mt-2 text-sm'>{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className='rounded-2xl border border-slate-200 p-10 text-center'>
            <CalendarDays size={36} className='mx-auto mb-4 text-blue-500' />

            <h3 className='text-xl font-bold'>
              {translateAction(
                "Inga kommande aktiviteter just nu",
                "Hadda ma jiraan hawlo soo socda",
              )}
            </h3>

            <p className='mt-2 muted'>
              {translateAction(
                "Håll utkik! Vi publicerar nya aktiviteter här.",
                "La soco! Hawlo cusub ayaan halkan ku soo bandhigi doonaa.",
              )}
            </p>
          </div>
        ) : (
          <div className='events-grid'>
            {activities.map((event) => (
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
        )}

        <div className='past-banner'>
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
            type='button'
            className='btn-secondary'
            onClick={() => navigateAction("moments")}
          >
            {translateAction("Se våra minnen", "Eeg xusuusaheenna")}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}
