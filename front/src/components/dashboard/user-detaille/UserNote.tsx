import { useState } from "react";
import { User, useGetUserEditQuery } from "../../../services/usersApi";
import UserStatistique from "./UserStatistique";
import UserActivite from "./UserActivite";
import UserPopUpVille from "./UserPopUpVille";

interface UserNoteProps {
  user: User;
}

export default function UserNote({ user }: UserNoteProps) {
  const [activeTab, setActiveTab] = useState("Aperçu");

  const { data: editData, isLoading: isEditLoading } = useGetUserEditQuery(
    { id: user.id },
    { skip: activeTab !== "Sécurité" }
  );

  const tabs = ["Aperçu", "Activité", "Sécurité", "Appareils", "Notes"];

  return (
    <div>
      <div className="border-y border-gray-100 dark:border-gray-800">
        <nav className="flex px-6 gap-1" aria-label="Onglets utilisateur">
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
          <UserStatistique user={user} />
        )}

        {activeTab === "Activité" && (
          <UserActivite user={user} />
        )}

        {activeTab === "Sécurité" && (
          isEditLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <UserPopUpVille 
              isInline={true} 
              isOpen={true}
              connexions={editData?.data?.connexions || []} 
            />
          )
        )}

        {activeTab === "Appareils" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu des Appareils
            </p>
          </div>
        )}

        {activeTab === "Notes" && (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contenu des Notes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
