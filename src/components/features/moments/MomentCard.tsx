import { ArrowUpRight } from "lucide-react";
import type { Moment } from "@/lib/content";

export function MomentCard({ item, somali }: { item: Moment; somali: boolean }) {
  return (
    <article className="moment-card">
      <div
        className="moment-photo"
        style={{ backgroundImage: `url('${item.image}')` }}
      />
      <div className="moment-bottom">
        <div>
          <h3>{somali ? item.so : item.title}</h3>
          <span>
            {item.date} · {item.location}
          </span>
        </div>
        <ArrowUpRight size={20} />
      </div>
    </article>
  );
}
