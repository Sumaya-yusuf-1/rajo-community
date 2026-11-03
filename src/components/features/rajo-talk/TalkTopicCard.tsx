"use client";

import { ChevronDown, ChevronUp, Check, Vote } from "lucide-react";
import { useState } from "react";

export type TalkTopic = {
  id: string;
  title_sv: string;
  title_so: string;
  description_sv: string | null;
  description_so: string | null;
  votes: number;
  percentage: number;
};

type Props = {
  topic: TalkTopic;
  locale: "sv" | "so";
  icon: string;
  questions: readonly string[];
  selected: boolean;
  hasExistingVote: boolean;
  voting: boolean;
  disabled: boolean;
  onVote: () => void;
};

export function TalkTopicCard({
  topic,
  locale,
  icon,
  questions,
  selected,
  hasExistingVote,
  voting,
  disabled,
  onVote,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const somali = locale === "so";
  const title = somali ? topic.title_so : topic.title_sv;
  const description = somali
    ? topic.description_so || topic.description_sv
    : topic.description_sv || topic.description_so;
  const labels = somali
    ? {
        vote: "Codee",
        undo: "Ka noqo codka",
        change: "Beddel codka",
        voted: "Waad codaysay",
        questions: "Su’aalaha doodda",
        hide: "Qari su’aalaha",
      }
    : {
        vote: "Rösta",
        undo: "Ångra röst",
        change: "Byt röst",
        voted: "Röstat",
        questions: "Diskussionsfrågor",
        hide: "Dölj frågor",
      };

  const buttonLabel = selected
    ? labels.undo
    : hasExistingVote
      ? labels.change
    : voting
      ? "..."
      : labels.vote;

  return (
    <article className={`rajo-talk-topic-card${selected ? " selected" : ""}`}>
      <div className="rajo-talk-topic-heading">
        <span className="rajo-talk-topic-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {selected && (
          <span className="rajo-talk-selected-badge">
            <Check size={14} aria-hidden="true" />
            {labels.voted}
          </span>
        )}
      </div>

      <div className="rajo-talk-vote-summary">
        <span>
          <strong>{topic.votes}</strong>{" "}
          {somali
            ? topic.votes === 1
              ? "cod"
              : "codad"
            : topic.votes === 1
              ? "röst"
              : "röster"}
        </span>
        <strong>{topic.percentage}%</strong>
      </div>
      <div
        className="rajo-talk-progress"
        role="progressbar"
        aria-label={`${title}: ${topic.percentage}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={topic.percentage}
      >
        <span style={{ width: `${topic.percentage}%` }} />
      </div>

      <button
        type="button"
        className={`rajo-talk-questions-toggle${expanded ? " open" : ""}`}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span>{expanded ? labels.hide : labels.questions}</span>
        {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {expanded && (
        <ol className="rajo-talk-questions">
          {questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      )}

      <button
        type="button"
        className={`rajo-talk-vote-button${selected ? " selected" : ""}`}
        onClick={onVote}
        disabled={disabled || voting}
        aria-pressed={selected}
        aria-busy={voting}
      >
        <Vote size={17} aria-hidden="true" />
        {selected
          ? disabled
            ? labels.voted
            : labels.undo
          : voting
            ? "..."
            : disabled
              ? labels.voted
              : buttonLabel}
      </button>
    </article>
  );
}
