"use client";

import { Heart } from "lucide-react";
import type { Idea } from "@/lib/content";

type Props = {
  idea: Idea;
  voted: boolean;
  votedLabel: string;
  undoVoteLabel: string;
  voteLabel: string;
  onVote: () => void;
  voting?: boolean;
};

export function IdeaCard({
  idea,
  voted,
  votedLabel,
  undoVoteLabel,
  voteLabel,
  onVote,
  voting = false,
}: Props) {
  return (
    <article className="idea-card">
      <div className="idea-top">
        <span className="category-tag">
          {idea.category}
        </span>

        <span className="vote-number">
          <Heart
            size={15}
            fill={voted ? "currentColor" : "none"}
          />
          {idea.votes}
        </span>
      </div>

      <h3>{idea.title}</h3>

      <p>{idea.description}</p>

      <button
        type="button"
        className={voted ? "vote-btn voted" : "vote-btn"}
        onClick={onVote}
        disabled={voting}
        aria-pressed={voted}
        aria-busy={voting}
      >
        <Heart
          size={16}
          fill={voted ? "currentColor" : "none"}
        />

        {voting
          ? "..."
          : voted
            ? `${votedLabel} · ${undoVoteLabel}`
            : voteLabel}
      </button>
    </article>
  );
}