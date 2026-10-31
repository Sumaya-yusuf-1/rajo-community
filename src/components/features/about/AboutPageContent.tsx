import { ArrowRight, Heart } from "lucide-react";
import { photos } from "@/lib/content";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ValuesGrid } from "./ValuesGrid";

type Props = {
  t: (swedish: string, somali: string) => string;
  navigate: (page: string) => void;
};

export function AboutPageContent({ t, navigate }: Props) {
  return (
<>
    <PageHero
      tag={t("OUR STORY", "SHEEKADEENNA")}
      title={t(
        "Connection changes everything.",
        "Isku xirnaantu wax walba way beddeshaa.",
      )}
      description={t(
        "We are creating a space where young people are seen, heard and celebrated.",
        "Waxaan dhisaynaa goob ay dhallinyaradu ku dareemaan soo dhaweyn iyo qadarin.",
      )}
      image={photos.friends}
    />
    <section className='section container about-layout'>
      <div>
        <span className='eyebrow'>
          {t("WHY RAJO EXISTS", "SABABTA RAJO U JIRTO")}
        </span>
        <h2>
          {t(
            "Built on hope. Growing through connection.",
            "Rajada ayaa lagu dhisay. Wadajirna way ku kortaa.",
          )}
        </h2>
        <p>
          {t(
            "RAJO brings young people aged 18+ together to meet, share experiences, learn from one another and enjoy meaningful activities. We believe every conversation can be the start of a new friendship.",
            "RAJO waxay isu keentaa dhallinyarada 18+ jirka ah si ay isu bartaan, waayo-aragnimo u wadaagaan, wax isu baraan oo waqti fiican u wada qaataan.",
          )}
        </p>
      </div>
      <div
        className='about-image'
        style={{ backgroundImage: `url('${photos.city}')` }}
      />
    </section>
    <section className='section pale-section'>
      <div className='container'>
        <SectionHeading
          eyebrow={t("WHAT WE BELIEVE", "WAXA AAN AAMINSANNAHAY")}
          title={t(
            "Our values, our foundation.",
            "Qiyamkeenna, aasaaskeenna.",
          )}
        />
        <ValuesGrid
          values={[
            [
              t("Community", "Bulsho"),
              t(
                "A welcoming place where everyone belongs.",
                "Meel soo dhaweyn leh oo qof walba ku jiro.",
              ),
            ],
            [
              t("Respect", "Ixtiraam"),
              t(
                "We listen, care and lift each other up.",
                "Waan is dhageysannaa, is daryeelnaa, isna garab istaagnaa.",
              ),
            ],
            [
              t("Knowledge", "Aqoon"),
              t(
                "Sharing experiences and learning together.",
                "Wadaagista khibradaha iyo waxbarashada.",
              ),
            ],
            [
              t("Growth", "Korriin"),
              t(
                "Becoming better, together.",
                "Wadajir ayaan u horumaraynaa.",
              ),
            ],
          ]}
        />
      </div>
    </section>
    <section className='section container sisters-card'>
      <div
        className='sisters-photo'
        style={{ backgroundImage: `url('${photos.girls}')` }}
      />
      <div>
        <span className='eyebrow'>
          {t("A SPACE FOR COMMUNITY", "MEEL BULSHADA U GAAR AH")}
        </span>
        <h2>
          RAJO Community <Heart size={30} fill='currentColor' />
        </h2>
        <p>
          {t(
            "A welcoming part of RAJO where everyone can build friendships, support each other and grow together.",
            "Qayb soo dhaweyn leh oo RAJO ka mid ah halka qof walba uu saaxiibtinimo ku dhisan karo, isu taageeri karo oo wadajir ugu kori karo.",
          )}
        </p>
        <button
          className='btn-primary'
          onClick={() => navigate("join")}
        >
          {t("Join our community", "Ku biir bulshada")}{" "}
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  </>
  );
}
