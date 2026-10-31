import { ArrowRight } from "lucide-react";

export function WelcomeSection({
  image,
  eyebrow,
  title,
  emphasis,
  description,
  actionLabel,
  onAction,
}: {
  image: string;
  eyebrow: string;
  title: string;
  emphasis: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="section container welcome-section">
      <div className="welcome-text">
        <span className="eyebrow">{eyebrow}</span>
        <h2>
          {title} <em>{emphasis}</em>
        </h2>
        <p>{description}</p>
        <button className="link-arrow" onClick={onAction}>
          {actionLabel} <ArrowRight size={18} />
        </button>
      </div>
      <div
        className="welcome-photo"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="photo-badge">
          <b>RAJO</b>
          <small>TOGETHER, WE THRIVE ✳</small>
        </div>
      </div>
    </section>
  );
}
