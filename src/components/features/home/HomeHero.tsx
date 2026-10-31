import { ArrowRight } from "lucide-react";

type HomeHeroProps = {
  image: string;
  title: string;
  welcomeLabel: string;
  description: string;
  memberLabel: string;
  profileLabel: string;
  ageLabel: string;
  isLoggedIn: boolean;
  onPrimaryAction: () => void;
};

export function HomeHero({
  image,
  title,
  welcomeLabel,
  description,
  memberLabel,
  profileLabel,
  ageLabel,
  isLoggedIn,
  onPrimaryAction,
}: HomeHeroProps) {
  return (
    <section className="home-hero">
      <div
        className="hero-image"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(7,30,68,.92) 0%,rgba(7,30,68,.72) 42%,rgba(7,30,68,.1) 100%),url('${image}')`,
        }}
      />
      <div className="hero-inner container">
        <div className="hero-copy">
          <span className="hero-pill">
            <span className="status-dot" />
            {welcomeLabel}
          </span>
         <h1 className="rajo-hero-title">
  {title.includes("växa i.") ? (
    <>
      {title.replace("växa i.", "")}
      <span className="whitespace-nowrap">växa i.</span>
    </>
  ) : (
    title
  )}
</h1>
          <p>{description}</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={onPrimaryAction}>
              {isLoggedIn ? profileLabel : memberLabel}
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-footnote">
            <span className="avatar-stack">
              <span>R</span>
              <span>A</span>
              <span>J</span>
              <span>O</span>
            </span>
            <span>{ageLabel}</span>
          </div>
        </div>
      </div>
      <div className="hero-side-label">CONNECT / SHARE / GROW</div>
    </section>
  );
}
