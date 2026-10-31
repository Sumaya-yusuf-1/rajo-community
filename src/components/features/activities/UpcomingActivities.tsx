"use client";

import { useActivities } from "@/app/hooks/useActivities";
import { EventCard } from "./EventCard";

type Props = {
  locale: "sv" | "so";
  onJoin: () => void;
  limit?: number;
};

export function UpcomingActivities({ locale, onJoin, limit = 3 }: Props) {
  const { activities, loading, error } = useActivities();

  const somali = locale === "so";

  if (loading) {
    return (
      <div className='events-grid'>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className='event-card animate-pulse'
            aria-hidden='true'
          >
            <div className='event-photo bg-slate-200 dark:bg-slate-800' />

            <div className='event-content space-y-3'>
              <div className='h-4 w-28 rounded bg-slate-200 dark:bg-slate-700' />
              <div className='h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700' />
              <div className='h-4 w-full rounded bg-slate-200 dark:bg-slate-700' />
            </div>
          </div>
        ))}
        <span className='sr-only'>
          {somali ? "Hawlaha waa la soo rarayaa..." : "Laddar aktiviteter..."}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p role='alert' className='muted'>
        {somali
          ? "Hawlaha lama soo qaadi karin. Fadlan mar kale isku day."
          : "Kunde inte hämta aktiviteter. Försök igen senare."}
      </p>
    );
  }

  const visibleActivities = activities.slice(0, limit);

  if (visibleActivities.length === 0) {
    return (
      <p className='muted'>
        {somali
          ? "Hadda ma jiraan hawlo soo socda."
          : "Inga kommande aktiviteter just nu."}
      </p>
    );
  }

  return (
    <div className='events-grid'>
      {visibleActivities.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          somali={somali}
          joinLabel={somali ? "Nagu soo biir" : "Bli medlem"}
          onJoinAction={onJoin}
        />
      ))}
    </div>
  );
}
