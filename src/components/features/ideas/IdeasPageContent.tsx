import { ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import { photos, type Idea } from "@/lib/content";
import { PageHero } from "@/components/shared/PageHero";
import { IdeaCard } from "./IdeaCard";

type Props = {
  t: (swedish: string, somali: string) => string;
  ideas: Idea[];
  myVotes: string[];
  notice: string;
  vote: (id: string) => void | Promise<void>;
  addIdea: (form: FormData) => void | Promise<void>;
};

export function IdeasPageContent({ t, ideas, myVotes, notice, vote, addIdea }: Props) {
  return (
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
            "Vote for your favourite suggestions. One vote per idea.",
            "U codee fikradaha aad jeceshahay. Hal cod fikrad kasta.",
          )}
        </p>
        <div className='idea-list'>
          {ideas
            .filter((i) => i.status === "approved")
            .sort((a, b) => b.votes - a.votes)
            .map((i) => (
              <IdeaCard
                key={i.id}
                idea={i}
                voted={myVotes.includes(i.id)}
                votedLabel={t("Voted", "Waad codaysay")}
                voteLabel={t("Vote for this idea", "U codee fikraddan")}
                onVote={() => vote(i.id)}
              />
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
  );
}
