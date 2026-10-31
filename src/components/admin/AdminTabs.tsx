import type { LucideIcon } from "lucide-react";

export type AdminTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export function AdminTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: AdminTab[];
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
            activeTab === id
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-white/10 dark:bg-[#102640] dark:text-slate-200"
          }`}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
  );
}
