import { useState } from "react";
import { Etablissement } from "../../../services/etablissementsApi";
import EtablissementStatistique from "./EtablissementStatistique";
import EtablissementActivite from "./EtablissementActivite";

interface EtablissementNoteProps {
  etablissement: Etablissement;
}

export default function EtablissementNote({ etablissement }: EtablissementNoteProps) {
  const [activeTab, setActiveTab] = useState("Aperçu");

  const tabs = ["Aperçu", "Activité", "Sécurité", "Appareils"];

  return (
    <div>
      <div className="border-y border-gray-100 dark:border-gray-800">
        <nav className="flex px-6 gap-1" aria-label="Onglets établissement">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                  : "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "Aperçu" && (
          <EtablissementStatistique etablissement={etablissement} />
        )}

        {activeTab === "Activité" && (
          <EtablissementActivite etablissement={etablissement} />
        )}

        {activeTab === "Sécurité" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu de la Sécurité
            </p>
          </div>
        )}

        {activeTab === "Appareils" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu des Appareils
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

