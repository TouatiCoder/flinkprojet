import { useState } from "react";

export default function CrmNote() {
  const [activeTab, setActiveTab] = useState("Info");

  const tabs = ["Info", "Activité", "Notes", "Fichiers"];

  return (
    <div>
      <div className="border-y border-gray-100 dark:border-gray-800">
        <nav className="flex px-6 gap-1" aria-label="Onglets utilisateur">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "Info" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu d'Info
            </p>
          </div>
        )}

        {activeTab === "Activité" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu de l'Activité
            </p>
          </div>
        )}

        {activeTab === "Notes" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu de la Notes
            </p>
          </div>
        )}

        {/* {activeTab === "Appareils" && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-10 text-center">
            <p className="text-sm text-gray-500">
              Contenu des Appareils
            </p>
          </div>
        )} */}

        {activeTab === "Fichiers" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu des Fichiers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}