"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AboutPageContent } from "@/components/features/about/AboutPageContent";
import { ActivitiesPageContent } from "@/components/features/activities/ActivitiesPageContent";
import { HomePageContent } from "@/components/features/home/HomePageContent";
import { IdeasPageContent } from "@/components/features/ideas/IdeasPageContent";
import { MembershipPageContent } from "@/components/features/membership/MembershipPageContent";
import { MomentCard } from "@/components/features/moments/MomentCard";
import { MomentsPageContent } from "@/components/features/moments/MomentsPageContent";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

import { moments, type Idea, type Locale } from "@/lib/content";
import { browserDb } from "@/lib/supabase/browser";
import { swedish } from "@/lib/swedish";

type Page =
  | "home"
  | "moments"
  | "activities"
  | "ideas"
  | "about"
  | "join"
  | "admin"
  | "terms"
  | "privacy";

type Theme = "light" | "dark";

type DatabaseIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "approved";
  vote_count: number;
  created_at: string;
};

type DatabaseMoment = {
  id: string;
  title_sv: string;
  title_so: string;
  description_sv: string | null;
  description_so: string | null;
  image_url: string | null;
  event_date: string;
  location: string;
  category: string;
};

const initialNav: Page[] = [
  "home",
  "moments",
  "activities",
  "ideas",
  "about",
  "join",
];

const labels: Record<Page, [string, string]> = {
  home: ["Hem", "Bogga Hore"],
  moments: ["Våra minnen", "Xusuusaheenna"],
  activities: ["Aktiviteter", "Hawlaha"],
  ideas: ["Idéer & röstning", "Fikrado & Codbixin"],
  about: ["Om RAJO", "Ku Saabsan RAJO"],
  join: ["Bli medlem", "Nagu Soo Biir"],
  admin: ["Admin", "Maamulka"],
  terms: ["Användarvillkor", "Shuruudaha Isticmaalka"],
  privacy: ["Integritetspolicy", "Siyaasadda Asturnaanta"],
};

