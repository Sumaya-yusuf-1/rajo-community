import { IdeaBanner } from "@/components/features/ideas/IdeaBanner";
import { ValueStrip } from "@/components/layout/ValueStrip";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {  moments, photos } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import { UpcomingActivities } from "../activities/UpcomingActivities";
import { HomeHero } from "./HomeHero";
import { WelcomeSection } from "./WelcomeSection";

type Props = {
  locale: "sv" | "so";
  t: (swedish: string, somali: string) => string;
  isLoggedIn: boolean;
  heroTitle: string;
  navigate: (page: string) => void;
  onProfile: () => void;
  renderMomentCard: (item: (typeof moments)[number]) => React.ReactNode;
};

export function HomePageContent({
  locale,
  t,
  isLoggedIn,
  heroTitle,
  navigate,
  onProfile,
  renderMomentCard,
}: Props) {
  return (
    <>
      <HomeHero
        image={photos.hero}
        title={heroTitle}
        welcomeLabel={t(
          "WELCOME TO RAJO COMMUNITY",
          "KU SOO DHAWOW RAJO COMMUNITY",
        )}
        description={t(
          "We bring young people together to connect, share knowledge, build friendships and create memories that last.",
          "Waxaan isu keennaa dhallinyarada si ay isu bartaan, aqoonta u wadaagaan, saaxiibtinimo u dhisaan, una abuuraan xusuus waarta.",
        )}
        memberLabel={t("Bli medlem", "Xubin noqo")}
        profileLabel={t("Min profil", "Boggeyga")}
        ageLabel={t(
          "For everyone aged 18 and over",
          "Qof kasta oo 18 jir ah ama ka weyn",
        )}
        isLoggedIn={isLoggedIn}
        onPrimaryAction={() => (isLoggedIn ? onProfile() : navigate("join"))}
      />
      <ValueStrip
        labels={[
          t("Real connections", "Xiriir dhab ah"),
          t("A place to belong", "Meel lagu wada jiro"),
          t("Share your ideas", "La wadaag fikradaha"),
          t("Grow together", "Wadajir u kor"),
        ]}
      />
      <WelcomeSection
        image={photos.friends}
        eyebrow={`01 / ${t("WHO WE ARE", "CIDDA AAN NAHAY")}`}
        title={t("More than a community.", "In ka badan bulsho.")}
        emphasis={t("A feeling of home.", "Waa hoy lagu nasto.")}
        description={t(
          "RAJO welcomes everyone aged 18 or older to make friends, share knowledge and discover what is possible together. From relaxed hangouts to inspiring workshops, you belong here.",
          "RAJO waxay soo dhoweynaysaa qof kasta oo 18 jir ah ama ka weyn si uu u helo saaxiibo, aqoon u wadaago, uguna qaybqaato kulamada bulshada.",
        )}
        actionLabel={t("Discover our story", "Baro sheekadeenna")}
        onAction={() => navigate("about")}
      />
      <section className='section pale-section'>
        <div className='container'>
          <SectionHeading
            eyebrow={"02 / " + t("THE MEMORIES", "XUSUUSAHA")}
            title={t(
              "Moments worth remembering.",
              "Xusuus mudan in la xasuusto.",
            )}
            subtitle={t(
              "Little moments, lasting friendships. Here is a glimpse of our community.",
              "Daqiiqado yar, saaxiibtinimo waarta. Eeg xusuusaheenna.",
            )}
          />
          <div className='moments-grid home-moments'>
            {moments.slice(0, 3).map(renderMomentCard)}
          </div>
          <div className='center'>
            <button
              className='btn-secondary'
              onClick={() => navigate("moments")}
            >
              {t("Explore all moments", "Eeg dhammaan xusuusaha")}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <section className='section container'>
        <div className='section-heading split'>
          <div>
            <span className='eyebrow'>
              03 / {t("COME TOGETHER", "ISU IMAADA")}
            </span>
            <h2>{t("See what’s coming up.", "Eeg waxa soo socda.")}</h2>
            <p>
              {t(
                "Good things happen when we show up for each other.",
                "Waxyaabo wanaagsan ayaa dhaca marka aan is garab istaagno.",
              )}
            </p>
          </div>
          <button className='link-arrow' onClick={() => navigate("activities")}>
            {t("All activities", "Dhammaan hawlaha")} <ArrowRight size={17} />
          </button>
        </div>
        <UpcomingActivities
          locale={locale}
          onJoin={() => navigate("join")}
          limit={3}
        />
      </section>
      <IdeaBanner
        eyebrow={t("YOUR VOICE MATTERS", "CODKAAGU WAA MUHIIM")}
        title={t(
          "Have an idea? Let’s make it happen.",
          "Fikrad ma haysaa? Aan hirgelinno.",
        )}
        description={t(
          "Suggest activities, vote on your favourites and help shape RAJO.",
          "Soo jeedi hawlo, u codee kuwa aad jeceshahay, oo ka qayb qaado dhismaha RAJO.",
        )}
        actionLabel={t("Share your idea", "La wadaag fikraddaada")}
        onAction={() => navigate("ideas")}
      />
      <section className='section container ending-section'>
        <span className='eyebrow'>
          {t("EVERYONE HAS A PLACE HERE", "QOF WALBA MEEL BUU KU LEEYAHAY")}
        </span>
        <h2>{t("Your people are waiting.", "Dadkaagii way ku sugayaan.")}</h2>
        <p>
          {t(
            "Come as you are. Bring your ideas, your energy and your story.",
            "Sida aad tahay ku imow. Keen fikradahaaga, tamartaada iyo sheekadaada.",
          )}
        </p>
        <button
          className='btn-primary'
          onClick={() => (isLoggedIn ? onProfile() : navigate("join"))}
        >
          {isLoggedIn
            ? t("Min profil", "Boggeyga")
            : t("Bli medlem", "Maanta ku biir RAJO")}

          <ArrowRight size={17} />
        </button>
      </section>
    </>
  );
}
