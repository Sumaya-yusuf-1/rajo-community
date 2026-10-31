import { Camera } from "lucide-react";
import { moments, photos } from "@/lib/content";
import { PageHero } from "@/components/shared/PageHero";

type Props = {
  t: (swedish: string, somali: string) => string;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  renderMomentCard: (item: (typeof moments)[number]) => React.ReactNode;
  moments: (typeof moments)[number][];
  loading: boolean;
};

export function MomentsPageContent({
  t,
  selectedFilter,
  setSelectedFilter,
  renderMomentCard,
  moments,
  loading,
}: Props) {
  return (
<>
    <PageHero
      tag={t("OUR GALLERY", "SAWIRRADEENNA")}
      title={t(
        "Our moments, our memories.",
        "Waqtiyadeenna, xusuusaheenna.",
      )}
      description={t(
        "A collection of the connections, conversations and experiences that make RAJO special.",
        "Xusuusta xiriirka, wada sheekaysiga iyo waayo-aragnimada RAJO.",
      )}
      image={photos.picnic}
    />
    <section className='section container'>
      <div className='filter-row'>
        {[
          "All",
          "Meetups",
          "Activities",
          "RAJO Sisters",
          "Workshops",
        ].map((f) => (
          <button
            key={f}
            className={
              selectedFilter === f ? "filter active" : "filter"
            }
            onClick={() => setSelectedFilter(f)}
          >
            {f === "All" ? t("All moments", "Dhammaan") : f}
          </button>
        ))}
      </div>
      {loading ? (
        <p className='py-12 text-center muted'>
          {t("Laddar minnen...", "Xusuusaha waa la soo rarayaa...")}
        </p>
      ) : (
        <div className='moments-grid'>
          {moments
            .filter(
              (m) =>
                selectedFilter === "All" || m.category === selectedFilter,
            )
            .map(renderMomentCard)}
        </div>
      )}
      <div className='soft-note'>
        <Camera size={22} />
        {t(
          "These are sample images and sample activities. Replace them with RAJO photos only after receiving permission from the people shown.",
          "Kuwani waa sawirro tusaale ah. Ku beddel sawirrada RAJO kaliya marka oggolaansho la helo.",
        )}
      </div>
    </section>
  </>
  );
}