function readData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CommunityApp({
  locale,
  initialPage = "home",
}: {
  locale: Locale;
  initialPage?: Page;
}) {
  const router = useRouter();
  const page = initialPage;

  const [theme, setTheme] = useState<Theme>("dark");
  const [menu, setMenu] = useState(false);

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [myVotes, setMyVotes] = useState<string[]>([]);

  const [selectedFilter, setSelectedFilter] = useState("All");

  const [databaseMoments, setDatabaseMoments] = useState<
    (typeof moments)[number][]
  >([]);

  const [momentsLoading, setMomentsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // TRANSLATION
  const t = (sv: string, so: string) =>
    locale === "so" ? so : (swedish[sv] ?? sv);

  // THEME AND SAVED VOTES
  useEffect(() => {
    document.documentElement.lang = locale;

    setMyVotes(readData<string[]>("rajo-votes", []));

    const savedTheme = localStorage.getItem("rajo-theme");

    const preferred: Theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : "dark";

    setTheme(preferred);

    document.documentElement.dataset.theme = preferred;
    document.documentElement.classList.toggle(
      "dark",
      preferred === "dark",
    );
  }, [locale]);

  // AUTHENTICATION
  useEffect(() => {
    const supabase = browserDb();
    let active = true;

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (active) {
        setIsLoggedIn(Boolean(user));
      }
    }

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsLoggedIn(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // FETCH IDEAS
  useEffect(() => {
    let active = true;

    async function fetchIdeas() {
      try {
        const response = await fetch("/api/ideas", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load ideas");
        }

        const result = (await response.json()) as {
          data?: DatabaseIdea[];
        };

        if (!active) return;

        setIdeas(
          (result.data ?? []).map((idea) => ({
            id: idea.id,
            title: idea.title,
            description: idea.description,
            category: idea.category,
            votes: idea.vote_count,
            status: idea.status,
            created: idea.created_at,
          })),
        );
      } catch (error) {
        console.error("Unable to load ideas:", error);

        if (active) setIdeas([]);
      }
    }

    void fetchIdeas();

    return () => {
      active = false;
    };
  }, []);

  // FETCH MOMENTS
  useEffect(() => {
    let active = true;

    async function fetchMoments() {
      setMomentsLoading(true);

      try {
        const response = await fetch("/api/moments", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load moments");
        }

        const result = (await response.json()) as {
          data?: DatabaseMoment[];
        };

        if (!active) return;

        setDatabaseMoments(
  (result.data ?? []).map((moment) => ({
    id: moment.id,
    title: moment.title_sv,
    so: moment.title_so,
    description_sv: moment.description_sv ?? "",
    description_so: moment.description_so ?? "",
    date: moment.event_date,
    location: moment.location,
    category: moment.category,
    image: moment.image_url ?? "",
  })),
);
      } catch (error) {
        console.error("Unable to load moments:", error);

        if (active) setDatabaseMoments([]);
      } finally {
        if (active) setMomentsLoading(false);
      }
    }

    void fetchMoments();

    return () => {
      active = false;
    };
  }, []);

  // SCROLL ANIMATION
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.09 },
    );

    const timer = window.setTimeout(() => {
      document
        .querySelectorAll(
          "main section, .moment-card, .event-card, .idea-card, .values-cards > div",
        )
        .forEach((element) => {
          element.classList.add("reveal-on-scroll");
          observer.observe(element);
        });
    }, 60);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [page]);

  // TOGGLE THEME
  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";

    setTheme(next);

    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle(
      "dark",
      next === "dark",
    );

    localStorage.setItem("rajo-theme", next);
  }

  // NAVIGATION
  function navigate(to: Page) {
    setMenu(false);
    setNotice("");

    router.push(
      `/${locale}${to === "home" ? "" : `/${to}`}`,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // SUBMIT IDEA
  async function addIdea(form: FormData) {
    setNotice("");

    const title = String(form.get("title") || "").trim();
    const description = String(
      form.get("description") || "",
    ).trim();

    const category = String(
      form.get("category") || "Community",
    ).trim();

    if (title.length < 4 || description.length < 10) {
      setNotice(
        t(
          "Ange en titel och en beskrivning på minst 10 tecken.",
          "Fadlan geli cinwaan iyo faahfaahin ugu yaraan 10 xaraf.",
        ),
      );
      return;
    }

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to submit idea",
        );
      }

      setNotice(
        t(
          "Tack! Din idé har skickats för granskning.",
          "Mahadsanid! Fikraddaada waxaa loo diray dib-u-eegis.",
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "";

      setNotice(
        message === "Login required"
          ? t(
              "Logga in innan du skickar en idé.",
              "Fadlan soo gal ka hor intaadan fikrad gudbin.",
            )
          : t(
              "Det gick inte att skicka idén.",
              "Fikradda lama gudbin karin.",
            ),
      );
    }
  }

  // VOTE
  async function vote(id: string) {
    if (myVotes.includes(id)) return;

    try {
      const response = await fetch(
        `/api/ideas/${encodeURIComponent(id)}/vote`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error("Unable to vote");
      }

      const updatedVotes = [...myVotes, id];

      setMyVotes(updatedVotes);

      localStorage.setItem(
        "rajo-votes",
        JSON.stringify(updatedVotes),
      );

      setIdeas((current) =>
        current.map((idea) =>
          idea.id === id
            ? { ...idea, votes: idea.votes + 1 }
            : idea,
        ),
      );
    } catch (error) {
      console.error("Unable to vote:", error);

      setNotice(
        t(
          "Det gick inte att rösta. Försök igen.",
          "Codeynta lama samayn karin. Mar kale isku day.",
        ),
      );
    }
  }

  // MEMBERSHIP
  async function join(form: FormData) {
    const supabase = browserDb();

    setNotice("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push(`/${locale}/login`);
      return;
    }

    const name = String(form.get("name") || "").trim();
    const interest = String(
      form.get("interest") || "",
    ).trim();
    const phone = String(form.get("phone") || "").trim();

    const adult = form.get("adult") === "on";
    const agreeTerms = form.get("agreeTerms") === "on";
    const contactConsent =
      form.get("contactConsent") === "on";
    const whatsappConsent =
      form.get("whatsappConsent") === "on";

    if (!adult || !agreeTerms || !contactConsent) {
      setNotice(
        t(
          "Du måste vara minst 18 år och godkänna villkoren.",
          "Waa inaad ugu yaraan 18 jir tahay oo aad aqbashaa shuruudaha.",
        ),
      );
      return;
    }

    if (name.length < 2) {
      setNotice(
        t(
          "Ange ditt fullständiga namn.",
          "Geli magacaaga oo dhan.",
        ),
      );
      return;
    }

    if (whatsappConsent && !phone) {
      setNotice(
        t(
          "Ange ditt telefonnummer för WhatsApp-kontakt.",
          "Geli lambarkaaga si lagugula soo xiriiro WhatsApp.",
        ),
      );
      return;
    }

    const { error } = await supabase
      .from("membership_requests")
      .insert({
        user_id: user.id,
        full_name: name,
        interest,
        phone: phone || null,
        whatsapp_consent: whatsappConsent,
        adult_confirmed: adult,
        terms_accepted_at: new Date().toISOString(),
        status: "pending",
      });

    if (error) {
      setNotice(
        locale === "sv"
          ? `Kunde inte skicka ansökan: ${error.message}`
          : `Codsiga lama dirin: ${error.message}`,
      );
      return;
    }

    setNotice(
      t(
        "Din medlemsansökan har skickats! RAJO kommer att granska den.",
        "Codsigaaga xubinnimada waa la diray! RAJO ayaa dib u eegi doonta.",
      ),
    );
  }

  // MOMENT CARD
  const renderMomentCard = (item: (typeof moments)[number]) => (
    <MomentCard
      key={item.id}
      item={item}
      somali={locale === "so"}
    />
  );

  const heroTitle = t(
    "A place to belong. A community to grow.",
    "Meel aad ka mid noqoto. Bulsho aad ku korto.",
  );

  return (
    <>
      <SiteHeader
        locale={locale}
        page={page}
        navItems={initialNav}
        labels={labels}
        menu={menu}
        theme={theme}
        translate={t}
        onNavigate={(to) => navigate(to as Page)}
        onMenuChange={setMenu}
        onToggleTheme={toggleTheme}
      />

      <main>
        {/* HOME */}
        {page === "home" && (
          <HomePageContent
            locale={locale}
            t={t}
            isLoggedIn={isLoggedIn}
            heroTitle={heroTitle}
            navigate={(to) => navigate(to as Page)}
            onProfile={() =>
              router.push(`/${locale}/member`)
            }
            renderMomentCard={renderMomentCard}
          />
        )}

        {/* MOMENTS */}
        {page === "moments" && (
          <MomentsPageContent
            t={t}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            renderMomentCard={renderMomentCard}
            moments={databaseMoments}
            loading={momentsLoading}
          />
        )}

        {/* ACTIVITIES */}
        {page === "activities" && (
          <ActivitiesPageContent
            translateAction={t}
            navigateAction={(to) => navigate(to as Page)}
            locale={locale}
          />
        )}

        {/* IDEAS */}
        {page === "ideas" && (
          <IdeasPageContent
            t={t}
            ideas={ideas}
            myVotes={myVotes}
            notice={notice}
            vote={vote}
            addIdea={addIdea}
          />
        )}

        {/* ABOUT */}
        {page === "about" && (
          <AboutPageContent
            t={t}
            navigate={(to) => navigate(to as Page)}
          />
        )}

        {/* MEMBERSHIP */}
        {page === "join" && (
          <MembershipPageContent
            t={t}
            notice={notice}
            join={join}
            navigate={(to) => navigate(to as Page)}
          />
        )}

        {/* TERMS */}
        {page === "terms" && (
          <section className="section container legal-page">
            <span className="eyebrow">RAJO COMMUNITY</span>

            <h1>
              {t(
                "Användarvillkor",
                "Shuruudaha Isticmaalka",
              )}
            </h1>

            <p className="legal-notice">
              {t(
                "Dessa villkor är ett utkast och ska granskas innan webbplatsen publiceras.",
                "Shuruudahani waa qabyo waana in dib loo eego ka hor daahfurka bogga.",
              )}
            </p>

            <h2>
              {t(
                "Vem kan bli medlem?",
                "Yaa xubin noqon kara?",
              )}
            </h2>

            <p>
              {t(
                "Du måste vara minst 18 år för att ansöka om medlemskap i RAJO. Det finns ingen övre åldersgräns.",
                "Waa inaad ugu yaraan 18 jir tahay si aad xubinnimo uga codsato RAJO. Ma jiro xad da' oo sare.",
              )}
            </p>

            <h2>
              {t(
                "Respekt och trygghet",
                "Ixtiraam iyo badbaado",
              )}
            </h2>

            <p>
              {t(
                "Alla medlemmar ska behandla varandra med respekt. Trakasserier, diskriminering, hot och spridning av andras privata uppgifter är inte tillåtna.",
                "Dhammaan xubnuhu waa inay is ixtiraamaan. Dhibaatayn, takoor, hanjabaad iyo faafinta xogta gaarka ah ee dadka kale lama oggola.",
              )}
            </p>

            <h2>
              {t(
                "Aktiviteter och innehåll",
                "Hawlaha iyo waxyaabaha la wadaago",
              )}
            </h2>

            <p>
              {t(
                "Aktiviteter kan ändras eller ställas in. Inskickade idéer granskas innan de publiceras. Dela inte bilder på andra utan lämpligt tillstånd.",
                "Hawlaha waa la beddeli karaa ama waa la baajin karaa. Fikradaha waa la hubiyaa ka hor daabacaadda. Ha wadaagin sawirrada dadka kale adigoon oggolaansho haysan.",
              )}
            </p>

            <h2>
              {t(
                "Konton och moderering",
                "Koontooyinka iyo maamulka",
              )}
            </h2>

            <p>
              {t(
                "RAJO kan ta bort innehåll och begränsa deltagande när det behövs för att skydda gemenskapen.",
                "RAJO waxay tirtiri kartaa waxyaabaha aan ku habboonayn ama xaddidi kartaa ka qaybgalka si bulshada loo ilaaliyo.",
              )}
            </p>

            <p className="muted">
              {t(
                "Lägg till kontaktuppgifter, versionsdatum och låt villkoren granskas innan lansering.",
                "Ku dar xogta xiriirka, taariikhda nooca, oo dib u eeg shuruudaha ka hor daahfurka.",
              )}
            </p>
          </section>
        )}

        {/* PRIVACY */}
        {page === "privacy" && (
          <section className="section container legal-page">
            <span className="eyebrow">RAJO COMMUNITY</span>

            <h1>
              {t(
                "Integritetspolicy",
                "Siyaasadda Asturnaanta",
              )}
            </h1>

            <p className="legal-notice">
              {t(
                "Detta är ett utkast. Policyn måste granskas och anpassas till RAJO:s faktiska personuppgiftsbehandling innan lansering.",
                "Tani waa qabyo. Siyaasadda waa in la waafajiyaa sida RAJO dhab ahaantii u maamusho xogta dadka ka hor daahfurka.",
              )}
            </p>

            <h2>
              {t(
                "Vilka uppgifter samlar vi in?",
                "Xogtee ayaan ururinnaa?",
              )}
            </h2>

            <p>
              {t(
                "RAJO kan behandla namn, e-postadress, telefonnummer, intressen, medlemsansökningar och uppgifter kopplade till konton, idéer och röstning. Uppgifter lagras bland annat via Supabase.",
                "RAJO waxay maamuli kartaa magacyada, iimaylka, lambarrada telefoonka, waxyaabaha la xiiseeyo, codsiyada xubinnimada iyo xogta ku saabsan koontooyinka, fikradaha iyo codbixinta. Xogta waxaa qayb ahaan lagu kaydiyaa Supabase.",
              )}
            </p>

            <h2>
              {t(
                "Hur använder vi uppgifterna?",
                "Sidee ayaan xogta u isticmaalnaa?",
              )}
            </h2>

            <p>
              {t(
                "Uppgifterna används för att hantera konton, granska medlemsansökningar, administrera aktiviteter och behandla inskickade idéer.",
                "Xogta waxaa loo isticmaalaa maamulka koontooyinka, dib-u-eegista codsiyada xubinnimada, abaabulka hawlaha iyo maaraynta fikradaha la soo gudbiyo.",
              )}
            </p>

            <h2>
              {t(
                "WhatsApp och kontakt",
                "WhatsApp iyo xiriirka",
              )}
            </h2>

            <p>
              {t(
                "Om du väljer att samtycka till WhatsApp-kontakt kan RAJO använda ditt telefonnummer för att kontakta dig via WhatsApp. Du ska kunna återkalla ditt samtycke.",
                "Haddii aad oggolaato xiriirka WhatsApp, RAJO waxay isticmaali kartaa lambarkaaga si lagugula soo xiriiro WhatsApp. Waa inaad awood u leedahay inaad ka noqoto oggolaanshahaaga.",
              )}
            </p>

            <h2>
              {t(
                "Bilder och samtycke",
                "Sawirrada iyo oggolaanshaha",
              )}
            </h2>

            <p>
              {t(
                "RAJO ska ha lämpligt stöd för att publicera bilder där personer kan identifieras. Kontakta RAJO om du vill begära att en bild på dig tas bort.",
                "RAJO waa inay haysataa oggolaansho ama saldhig ku habboon si loo daabaco sawirrada dadka la aqoonsan karo. La xiriir RAJO haddii aad rabto in sawirkaaga la saaro.",
              )}
            </p>

            <h2>
              {t(
                "Dina rättigheter",
                "Xuquuqdaada",
              )}
            </h2>

            <p>
              {t(
                "Du kan begära information om dina personuppgifter och, när tillämpligt, rättelse eller radering. Den slutliga policyn ska beskriva kontaktvägar, lagringstider, rättsliga grunder, mottagare och dina rättigheter enligt tillämplig lag.",
                "Waxaad codsan kartaa macluumaadka xogtaada iyo, marka ay khusayso, sixid ama tirtirid. Siyaasadda kama dambaysta ah waa inay sharaxdaa xiriirka, muddada kaydinta, saldhigyada sharci, cidda xogta hesha iyo xuquuqdaada.",
              )}
            </p>
          </section>
        )}
      </main>

      <SiteFooter
        locale={locale}
        navItems={initialNav}
        labels={labels}
        translate={t}
        onNavigate={(to) => navigate(to as Page)}
      />
    </>
  );
}