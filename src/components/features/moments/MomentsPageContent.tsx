"use client";

import { Camera } from "lucide-react";

import type { Moment } from "@/lib/content";
import { photos } from "@/lib/content";
import { PageHero } from "@/components/shared/PageHero";

type Props = {
  t: (swedish: string, somali: string) => string;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  renderMomentCard: (item: Moment) => React.ReactNode;
  moments: Moment[];
  loading: boolean;
};

const filters = [
  {
    value: "All",
    sv: "Alla minnen",
    so: "Dhammaan",
  },
  {
    value: "Meetups",
    sv: "Träffar",
    so: "Kulamada",
  },
  {
    value: "Activities",
    sv: "Aktiviteter",
    so: "Hawlaha",
  },
  {
    value: "RAJO Sisters",
    sv: "RAJO Sisters",
    so: "RAJO Sisters",
  },
  {
    value: "Workshops",
    sv: "Workshops",
    so: "Aqoon-is-weydaarsiyo",
  },
  {
    value: "Community",
    sv: "Gemenskap",
    so: "Bulshada",
  },
];

export function MomentsPageContent({
  t,
  selectedFilter,
  setSelectedFilter,
  renderMomentCard,
  moments,
  loading,
}: Props) {
  const filteredMoments = moments.filter(
    (moment) =>
      selectedFilter === "All" ||
      moment.category === selectedFilter,
  );

  return (
    <>
      <PageHero
        tag={t("VÅRT GALLERI", "SAWIRRADEENNA")}
        title={t(
          "Våra ögonblick, våra minnen.",
          "Waqtiyadeenna, xusuusaheenna.",
        )}
        description={t(
          "Upptäck gemenskapen, samtalen och upplevelserna som gör RAJO speciellt.",
          "Soo ogow xiriirka, wada sheekaysiga iyo waayo-aragnimada RAJO ka dhigaya mid gaar ah.",
        )}
        image={photos.picnic}
      />

      <section className="section container">
        {/* FILTERS */}
        <div className="filter-row">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={
                selectedFilter === filter.value
                  ? "filter active"
                  : "filter"
              }
              onClick={() => setSelectedFilter(filter.value)}
              aria-pressed={selectedFilter === filter.value}
            >
              {t(filter.sv, filter.so)}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-5 muted">
              {t(
                "Laddar våra minnen...",
                "Xusuusaheenna waa la soo rarayaa...",
              )}
            </p>
          </div>
        ) : filteredMoments.length > 0 ? (
          /* MOMENTS GRID */
          <div className="moments-grid">
            {filteredMoments.map(renderMomentCard)}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
            <Camera
              size={42}
              className="mb-4 text-blue-500"
            />

            <h3 className="text-xl font-bold">
              {t(
                "Inga minnen här ännu",
                "Weli xusuus ma jiraan",
              )}
            </h3>

            <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {t(
                "Vi delar snart fler bilder och berättelser från RAJO:s aktiviteter.",
                "Dhawaan waxaan wadaagi doonnaa sawirro iyo sheekooyin dheeraad ah oo ku saabsan hawlaha RAJO.",
              )}
            </p>

            {selectedFilter !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedFilter("All")}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                {t("Visa alla minnen", "Arag dhammaan xusuusaha")}
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}