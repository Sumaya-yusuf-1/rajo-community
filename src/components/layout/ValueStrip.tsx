import { Heart, Lightbulb, Sparkles, Users } from "lucide-react";

export function ValueStrip({
  labels,
}: {
  labels: [string, string, string, string];
}) {
  const values = [
    [Users, labels[0]],
    [Heart, labels[1]],
    [Lightbulb, labels[2]],
    [Sparkles, labels[3]],
  ] as const;

  return (
    <div className="values-strip">
      <div className="container value-row">
        {values.map(([Icon, label]) => (
          <span key={label}>
            <Icon /> <b>{label}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
