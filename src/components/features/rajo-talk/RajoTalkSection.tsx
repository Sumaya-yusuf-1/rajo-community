"use client";

import { CalendarDays, Clock3, Globe2, MapPin, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TalkRules } from "./TalkRules";
import { TalkTopicCard, type TalkTopic } from "./TalkTopicCard";

type Props = {
  locale: "sv" | "so";
};

type Poll = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

type TalkResponse = {
  poll: Poll | null;
  topics: TalkTopic[];
  totalVotes: number;
  myTopicId: string | null;
  isLoggedIn: boolean;
  error?: string;
};

const topicConfig = [
  {
    icon: "💰",
    key: "Dhaqaalaha iyo Dhalinyarada",
    questions: [
      "Maxay yihiin fursadaha dhaqaale ee dhalinyarada Sweden ku nool haystaan?",
      "Qof dhalinyaro ah oo aan haysan lacag badan sidee ayuu dhaqaale ku bilaabi karaa?",
      "Shaqo iyo ganacsi, kee ayaa dhalinyarada u wanaagsan?",
      "Sidee loo baran karaa kaydinta iyo maaraynta lacagta?",
      "Maxay yihiin caqabadaha dhalinyarada ka hor istaaga inay dhaqaale ahaan horumar sameeyaan?",
      "Sidee ayay dhalinyaradu isaga caawin karaan abuurista fursado dhaqaale?",
    ],
    swedishQuestions: [
      "Vilka ekonomiska möjligheter har unga som bor i Sverige?",
      "Hur kan en ung person med begränsad ekonomi komma igång?",
      "Vad passar unga bäst – arbete eller företagande?",
      "Hur kan man lära sig att spara och hantera pengar?",
      "Vilka hinder gör det svårt för unga att utvecklas ekonomiskt?",
      "Hur kan unga hjälpa varandra att skapa ekonomiska möjligheter?",
    ],
  },
  {
    icon: "🤝",
    key: "Isku Xirnaanta iyo Wadajirka Dhalinyarada",
    questions: [
      "Maxaa dhalinyarada ka hor istaaga inay isku xirnaadaan?",
      "Sidee loo abuuri karaa kalsooni iyo wadajir dhalinyarada dhexdooda ah?",
      "Maxaa sababa in dhalinyaradu kulamada ka qaybqaataan bilowga, balse ay markii dambe ka maqnaadaan?",
      "Sidee loo dhiirrigelin karaa ka qaybgalka joogtada ah?",
      "Maxay yihiin faa’iidooyinka ay leedahay in dhalinyaradu isku xirnaadaan?",
      "Sidee RAJO Community u abuuri kartaa bulsho isku xiran oo waarta?",
    ],
    swedishQuestions: [
      "Vad hindrar unga från att knyta kontakt med varandra?",
      "Hur kan vi skapa tillit och sammanhållning bland unga?",
      "Varför deltar unga i början men slutar komma senare?",
      "Hur kan vi uppmuntra ett regelbundet deltagande?",
      "Vilka fördelar finns med att unga håller ihop?",
      "Hur kan RAJO Community skapa en sammanhållen och hållbar gemenskap?",
    ],
  },
  {
    icon: "🌍",
    key: "Dhaqanka iyo Aqoonsiga Soomaaliyeed",
    questions: [
      "Maxay ka dhigan tahay inaad Soomaali tahay adigoo Sweden ku nool?",
      "Sidee loo ilaalin karaa afka Soomaaliga iyo dhaqankeenna?",
      "Dhaqanka Soomaaliyeed iyo kan Sweden ma la isku waafajin karaa?",
      "Maxay yihiin caqabadaha dhalinyarada ka haysta ilaalinta dhaqankooda?",
      "Maxaa ka mid ah dhaqankeenna oo ay tahay inaan jiilka dambe u gudbinno?",
      "Sidee RAJO Community uga qaybqaadan kartaa ilaalinta dhaqanka Soomaaliyeed?",
    ],
    swedishQuestions: [
      "Vad innebär det att vara somalier när man bor i Sverige?",
      "Hur kan vi bevara det somaliska språket och vår kultur?",
      "Går det att förena somalisk och svensk kultur?",
      "Vilka utmaningar möter unga när de vill bevara sin kultur?",
      "Vilka delar av vår kultur bör vi föra vidare till nästa generation?",
      "Hur kan RAJO Community bidra till att bevara somalisk kultur?",
    ],
  },
] as const;

function loginPath(locale: "sv" | "so") {
  return `/${locale}/login?next=${encodeURIComponent(`/${locale}/activities`)}`;
}

