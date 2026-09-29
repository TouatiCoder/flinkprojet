import { useState } from "react";
import EntityHeader from "./EntityHeader";
import EntityTabsNav, { type TabId } from "./EntityTabsNav";
import TabVueEnsemble from "./TabVueEnsemble";
import TabActiviteUser from "./tabs/TabActiviteUser";
import TabActiviteEtablissement from "./tabs/TabActiviteEtablissement";
import OpportunityRightPanel from "./OpportunityRightPanel";
import { User } from "../../../services/usersApi";
import { Etablissement } from "../../../services/etablissementsApi";
import type { ProspectItem } from "../../../services/ProspectApi";
import { FileText, ShieldCheck, Smartphone, StickyNote } from "lucide-react";
import TabSecuriteUser from "./tabs/TabSecuriteUser";
import TabInformations from "./tabs/TabInformations";
import TabNotes from "./tabs/TabNotes";
import UserStatistique from "./tabs/UserStatistique";
import EtablissementStatistique from "./tabs/EtablissementStatistique";
import AccountAdsTab from "./tabs/activity/AccountAdsTab";
import AccountTransactionsTab from "./tabs/activity/AccountTransactionsTab";
import AccountComptesProTab from "./tabs/activity/AccountComptesProTab";
import AccountSoldeAdsTab from "./tabs/activity/AccountSoldeAdsTab";

export type ActiviteSubTab =
  | "statistiques"
  | "historique_ads"
  | "achats_transactions"
  | "comptes_pro"
  | "historique_solde_ads";

const ACTIVITE_SUB_TABS: { id: ActiviteSubTab; label: string }[] = [
  { id: "statistiques", label: "Statistiques" },
  { id: "historique_ads", label: "Historique Ads" },
  { id: "achats_transactions", label: "Achats / Transactions" },
  { id: "comptes_pro", label: "Comptes Pro" },
  { id: "historique_solde_ads", label: "Historique du solde Ads" },
];

interface EntityDetailViewProps {
  cardId?: string | number;
  user?: User | null;
  etablissement?: Etablissement | null;
  prospect?: ProspectItem | null;
  type?: "user" | "prospect" | "etablissement";
  isOpen: boolean;
  onClose: () => void;
}

function PlaceholderTab({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-64 text-slate-300 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
        Onglet "{label}" — bientôt disponible
      </p>
    </div>
  );
}

export default function EntityDetailView({
  cardId,
  user,
  etablissement,
  prospect,
  type = "user",
  isOpen,
  onClose,
}: EntityDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("vue_ensemble");
  const [activeActiviteSubTab, setActiveActiviteSubTab] = useState<ActiviteSubTab>("statistiques");

  if (!isOpen) return null;

  const currentEntity = etablissement || user || prospect;
  if (!currentEntity) return null;

  const fullName =
    type === "etablissement" && etablissement
      ? String(etablissement.nom || "")
      : type === "user" && user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : String((currentEntity as any).nom || "Utilisateur");

  function renderActiviteSubContent() {
    const entityId = currentEntity?.id ?? cardId ?? 0;

    switch (activeActiviteSubTab) {
      case "statistiques":
        if (type === "etablissement" && etablissement) {
          return (
            <div className="space-y-6">
              <EtablissementStatistique etablissement={etablissement} />
              <TabActiviteEtablissement etablissement={etablissement} />
            </div>
          );
        }
        if (type === "user" && user) {
          return (
            <div className="space-y-6">
              <UserStatistique user={user} />
              <TabActiviteUser user={user} />
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <UserStatistique user={currentEntity as any} />
            <TabActiviteUser user={currentEntity as any} />
          </div>
        );

      case "historique_ads":
        return <AccountAdsTab entityId={entityId} type={type} />;

      case "achats_transactions":
        return <AccountTransactionsTab entityId={entityId} type={type} />;

      case "comptes_pro":
        return <AccountComptesProTab entityId={entityId} type={type} />;

      case "historique_solde_ads":
        return <AccountSoldeAdsTab entityId={entityId} type={type} />;

      default:
        return null;
    }
  }

  function renderTabContent() {
    switch (activeTab) {
      case "vue_ensemble":
        return <TabVueEnsemble entity={currentEntity} type={type} />;

      case "activite":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-gray-800 px-1 overflow-x-auto">
              {ACTIVITE_SUB_TABS.map((subTab) => {
                const isActive = activeActiviteSubTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => setActiveActiviteSubTab(subTab.id)}
                    className={`pb-2.5 text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {subTab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <div>{renderActiviteSubContent()}</div>
          </div>
        );

      case "securite":
        if (type === "user" && user) {
          return <TabSecuriteUser user={user} />;
        }
        return <PlaceholderTab icon={<ShieldCheck className="w-6 h-6" />} label="Sécurité" />;

      case "notes":
        if (type === "prospect" && prospect?.id) {
          return <TabNotes prospectId={prospect.id} />;
        }
        return <PlaceholderTab icon={<StickyNote className="w-6 h-6" />} label="Notes" />;

      case "informations":
        return <TabInformations entity={currentEntity} type={type} />;

      case "appareils":
        return <PlaceholderTab icon={<Smartphone className="w-6 h-6" />} label="Appareils" />;

      case "fichiers":
        return <PlaceholderTab icon={<FileText className="w-6 h-6" />} label="Fichiers" />;

      default:
        return null;
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-50 dark:bg-gray-950 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150">
      <div className="flex flex-1 w-full h-full overflow-hidden">
        <div className="flex flex-col w-[60%] flex-1 min-w-0 h-full overflow-hidden border-r border-slate-200/80 dark:border-gray-800/80">
          <EntityHeader entity={currentEntity} type={type} onBack={onClose} />
          <EntityTabsNav activeTab={activeTab} type={type} onChange={setActiveTab} />

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-5 xl:p-6 w-full">
              {renderTabContent()}
            </div>
          </div>
        </div>

        <div className="w-[40%] min-w-[360px] shrink-0 h-full overflow-hidden bg-white dark:bg-gray-900">
          <OpportunityRightPanel
            cardId={cardId}
            userId={type === "user" ? user?.id : undefined}
            etabId={type === "etablissement" ? etablissement?.id : undefined}
            prospectId={type === "prospect" ? prospect?.id : undefined}
            prospectName={fullName}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}