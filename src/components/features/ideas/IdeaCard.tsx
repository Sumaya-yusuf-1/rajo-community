import { Heart } from "lucide-react";
import type { Idea } from "@/lib/content";

export function IdeaCard({
  idea,
  voted,
  votedLabel,
  undoVoteLabel,
  voteLabel,
  onVote,
}: {
  idea: Idea;
  voted: boolean;
  votedLabel: string;
  undoVoteLabel: string;
  voteLabel: string;
  onVote: () => void;
}) {
  return (
    <div className="idea-card">
      <div className="idea-top">
        <span className="category-tag">{idea.category}</span>
        <span className="vote-number">
          <Heart size={15} fill="currentColor" /> {idea.votes}
        </span>
      </div>
      <h3>{idea.title}</h3>
      <p>{idea.description}</p>
      <button
        className={voted ? "vote-btn voted" : "vote-btn"}
        onClick={onVote}
      >
        <Heart size={16} />
        {voted ? `${votedLabel} · ${undoVoteLabel}` : voteLabel}
      </button>
    </div>
  );
}
