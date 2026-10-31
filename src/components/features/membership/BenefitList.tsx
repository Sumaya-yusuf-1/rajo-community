import { Check } from "lucide-react";

export function BenefitList({ benefits }: { benefits: string[] }) {
  return (
    <div className="benefit-list">
      {benefits.map((benefit) => (
        <div key={benefit}>
          <Check size={16} />
          {benefit}
        </div>
      ))}
    </div>
  );
}
