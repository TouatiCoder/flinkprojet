export type TabId =
  | "vue_ensemble"
  | "informations"
  | "activite"
  | "securite"
  | "appareils"
  | "notes"
  | "fichiers";

export const ALL_TABS: { id: TabId; label: string; types?: ("user" | "etablissement" | "prospect")[] }[] = [
  { id: "vue_ensemble", label: "Vue d'ensemble" },
  { id: "informations", label: "Informations" },
  { id: "activite", label: "Activité", types: ["user", "etablissement"] },
  { id: "securite", label: "Sécurité", types: ["user"] },
  { id: "appareils", label: "Appareils", types: ["user", "etablissement"] },
  { id: "notes", label: "Notes" },
  { id: "fichiers", label: "Fichiers" },
];

interface EntityTabsNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  type?: "user" | "prospect" | "etablissement";
}

export default function EntityTabsNav({
  activeTab,
  onChange,
  type = "user",
}: EntityTabsNavProps) {
  const visibleTabs = ALL_TABS.filter((tab) => !tab.types || tab.types.includes(type));

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-6">
      <nav className="flex items-end gap-0 overflow-x-auto scrollbar-hide">
        {visibleTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative shrink-0 px-4 py-3.5 text-[13px] font-semibold transition-all duration-200 whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? "text-[#5C24E8] dark:text-purple-400 border-[#5C24E8] dark:border-purple-400"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}