import { useState } from "react";
import { Activity } from "lucide-react";
import AccountAdsTab from "./activity/AccountAdsTab";
import AccountTransactionsTab from "./activity/AccountTransactionsTab";
import AccountComptesProTab from "./activity/AccountComptesProTab";
import AccountSoldeAdsTab from "./activity/AccountSoldeAdsTab";

type ActivityTabId = "ads" | "achats" | "comptes_pro" | "solde_ads";

interface AccountActivitySectionProps {
  entityId: number | string;
  type?: "user" | "etablissement" | "prospect";
}

export default function AccountActivitySection({
  entityId,
  type = "user",
}: AccountActivitySectionProps) {
  const [activeTab, setActiveTab] = useState<ActivityTabId>("ads");

  const tabs: { id: ActivityTabId; label: string }[] = [
    { id: "ads", label: "Historique Ads" },
    { id: "achats", label: "Achats / Transactions" },
    { id: "comptes_pro", label: "Comptes Pro" },
    { id: "solde_ads", label: "Historique du solde Ads" },
  ];

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#07101e]/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          <Activity className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Activité du compte
        </h3>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-100 dark:border-gray-800/80 pb-0 overflow-x-auto scrollbar-hide text-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-sky-500 dark:text-sky-400"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 dark:bg-sky-400 rounded-full shadow-xs shadow-sky-500/50" />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "ads" && (
        <AccountAdsTab entityId={entityId} type={type} />
      )}

      {activeTab === "achats" && (
        <AccountTransactionsTab entityId={entityId} type={type} />
      )}

      {activeTab === "comptes_pro" && (
        <AccountComptesProTab entityId={entityId} type={type} />
      )}

      {activeTab === "solde_ads" && (
        <AccountSoldeAdsTab entityId={entityId} type={type} />
      )}
    </div>
  );
}