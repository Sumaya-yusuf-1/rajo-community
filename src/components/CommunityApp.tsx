"use client";
import UserMenu from "@/components/UserMenu";
import {
  events,
  moments,
  photos,
  starterIdeas,
  type Idea,
  type Locale,
} from "@/lib/content";
import { swedish } from "@/lib/swedish";
import { browserDb } from "@/lib/supabase/browser";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Globe2,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  MapPin,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";

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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [menu, setMenu] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(starterIdeas);
  const [myVotes, setMyVotes] = useState<number[]>([]);
  const [joinCount, setJoinCount] = useState(0);
  const [submissions, setSubmissions] = useState<
    { name: string; email: string; interest: string }[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 useEffect(() => {
  document.documentElement.lang = locale;

  // Load saved data
  setIdeas(readData("rajo-ideas", starterIdeas));
  setMyVotes(readData("rajo-votes", []));

  const savedSubmissions = readData<
    { name: string; email: string; interest: string }[]
  >("rajo-joins", []);

  setSubmissions(savedSubmissions);
  setJoinCount(savedSubmissions.length);

  // Load saved theme
  const savedTheme = localStorage.getItem("rajo-theme");

  const preferred: "light" | "dark" =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : "dark";

  setTheme(preferred);

  // For existing RAJO CSS
  document.documentElement.dataset.theme = preferred;

  // For Tailwind CSS dark: classes
  document.documentElement.classList.toggle(
    "dark",
    preferred === "dark"
  );
}, [locale]);

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
  const t = (sv: string, so: string) =>
    locale === "so" ? so : (swedish[sv] ?? sv);
  useEffect(() => {
    const reveal = () => {
      const targets = document.querySelectorAll(
        "main section, .moment-card, .event-card, .idea-card, .values-cards > div",
      );
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
      targets.forEach((el) => {
        el.classList.add("reveal-on-scroll");
        observer.observe(el);
      });
      return () => observer.disconnect();
    };
    const timer = window.setTimeout(reveal, 60);
    return () => window.clearTimeout(timer);
  }, [page]);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);

    document.documentElement.dataset.theme = next;

    document.documentElement.classList.toggle("dark", next === "dark");

    localStorage.setItem("rajo-theme", next);
  }
  function navigate(to: Page) {
    setMenu(false);
    setNotice("");
    router.push(`/${locale}${to === "home" ? "" : "/" + to}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function addIdea(form: FormData) {
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const category = String(form.get("category") || "Community");
    if (title.length < 4 || description.length < 10) {
      setNotice(
        t(
          "Please add a title and a description (at least 10 characters).",
          "Fadlan geli cinwaan iyo faahfaahin ugu yaraan 10 xaraf.",
        ),
      );
      return;
    }
    const next = [
      {
        id: Date.now(),
        title,
        description,
        category,
        votes: 0,
        status: "pending" as const,
        created: new Date().toISOString().slice(0, 10),
      },
      ...ideas,
    ];
    setIdeas(next);
    localStorage.setItem("rajo-ideas", JSON.stringify(next));
    setNotice(
      t(
        "Thank you! Your idea was submitted for review.",
        "Mahadsanid! Fikraddaada waxaa loo diray dib-u-eegis.",
      ),
    );
  }
  function vote(id: number) {
    if (myVotes.includes(id)) return;
    const next = ideas.map((item) =>
      item.id === id ? { ...item, votes: item.votes + 1 } : item,
    );
    setIdeas(next);
    localStorage.setItem("rajo-ideas", JSON.stringify(next));
    const votes = [...myVotes, id];
    setMyVotes(votes);
    localStorage.setItem("rajo-votes", JSON.stringify(votes));
  }

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
  
  const interest = String(form.get("interest") || "").trim();
  const phone = String(form.get("phone") || "").trim();

  const adult = form.get("adult") === "on";
  const agreeTerms = form.get("agreeTerms") === "on";
  const contactConsent = form.get("contactConsent") === "on";
  const whatsappConsent = form.get("whatsappConsent") === "on";

  if (!adult || !agreeTerms || !contactConsent) {
    setNotice(
      t(
        "Du måste vara minst 18 år och godkänna villkoren.",
        "Waa inaad ugu yaraan 18 jir tahay oo aad aqbashaa shuruudaha."
      )
    );
    return;
  }

  if (name.length < 2) {
    setNotice(
      t(
        "Ange ditt fullständiga namn.",
        "Geli magacaaga oo dhan."
      )
    );
    return;
  }

  if (whatsappConsent && !phone) {
    setNotice(
      t(
        "Ange ditt telefonnummer för WhatsApp-kontakt.",
        "Geli lambarkaaga si lagugula soo xiriiro WhatsApp."
      )
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
      : `Codsiga lama dirin: ${error.message}`
  );

  return;
}

  setNotice(
    t(
      "Din medlemsansökan har skickats! RAJO kommer att granska den.",
      "Codsigaaga xubinnimada waa la diray! RAJO ayaa dib u eegi doonta."
    )
  );
}
  function approve(id: number) {
    const next = ideas.map((item) =>
      item.id === id ? { ...item, status: "approved" as const } : item,
    );
    setIdeas(next);
    localStorage.setItem("rajo-ideas", JSON.stringify(next));
  }
  function deleteIdea(id: number) {
    const next = ideas.filter((item) => item.id !== id);
    setIdeas(next);
    localStorage.setItem("rajo-ideas", JSON.stringify(next));
  }
  const Heading = ({
    eyebrow,
    title,
    subtitle,
  }: {
    eyebrow: string;
    title: string;
    subtitle?: string;
  }) => (
    <div className='section-heading'>
      <div>
        <span className='eyebrow'>{eyebrow}</span>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
  const eventCard = (event: (typeof events)[number]) => (
    <article className='event-card' key={event.id}>
      <div
        className='event-photo'
        style={{ backgroundImage: `url('${event.image}')` }}
      >
        <span className='floating-tag'>{event.type}</span>
      </div>
      <div className='event-content'>
        <div className='event-date'>
          <CalendarDays size={15} />
          {event.date}
        </div>
        <h3>{locale === "so" ? event.so : event.title}</h3>
        <p>{locale === "so" ? event.descriptionSo : event.description}</p>
        <div className='event-location'>
          <MapPin size={14} />
          {event.where}
        </div>
        <button className='text-button' onClick={() => navigate("join")}>
          {t("Join the community", "Nagu soo biir")} <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
  const photoCard = (item: (typeof moments)[number]) => (
    <article className='moment-card' key={item.id}>
      <div
        className='moment-photo'
        style={{ backgroundImage: `url('${item.image}')` }}
      />
      <div className='moment-bottom'>
        <div>
          <h3>{locale === "so" ? item.so : item.title}</h3>
          <span>
            {item.date} · {item.location}
          </span>
        </div>
        <ArrowUpRight size={20} />
      </div>
    </article>
  );
  const heroTitle = t(
    "A place to belong. A community to grow.",
    "Meel aad ka mid noqoto. Bulsho aad ku korto.",
  );
  return (
    <>
      <header className='site-header rajo-animated-header'>
        <div className='header-inner'>
          {/* Logo */}
          <button
            type='button'
            onClick={() => navigate("home")}
            className='brand'
            aria-label='RAJO home'
          >
            <img src='/images/rajo-logo.jpeg' alt='RAJO Community' />

            <span>
              RAJO <small>COMMUNITY</small>
            </span>
          </button>

          {/* Desktop navigation */}
          <nav className='main-nav rajo-desktop-nav'>
            {initialNav.map((item) => (
              <button
                type='button'
                key={item}
                className={page === item ? "nav-active" : ""}
                onClick={() => navigate(item)}
              >
                {locale === "so" ? labels[item][1] : labels[item][0]}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className='header-actions'>
            {/* Language */}
            <div className='language-switch' aria-label={t("Språk", "Luqadda")}>
              <Globe2 size={15} />

              <Link
                className={locale === "sv" ? "active" : ""}
                href={`/sv${page === "home" ? "" : "/" + page}`}
              >
                SV
              </Link>

              <span>/</span>

              <Link
                className={locale === "so" ? "active" : ""}
                href={`/so${page === "home" ? "" : "/" + page}`}
              >
                SO
              </Link>
            </div>

            {/* Desktop theme toggle */}
            <button
              type='button'
              className='theme-toggle rajo-desktop-action'
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Aktivera ljust tema" : "Aktivera mörkt tema"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Desktop profile */}
            {/* Desktop profile */}
            <div className='rajo-desktop-profile hidden lg:flex items-center'>
              <UserMenu locale={locale} />
            </div>

            {/* Mobile hamburger */}
            <button
              type='button'
              className='mobile-toggle rajo-mobile-trigger'
              onClick={() => setMenu(true)}
              aria-label={locale === "so" ? "Fur liiska" : "Öppna menyn"}
              aria-expanded={menu}
              aria-controls='rajo-mobile-navigation'
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        locale={locale}
        open={menu}
        onClose={() => setMenu(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main>
        {page === "home" && (
          <>
            <section className='home-hero'>
              <div
                className='hero-image'
                style={{
                  backgroundImage: `linear-gradient(90deg,rgba(7,30,68,.92) 0%,rgba(7,30,68,.72) 42%,rgba(7,30,68,.1) 100%),url('${photos.hero}')`,
                }}
              />
              <div className='hero-inner container'>
                <div className='hero-copy'>
                  <span className='hero-pill'>
                    <span className='status-dot' />
                    {t(
                      "WELCOME TO RAJO COMMUNITY",
                      "KU SOO DHAWOW RAJO COMMUNITY",
                    )}
                  </span>
                  <h1>{heroTitle}</h1>
                  <p>
                    {t(
                      "We bring young people together to connect, share knowledge, build friendships and create memories that last.",
                      "Waxaan isu keennaa dhallinyarada si ay isu bartaan, aqoonta u wadaagaan, saaxiibtinimo u dhisaan, una abuuraan xusuus waarta.",
                    )}
                  </p>
                  <div className='hero-ctas'>
                   <button
  className="btn-primary"
  onClick={() =>
    isLoggedIn
      ? router.push(`/${locale}/member`)
      : navigate("join")
  }
>
  {isLoggedIn
    ? t("Min profil", "Boggeyga")
    : t("Bli medlem", "Xubin noqo")}

  <ArrowRight size={18} />
</button>
                  </div>
                  <div className='hero-footnote'>
                    <span className='avatar-stack'>
                      <span>R</span>
                      <span>A</span>
                      <span>J</span>
                      <span>O</span>
                    </span>
                    <span>
                      {t(
                        "For everyone aged 18 and over",
                        "Qof kasta oo 18 jir ah ama ka weyn",
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className='hero-side-label'>CONNECT / SHARE / GROW</div>
            </section>
            <div className='values-strip'>
              <div className='container value-row'>
                <span>
                  <Users /> <b>{t("Real connections", "Xiriir dhab ah")}</b>
                </span>
                <span>
                  <Heart />{" "}
                  <b>{t("A place to belong", "Meel lagu wada jiro")}</b>
                </span>
                <span>
                  <Lightbulb />{" "}
                  <b>{t("Share your ideas", "La wadaag fikradaha")}</b>
                </span>
                <span>
                  <Sparkles /> <b>{t("Grow together", "Wadajir u kor")}</b>
                </span>
              </div>
            </div>
            <section className='section container welcome-section'>
              <div className='welcome-text'>
                <span className='eyebrow'>
                  01 / {t("WHO WE ARE", "CIDDA AAN NAHAY")}
                </span>
                <h2>
                  {t("More than a community.", "In ka badan bulsho.")}{" "}
                  <em>{t("A feeling of home.", "Waa hoy lagu nasto.")}</em>
                </h2>
                <p>
                  {t(
                    "RAJO welcomes everyone aged 18 or older to make friends, share knowledge and discover what is possible together. From relaxed hangouts to inspiring workshops, you belong here.",
                    "RAJO waxay soo dhoweynaysaa qof kasta oo 18 jir ah ama ka weyn si uu u helo saaxiibo, aqoon u wadaago, uguna qaybqaato kulamada bulshada.",
                  )}
                </p>
                <button
                  className='link-arrow'
                  onClick={() => navigate("about")}
                >
                  {t("Discover our story", "Baro sheekadeenna")}{" "}
                  <ArrowRight size={18} />
                </button>
              </div>
              <div
                className='welcome-photo'
                style={{ backgroundImage: `url('${photos.friends}')` }}
              >
                <div className='photo-badge'>
                  <b>RAJO</b>
                  <small>TOGETHER, WE THRIVE ✳</small>
                </div>
              </div>
            </section>
            <section className='section pale-section'>
              <div className='container'>
                <Heading
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
                  {moments.slice(0, 3).map(photoCard)}
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
                <button
                  className='link-arrow'
                  onClick={() => navigate("activities")}
                >
                  {t("All activities", "Dhammaan hawlaha")}{" "}
                  <ArrowRight size={17} />
                </button>
              </div>
              <div className='events-grid'>{events.map(eventCard)}</div>
            </section>
            <section className='idea-banner container'>
              <div className='idea-banner-icon'>
                <Lightbulb size={37} />
              </div>
              <div>
                <span className='eyebrow light'>
                  {t("YOUR VOICE MATTERS", "CODKAAGU WAA MUHIIM")}
                </span>
                <h2>
                  {t(
                    "Have an idea? Let’s make it happen.",
                    "Fikrad ma haysaa? Aan hirgelinno.",
                  )}
                </h2>
                <p>
                  {t(
                    "Suggest activities, vote on your favourites and help shape RAJO.",
                    "Soo jeedi hawlo, u codee kuwa aad jeceshahay, oo ka qayb qaado dhismaha RAJO.",
                  )}
                </p>
              </div>
              <button className='btn-white' onClick={() => navigate("ideas")}>
                {t("Share your idea", "La wadaag fikraddaada")}{" "}
                <ArrowRight size={17} />
              </button>
            </section>
            <section className='section container ending-section'>
              <span className='eyebrow'>
                {t(
                  "EVERYONE HAS A PLACE HERE",
                  "QOF WALBA MEEL BUU KU LEEYAHAY",
                )}
              </span>
              <h2>
                {t("Your people are waiting.", "Dadkaagii way ku sugayaan.")}
              </h2>
              <p>
                {t(
                  "Come as you are. Bring your ideas, your energy and your story.",
                  "Sida aad tahay ku imow. Keen fikradahaaga, tamartaada iyo sheekadaada.",
                )}
              </p>
             <button
  className="btn-primary"
  onClick={() =>
    isLoggedIn
      ? router.push(`/${locale}/member`)
      : navigate("join")
  }
>
  {isLoggedIn
    ? t("Min profil", "Boggeyga")
    : t("Bli medlem", "Maanta ku biir RAJO")}

  <ArrowRight size={17} />
</button>
            </section>
          </>
        )}
        {page === "moments" && (
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
              <div className='moments-grid'>
                {moments
                  .filter(
                    (m) =>
                      selectedFilter === "All" || m.category === selectedFilter,
                  )
                  .map(photoCard)}
              </div>
              <div className='soft-note'>
                <Camera size={22} />
                {t(
                  "These are sample images and sample activities. Replace them with RAJO photos only after receiving permission from the people shown.",
                  "Kuwani waa sawirro tusaale ah. Ku beddel sawirrada RAJO kaliya marka oggolaansho la helo.",
                )}
              </div>
            </section>
          </>
        )}
        {page === "activities" && (
          <>
            <PageHero
              tag={t("LET’S GET TOGETHER", "AAN ISU IMAANNO")}
              title={t(
                "Good people. Great moments.",
                "Dad wanaagsan. Waqtiyo qurux badan.",
              )}
              description={t(
                "From online hangouts to real-world gatherings, find your next moment with RAJO.",
                "Kulamada internetka iyo kuwa fool-ka-foolka ah, ka hel kulankaaga xiga RAJO.",
              )}
              image={photos.girls}
            />
            <section className='section container'>
              <Heading
                eyebrow={t("WHAT’S NEXT", "MAXAA SOO SOCDA")}
                title={t("Upcoming activities", "Hawlaha soo socda")}
                subtitle={t(
                  "Discover an event, meet someone new and feel part of something bigger.",
                  "Hel kulan cusub, la kulan dad cusub oo ka mid noqo bulshada.",
                )}
              />
              <div className='events-grid'>{events.map(eventCard)}</div>
              <div className='soft-note'>
                <CalendarDays size={22} />
                {t(
                  "Dates and events shown are placeholders until RAJO confirms the schedule. Event registration will be enabled after the backend is connected.",
                  "Taariikhaha iyo kulamadu waa tusaalooyin ilaa RAJO ay xaqiijiso jadwalka.",
                )}
              </div>
              <div className='past-banner'>
                <h2>
                  {t("Made memories already?", "Xusuus hore ma leedahay?")}
                </h2>
                <p>
                  {t(
                    "Take a look at moments from earlier get-togethers.",
                    "Eeg xusuusaha kulamadii hore.",
                  )}
                </p>
                <button
                  className='btn-secondary'
                  onClick={() => navigate("moments")}
                >
                  {t("See our moments", "Eeg xusuusaheenna")}{" "}
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </>
        )}
        {page === "ideas" && (
          <>
            <PageHero
              tag={t("YOUR VOICE, OUR FUTURE", "CODKAAGA, MUSTAQBALKEENNA")}
              title={t(
                "Big things start with an idea.",
                "Wax weyn wuxuu ka bilaabmaa fikrad.",
              )}
              description={t(
                "Share what you would love to do together and vote for ideas that inspire you.",
                "La wadaag waxa aad jeceshahay in aan wada samayno, una codee fikradaha ku dhiirrigeliya.",
              )}
              image={photos.learn}
            />
            <section className='section container idea-layout'>
              <div>
                <span className='eyebrow'>
                  {t("COMMUNITY POWERED", "BULSHADU WADATO")}
                </span>
                <h2 className='subpage-title'>
                  {t("Popular ideas", "Fikradaha caanka ah")}
                </h2>
                <p className='muted'>
                  {t(
                    "Vote for your favourite suggestions. One vote per idea in this browser demo.",
                    "U codee fikradaha aad jeceshahay. Hal cod fikrad kasta tijaabadan.",
                  )}
                </p>
                <div className='idea-list'>
                  {ideas
                    .filter((i) => i.status === "approved")
                    .sort((a, b) => b.votes - a.votes)
                    .map((i) => (
                      <div className='idea-card' key={i.id}>
                        <div className='idea-top'>
                          <span className='category-tag'>{i.category}</span>
                          <span className='vote-number'>
                            <Heart size={15} fill='currentColor' /> {i.votes}
                          </span>
                        </div>
                        <h3>{i.title}</h3>
                        <p>{i.description}</p>
                        <button
                          className={
                            myVotes.includes(i.id)
                              ? "vote-btn voted"
                              : "vote-btn"
                          }
                          disabled={myVotes.includes(i.id)}
                          onClick={() => vote(i.id)}
                        >
                          <Heart size={16} />
                          {myVotes.includes(i.id)
                            ? t("Voted", "Waad codaysay")
                            : t("Vote for this idea", "U codee fikraddan")}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <div className='form-panel'>
                  <div className='form-icon'>
                    <Lightbulb />
                  </div>
                  <span className='eyebrow'>
                    {t("HAVE YOUR SAY", "FIKRADDAADA SOO GUDBI")}
                  </span>
                  <h2>{t("Share your idea", "La wadaag fikraddaada")}</h2>
                  <p>
                    {t(
                      "We would love to hear what you think RAJO should do next.",
                      "Waxaan jeclaan lahayn in aan maqalno fikraddaada ku saabsan RAJO.",
                    )}
                  </p>
                  <form key={notice} action={addIdea} className='stacked-form'>
                    <label>
                      {t("Idea title", "Cinwaanka fikradda")}
                      <input
                        name='title'
                        minLength={4}
                        maxLength={100}
                        required
                        placeholder={t(
                          "e.g. Community cooking night",
                          "Tusaale: Habeen cunto karis",
                        )}
                      />
                    </label>
                    <label>
                      {t("Tell us more", "Faahfaahin")}
                      <textarea
                        name='description'
                        required
                        minLength={10}
                        rows={5}
                        placeholder={t(
                          "What would you love to do?",
                          "Maxaad jeclaan lahayd in aan samayno?",
                        )}
                      />
                    </label>
                    <label>
                      {t("Category", "Qaybta")}
                      <select name='category'>
                        <option>Community</option>
                        <option>Online</option>
                        <option>Workshop</option>
                        <option>Outdoors</option>
                        <option>RAJO Sisters</option>
                      </select>
                    </label>
                    <button className='btn-primary full' type='submit'>
                      {t("Submit idea", "Gudbi fikradda")}{" "}
                      <ArrowRight size={17} />
                    </button>
                  </form>
                  {notice && (
                    <p className='form-notice'>
                      <CheckCircle2 size={18} />
                      {notice}
                    </p>
                  )}
                  <small className='muted'>
                    {t(
                      "Submitted ideas are reviewed before appearing publicly.",
                      "Fikradaha waa la eegaa ka hor inta aan la soo bandhigin.",
                    )}
                  </small>
                </div>
              </div>
            </section>
          </>
        )}
        {page === "about" && (
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
                <Heading
                  eyebrow={t("WHAT WE BELIEVE", "WAXA AAN AAMINSANNAHAY")}
                  title={t(
                    "Our values, our foundation.",
                    "Qiyamkeenna, aasaaskeenna.",
                  )}
                />
                <div className='values-cards'>
                  <div>
                    <Users />
                    <h3>{t("Community", "Bulsho")}</h3>
                    <p>
                      {t(
                        "A welcoming place where everyone belongs.",
                        "Meel soo dhaweyn leh oo qof walba ku jiro.",
                      )}
                    </p>
                  </div>
                  <div>
                    <Heart />
                    <h3>{t("Respect", "Ixtiraam")}</h3>
                    <p>
                      {t(
                        "We listen, care and lift each other up.",
                        "Waan is dhageysannaa, is daryeelnaa, isna garab istaagnaa.",
                      )}
                    </p>
                  </div>
                  <div>
                    <Lightbulb />
                    <h3>{t("Knowledge", "Aqoon")}</h3>
                    <p>
                      {t(
                        "Sharing experiences and learning together.",
                        "Wadaagista khibradaha iyo waxbarashada.",
                      )}
                    </p>
                  </div>
                  <div>
                    <Sparkles />
                    <h3>{t("Growth", "Korriin")}</h3>
                    <p>
                      {t(
                        "Becoming better, together.",
                        "Wadajir ayaan u horumaraynaa.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className='section container sisters-card'>
              <div
                className='sisters-photo'
                style={{ backgroundImage: `url('${photos.girls}')` }}
              />
              <div>
                <span className='eyebrow'>
                  {t("A SPACE FOR SISTERS", "MEEL GABDHAHA U GAAR AH")}
                </span>
                <h2>
                  RAJO Sisters <Heart size={30} fill='currentColor' />
                </h2>
                <p>
                  {t(
                    "A dedicated part of RAJO for women aged 18+ to build friendships, support each other and grow together.",
                    "Qayb RAJO ka mid ah oo loogu talagalay haweenka 18+ jirka ah si ay saaxiibtinimo u dhistaan, isu taageeraan oo wadajir u koraan.",
                  )}
                </p>
                <button
                  className='btn-primary'
                  onClick={() => navigate("join")}
                >
                  {t("Join our sisterhood", "Ku biir gabdhaha")}{" "}
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </>
        )}
        {page === "join" && (
          <>
            <PageHero
              tag={t("YOUR PLACE IS HERE", "MEESHAADII WAA TAN")}
              title={t(
                "Come as you are. Belong as you are.",
                "Sida aad tahay ku imow, nagu soo biir.",
              )}
              description={t(
                "New friendships, meaningful conversations and a community that welcomes you.",
                "Saaxiibo cusub, wada sheekaysi macno leh iyo bulsho ku soo dhawaynaysa.",
              )}
              image={photos.hero}
            />
            <section className='section container join-layout'>
              <div>
                <span className='eyebrow'>
                  {t("BECOME PART OF RAJO", "KA MID NOQO RAJO")}
                </span>
                <h2 className='subpage-title'>
                  {t(
                    "Your next chapter starts here.",
                    "Cutubkaaga xiga halkan ayuu ka bilaabmaa.",
                  )}
                </h2>
                <p>
                  {t(
                    "You don’t need to know anyone to join. Just bring your curiosity and a willingness to connect.",
                    "Uma baahnid inaad qof hore u taqaan. Kaliya keen rabitaankaaga isbarasho.",
                  )}
                </p>
                <div className='benefit-list'>
                  {[
                    t(
                      "Meet new people and make friends",
                      "La kulan dad cusub oo saaxiibo yeelo",
                    ),
                    t(
                      "Join fun online and in-person activities",
                      "Ka qaybgal kulamada internetka iyo kuwa fool-ka-foolka ah",
                    ),
                    t(
                      "Share ideas that shape our future",
                      "La wadaag fikrado mustaqbalka dhisaya",
                    ),
                    t(
                      "Learn, grow and support each other",
                      "Wax baro, horumar samee oo is taageera",
                    ),
                  ].map((v) => (
                    <div key={v}>
                      <Check size={16} />
                      {v}
                    </div>
                  ))}
                </div>
                <div className='join-info'>
                  <Users />
                  <div>
                    <b>
                      {t(
                        "Everyone aged 18+ is welcome",
                        "Qof kasta oo 18 jir ah ama ka weyn waa soo dhow yahay",
                      )}
                    </b>
                    <p>
                      {t(
                        "Based in Gothenburg, with online ways to connect too.",
                        "Göteborg ayaan ku saleysannahay, kulamo internetka ahna way jiraan.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className='form-panel'>
                <span className='eyebrow'>
                  {t("INTEREST FORM", "FOOMKA XIISAHA")}
                </span>
                <h2>{t("Join the community", "Ku biir bulshada")}</h2>
                <p>
                  {t(
                    "Tell us a little about yourself.",
                    "Wax yar nooga sheeg naftaada.",
                  )}
                </p>
                <form className='stacked-form' key={notice} action={join}>
                  <label>
                    {t("Your name", "Magacaaga")}
                    <input
                      required
                      minLength={2}
                      name='name'
                      placeholder={t("Full name", "Magaca oo dhan")}
                    />
                  </label>
                  <label>
                    {t("Email address", "Cinwaanka iimaylka")}
                    <input
                      required
                      type='email'
                      name='email'
                      placeholder='you@example.com'
                    />
                  </label>
                  <label>
                    {t(
                      "What interests you most?",
                      "Maxaa aad ugu xiiso badan?",
                    )}
                    <select name='interest'>
                      <option>Community activities</option>
                      <option>Online events</option>
                      <option>RAJO Sisters</option>
                      <option>Workshops & learning</option>
                    </select>
                  </label>
                  {/* Telefonnummer */}
<label>
  {t("Telefonnummer", "Lambarka telefoonka")}

  <input
    type="tel"
    name="phone"
    required
    autoComplete="tel"
    placeholder="+46 70 123 45 67"
    className="w-full"
  />
</label>
                  <label className='consent'>
                    <input required type='checkbox' name='adult' />
                    {t(
                      "I confirm that I am at least 18 years old.",
                      "Waxaan xaqiijinayaa inaan ugu yaraan 18 jir ahay.",
                    )}
                  </label>
                  <label className='consent'>
                    <input required type='checkbox' name='agreeTerms' />
                    {t(
                      "I have read and agree to the Terms of Use and Privacy Policy.",
                      "Waxaan akhriyey oo aqbalay Shuruudaha Isticmaalka iyo Siyaasadda Asturnaanta.",
                    )}
                  </label>
                  <label className="consent">
  <input
    type="checkbox"
    name="contactConsent"
    required
  />

  <span>
    {t(
      "Jag godkänner att RAJO kontaktar mig angående min medlemsansökan.",
      "Waxaan oggolahay in RAJO ila soo xiriirto arrimaha codsigayga xubinnimada."
    )}
  </span>
</label>
                  <label className="consent">
  <input
    type="checkbox"
    name="whatsappConsent"
  />

  <span>
    {t(
      "Jag godkänner att RAJO kontaktar mig via WhatsApp om medlemskap och aktiviteter.",
      "Waxaan oggolahay in RAJO igala soo xiriirto WhatsApp arrimaha xubinnimada iyo hawlaha."
    )}
  </span>
</label>
                  <div className='policy-links'>
                    <button type='button' onClick={() => navigate("terms")}>
                      {t("Read Terms of Use", "Akhri Shuruudaha")}
                    </button>
                    <button type='button' onClick={() => navigate("privacy")}>
                      {t("Read Privacy Policy", "Akhri Siyaasadda Asturnaanta")}
                    </button>
                  </div>
                  
                  <button className='btn-primary full' type='submit'>
                    {t("Send my interest", "Dir codsigayga")}{" "}
                    <ArrowRight size={16} />
                  </button>
                </form>
                {notice && (
                  <p className='form-notice'>
                    <CheckCircle2 size={18} />
                    {notice}
                  </p>
                )}
                <small className='muted'>
                  {t(
                    "Demo only: submissions stay in your browser. No email is sent.",
                    "Tijaabo keliya: xogtu waxay ku jirtaa browser-kaaga. Iimayl lama dirayo.",
                  )}
                </small>
              </div>
            </section>
          </>
        )}
        {page === "terms" && (
          <section className='section container legal-page'>
            <span className='eyebrow'>RAJO COMMUNITY</span>
            <h1>{t("Terms of Use", "Shuruudaha Isticmaalka")}</h1>
            <p className='legal-notice'>
              {t(
                "Draft for review before launch. These terms are not yet a final legal agreement.",
                "Qoraal qabyo ah oo dib loo eegayo ka hor daahfurka. Shuruudahani weli ma aha heshiis sharci oo kama dambays ah.",
              )}
            </p>
            <h2>{t("Who may join", "Yaa ku biiri kara")}</h2>
            <p>
              {t(
                "You must be at least 18 years old to apply for RAJO membership and participate in members-only activities. There is no upper age limit.",
                "Waa inaad ugu yaraan 18 jir tahay si aad xubinnimo u codsato ugana qaybgasho hawlaha xubnaha. Ma jiro xad da’ oo sare.",
              )}
            </p>
            <h2>{t("Respectful community", "Bulsho is-ixtiraamta")}</h2>
            <p>
              {t(
                "Treat others with respect. Harassment, discrimination, threats, spam and sharing private information without permission are not allowed.",
                "Xubnaha kale ixtiraam. Dhibaatayn, takoor, hanjabaad, farriimo badan oo aan loo baahnayn iyo faafinta xog gaar ah oggolaansho la’aan lama oggola.",
              )}
            </p>
            <h2>{t("Events and contributions", "Kulamada iyo fikradaha")}</h2>
            <p>
              {t(
                "Events may change or be cancelled. Submitted ideas are reviewed before publication. Do not upload or share photos of others without their permission.",
                "Kulamada waa la beddeli karaa ama waa la baajin karaa. Fikradaha waa la hubiyaa ka hor daabacaadda. Ha gelin sawirrada dadka kale adigoon oggolaansho haysan.",
              )}
            </p>
            <h2>{t("Account and moderation", "Koontooyinka iyo maamulka")}</h2>
            <p>
              {t(
                "Members are responsible for their activity. RAJO may remove content or restrict participation to protect the community.",
                "Xubnuhu waxay masuul ka yihiin hawlahooda. RAJO waxay tirtiri kartaa waxyaabaha aan ku habboonayn ama xaddidi kartaa ka qaybgalka si bulshada loo ilaaliyo.",
              )}
            </p>
            <p className='muted'>
              {t(
                "Before publishing, add contact details, version date and review these terms for your organization.",
                "Ka hor daabacaadda, ku dar xogta xiriirka, taariikhda nooca, oo dib u eeg shuruudaha ururkaaga.",
              )}
            </p>
          </section>
        )}
        {page === "privacy" && (
          <section className='section container legal-page'>
            <span className='eyebrow'>RAJO COMMUNITY</span>
            <h1>{t("Privacy Policy", "Siyaasadda Asturnaanta")}</h1>
            <p className='legal-notice'>
              {t(
                "Draft for review before launch. Update this notice to match your real data processing and service providers.",
                "Qoraal qabyo ah oo dib loo eegayo ka hor daahfurka. La waafaji sida xogta dhabta ah loo maareeyo iyo adeegyada la isticmaalo.",
              )}
            </p>
            <h2>{t("Information we collect", "Xogta aan ururinno")}</h2>
            <p>
              {t(
                "The interest form asks for your name, email address and interests. In this prototype, submissions and votes are stored only in your own browser, not on a RAJO server.",
                "Foomku wuxuu codsadaa magacaaga, iimaylkaaga iyo waxa aad xiisaynayso. Noocan tijaabada ah xogta iyo codadka waxa lagu kaydiyaa browser-kaaga oo keliya, ma aha server RAJO.",
              )}
            </p>
            <h2>
              {t("How we use information", "Sida aan xogta u isticmaalno")}
            </h2>
            <p>
              {t(
                "In a future live version, data may be used to respond to membership enquiries, manage events, review ideas and protect accounts. The final policy must describe the actual purposes and legal bases.",
                "Marka bogga si rasmi ah loo hawlgeliyo, xogta waxaa loo isticmaali karaa jawaabidda codsiyada xubinnimada, maamulka kulamada, dib-u-eegista fikradaha iyo ilaalinta koontooyinka. Siyaasadda kama dambaysta ah waa inay sharaxdaa ujeeddooyinka iyo saldhigyada sharci.",
              )}
            </p>
            <h2>{t("Photos and consent", "Sawirrada iyo oggolaanshaha")}</h2>
            <p>
              {t(
                "RAJO should only publish identifiable photos with appropriate permission. Contact RAJO to ask about removing a photo of you.",
                "RAJO waa inay daabacdaa sawirrada qof la garan karo marka oggolaansho ku habboon la helo. La xiriir RAJO haddii aad rabto in sawirkaaga la saaro.",
              )}
            </p>
            <h2>
              {t("Your choices and rights", "Doorashadaada iyo xuquuqdaada")}
            </h2>
            <p>
              {t(
                "You may ask the organization about access, correction or deletion of your personal data. The live policy must include contact information, retention periods, sharing, hosting and applicable rights.",
                "Waxaad ururka waydiisan kartaa helitaanka, saxidda ama tirtiridda xogtaada. Siyaasadda rasmiga ah waa inay ku dartaa xiriirka, muddada kaydinta, cidda xogta lala wadaago, halka lagu martigeliyo iyo xuquuqda khusaysa.",
              )}
            </p>
          </section>
        )}
        {page === "admin" && (
          <section className='section container admin-section'>
            <span className='eyebrow'>
              {t("SITE MANAGEMENT", "MAAMULKA BOGGA")}
            </span>
            <h1>{t("RAJO Admin Preview", "Tusaalaha Maamulka RAJO")}</h1>
            <div className='admin-warning'>
              <ShieldCheck size={24} />
              <div>
                <b>
                  {t(
                    "Local preview — not a secure admin login",
                    "Tijaabo maxalli ah — ma aha galitaan ammaan ah",
                  )}
                </b>
                <p>
                  {t(
                    "This dashboard is a UI demonstration. Real admin access must be protected with Supabase Auth, role checks and database policies before launch.",
                    "Dashboard-kan waa tusaale. Maamulka dhabta ah wuxuu u baahan yahay Supabase Auth iyo ilaalin xogeed.",
                  )}
                </p>
              </div>
            </div>
            <div className='admin-metrics'>
              <div>
                <CalendarDays />
                <b>{events.length}</b>
                <span>{t("Sample activities", "Hawlo tusaale ah")}</span>
              </div>
              <div>
                <Lightbulb />
                <b>{ideas.length}</b>
                <span>{t("Ideas", "Fikrado")}</span>
              </div>
              <div>
                <Users />
                <b>{joinCount}</b>
                <span>{t("Local enquiries", "Codsiyada")}</span>
              </div>
              <div>
                <ImageIcon />
                <b>{moments.length}</b>
                <span>{t("Sample photos", "Sawirro tusaale ah")}</span>
              </div>
            </div>
            <div className='admin-tables'>
              <div>
                <h2>
                  {t("Ideas awaiting approval", "Fikradaha sugaya oggolaansho")}
                </h2>
                {ideas.filter((i) => i.status === "pending").length === 0 ? (
                  <p className='muted'>
                    {t("No pending ideas yet.", "Fikrado sugaya ma jiraan.")}
                  </p>
                ) : (
                  ideas
                    .filter((i) => i.status === "pending")
                    .map((i) => (
                      <div className='admin-row' key={i.id}>
                        <span>
                          <b>{i.title}</b>
                          <small>{i.description}</small>
                        </span>
                        <button onClick={() => approve(i.id)} title='Approve'>
                          <Check size={18} />
                        </button>
                        <button onClick={() => deleteIdea(i.id)} title='Delete'>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                )}
              </div>
              <div>
                <h2>
                  {t(
                    "Interest submissions (this browser)",
                    "Codsiyada (browser-kan)",
                  )}
                </h2>
                {submissions.length === 0 ? (
                  <p className='muted'>
                    {t("No enquiries saved yet.", "Codsiyo weli ma jiraan.")}
                  </p>
                ) : (
                  submissions.map((s, i) => (
                    <div className='admin-row' key={i}>
                      <span>
                        <b>{s.name}</b>
                        <small>
                          {s.email} · {s.interest}
                        </small>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className='footer'>
        <div className='container footer-main'>
          <div className='footer-about'>
            <div className='footer-brand'>
              <img src='/images/rajo-logo.jpeg' alt='RAJO' />
              <span>
                RAJO <small>COMMUNITY</small>
              </span>
            </div>
            <h3>
              {t(
                "Together we connect, share & grow.",
                "Wadajir ayaan isku xirnaannaa, wadaagnaa oo kornaa.",
              )}
            </h3>
            <p>
              {t(
                "A space to belong, build friendships and create moments that matter.",
                "Goob saaxiibtinimo iyo xusuus qiimo leh lagu dhiso.",
              )}
            </p>
          </div>
          <div>
            <h4>{t("Explore", "Sahami")}</h4>
            {initialNav.slice(0, 4).map((item) => (
              <button key={item} onClick={() => navigate(item)}>
                {locale === "so" ? labels[item][1] : labels[item][0]}
              </button>
            ))}
          </div>
          <div>
            <h4>{t("Community", "Bulshada")}</h4>
            {initialNav.slice(4).map((item) => (
              <button key={item} onClick={() => navigate(item)}>
                {locale === "so" ? labels[item][1] : labels[item][0]}
              </button>
            ))}
            <button onClick={() => navigate("admin")}>Admin preview</button>
          </div>
          <div className='footer-news'>
            <h4>{t("Stay connected", "Nala soco")}</h4>
            <p>
              {t(
                "Our best moments are still ahead.",
                "Waqtiyadeennii ugu fiicnaa way soo socdaan.",
              )}
            </p>
            <button className='btn-white' onClick={() => navigate("join")}>
              {t("Get involved", "Ka qayb qaado")} <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className='container footer-bottom'>
          <span>
            © 2026 RAJO Community ·{" "}
            {t("Made for connection", "Waxaa loo sameeyay isku xirnaan")}
          </span>
          <span className='footer-legal'>
            <button onClick={() => navigate("terms")}>
              {t("Terms of Use", "Shuruudaha Isticmaalka")}
            </button>
            <button onClick={() => navigate("privacy")}>
              {t("Privacy Policy", "Siyaasadda Asturnaanta")}
            </button>
          </span>
          <span>CONNECT · SHARE · GROW</span>
        </div>
      </footer>
    </>
  );
}
function PageHero({
  tag,
  title,
  description,
  image,
}: {
  tag: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section
      className='page-hero'
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(5,30,70,.95),rgba(5,30,70,.64),rgba(5,30,70,.24)),url('${image}')`,
      }}
    >
      <div className='container'>
        <span className='hero-pill'>
          <span className='status-dot' />
          {tag}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