export function RajoTalkSection({ locale }: Props) {
  const [data, setData] = useState<TalkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votingTopicId, setVotingTopicId] = useState<string | null>(null);

  const loadTalk = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/rajo-talk", {
        cache: "no-store",
        signal,
      });
      const payload = (await response.json()) as TalkResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to load RAJO Talk");
      setData(payload);
      setError("");
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(loadError instanceof Error ? loadError.message : "Unable to load RAJO Talk");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadTalk(controller.signal);
    const interval = window.setInterval(() => void loadTalk(), 15_000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadTalk]);

  const topicByKey = useMemo(
    () => new Map((data?.topics ?? []).map((topic) => [topic.title_so, topic])),
    [data?.topics],
  );

  async function handleVote(topicId: string) {
    if (!data?.poll || votingTopicId) return;
    if (!data.isLoggedIn) {
      window.location.assign(loginPath(locale));
      return;
    }

    const selected = data.myTopicId === topicId;
    setVotingTopicId(topicId);
    setError("");
    try {
      const response = await fetch(`/api/rajo-talk/${data.poll.id}/vote`, {
        method: selected ? "DELETE" : "POST",
        headers: selected ? undefined : { "Content-Type": "application/json" },
        body: selected ? undefined : JSON.stringify({ topicId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (response.status === 401) {
        window.location.assign(loginPath(locale));
        return;
      }
      if (!response.ok) throw new Error(payload.error || "Voting failed");
      await loadTalk();
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Voting failed");
    } finally {
      setVotingTopicId(null);
    }
  }

  const somali = locale === "so";
  const closed = data?.poll?.status === "closed";

  return (
    <section className="rajo-talk-section section container" aria-labelledby="rajo-talk-title">
      <div className="rajo-talk-event">
        <span className="eyebrow">{somali ? "KULANKA SOO SOCDA" : "KOMMANDE SAMTAL"}</span>
        <h2 id="rajo-talk-title">RAJO Talk – Dhalinyarada, Horumarka &amp; Bulshada</h2>
        <div className="rajo-talk-event-details">
          <span><CalendarDays size={17} /> Saturday, November 7, 2026</span>
          <span><Clock3 size={17} /> 18:00–20:00 · Europe/Stockholm</span>
          <span><MapPin size={17} /> Online</span>
          <span><Globe2 size={17} /> {somali ? "Linkiga kulanka dhawaan ayaa la soo gelin doonaa" : "Möteslänk kommer snart"}</span>
        </div>
      </div>

      <div className="rajo-talk-heading">
        <div>
          <span className="eyebrow">{somali ? "CODKAAGA" : "DIN RÖST"}</span>
          <h2>{somali ? "Dooro mawduuca aad rabto inaad ka hadasho" : "Rösta på ämnet du vill prata om"}</h2>
          <p>{somali ? "Hal mawduuc dooro. Waad beddeli kartaa ama ka noqon kartaa codkaaga." : "Välj ett ämne. Du kan ändra eller ångra din röst när som helst."}</p>
        </div>
        {data && <strong className="rajo-talk-total-votes">{data.totalVotes} {somali ? "codad" : "röster"}</strong>}
      </div>

      {loading ? (
        <p className="rajo-talk-state" role="status">{somali ? "RAJO Talk waa la soo rarayaa..." : "RAJO Talk laddas..."}</p>
      ) : error && !data ? (
        <div className="rajo-talk-state error" role="alert"><TriangleAlert size={20} />{error}</div>
      ) : !data?.poll ? (
        <p className="rajo-talk-state">{somali ? "Hadda ma jiro codbixin furan." : "Det finns ingen omröstning just nu."}</p>
      ) : (
        <>
          {error && <div className="rajo-talk-inline-error" role="alert"><TriangleAlert size={17} />{error}</div>}
          {closed && <p className="rajo-talk-closed">{somali ? "Codbixintani way xiran tahay." : "Den här omröstningen är stängd."}</p>}
          <div className="rajo-talk-topics">
            {topicConfig.map((config) => {
              const topic = topicByKey.get(config.key);
              if (!topic) return null;
              return (
                <TalkTopicCard
                  key={topic.id}
                  topic={topic}
                  locale={locale}
                  icon={config.icon}
                  questions={somali ? config.questions : config.swedishQuestions}
                  selected={data.myTopicId === topic.id}
                  hasExistingVote={Boolean(data.myTopicId)}
                  voting={votingTopicId === topic.id}
                  disabled={Boolean(closed)}
                  onVote={() => void handleVote(topic.id)}
                />
              );
            })}
          </div>
        </>
      )}
      <TalkRules locale={locale} />
    </section>
  );
}
