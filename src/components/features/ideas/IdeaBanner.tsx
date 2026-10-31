import { ArrowRight, Lightbulb } from "lucide-react";

export function IdeaBanner({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="idea-banner container">
      <div className="idea-banner-icon">
        <Lightbulb size={37} />
      </div>
      <div>
        <span className="eyebrow light">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="btn-white" onClick={onAction}>
        {actionLabel} <ArrowRight size={17} />
      </button>
    </section>
  );
}
