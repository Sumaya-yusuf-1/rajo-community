import { Heart, Lightbulb, Sparkles, Users } from "lucide-react";

export function ValuesGrid({
  values,
}: {
  values: [string, string][];
}) {
  const icons = [Users, Heart, Lightbulb, Sparkles];

  return (
    <div className="values-cards">
      {values.map(([title, description], index) => {
        const Icon = icons[index];
        return (
          <div key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        );
      })}
    </div>
  );
}
