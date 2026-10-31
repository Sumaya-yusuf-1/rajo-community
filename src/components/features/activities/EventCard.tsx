"use client";

import { useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

// Activity type from Supabase
export type Activity = {
  id: string;
  title_sv: string;
  title_so: string;
  description_sv: string | null;
  description_so: string | null;
  starts_at: string;
  location: string | null;
  image_url: string | null;
};

// Component props
type EventCardProps = {
  event: Activity;
  joinLabel: string;
  onJoinAction: () => void;
  somali: boolean;
};

export function EventCard({
  event,
  joinLabel,
  onJoinAction,
  somali,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Language-specific title
  const title = somali
    ? event.title_so || event.title_sv
    : event.title_sv || event.title_so;

  // Language-specific description
  const description = somali
    ? event.description_so || event.description_sv
    : event.description_sv || event.description_so;

  // Format activity date
  const date = new Date(event.starts_at);

  const formattedDate = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(somali ? "so-SO" : "sv-SE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Stockholm",
      });

  // Show "Read More" for long descriptions
  const hasLongDescription = (description?.length ?? 0) > 150;

  const readMoreLabel = somali ? "Wax badan akhri" : "Läs mer";

  const showLessLabel = somali ? "Wax yar muuji" : "Visa mindre";

  return (
    <article className="event-card">
      {/* EVENT IMAGE */}
      <div
        className="event-photo"
        style={{
          backgroundImage: event.image_url
            ? `url("${event.image_url}")`
            : "linear-gradient(135deg, #123f76, #3b82f6)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="floating-tag">RAJO Community</span>
      </div>

      {/* EVENT CONTENT */}
      <div className="event-content">
        {/* DATE */}
        <div className="event-date">
          <CalendarDays size={15} />

          <span>{formattedDate}</span>
        </div>

        {/* TITLE */}
        <h3>{title}</h3>

        {/* DESCRIPTION */}
        {description && (
          <div className="event-description">
            <p
              id={`description-${event.id}`}
              className={
                !expanded && hasLongDescription ? "line-clamp-3" : ""
              }
              style={{
                whiteSpace: "pre-line",
              }}
            >
              {description}
            </p>

            {/* READ MORE / SHOW LESS */}
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setExpanded((previous) => !previous)}
                aria-expanded={expanded}
                aria-controls={`description-${event.id}`}
                className="
                  mt-2
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-blue-600
                  transition-colors
                  hover:text-blue-800
                  dark:text-blue-400
                  dark:hover:text-blue-300
                "
              >
                {expanded ? showLessLabel : readMoreLabel}

                {expanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            )}
          </div>
        )}

        {/* LOCATION */}
        <div className="event-location">
          <MapPin size={14} />

          <span>{event.location || "Online"}</span>
        </div>

        {/* JOIN BUTTON */}
        <button
          type="button"
          className="text-button"
          onClick={onJoinAction}
        >
          {joinLabel}

          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}