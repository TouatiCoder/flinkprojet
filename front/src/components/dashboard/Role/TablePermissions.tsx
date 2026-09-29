"use client";

import { useRef, useState } from "react";
import { Trash2, Loader2, PencilLine } from "lucide-react";
import UserUpdate from "./Update/UserUpdate";

import { 
  useGetManagerUsersQuery, 
  useDeleteManagerUserMutation 
} from "../../../services/managerAuthApi";

export default function RoleTableUsers() {
  const tableRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const { data: usersResponse, isLoading, isError } = useGetManagerUsersQuery();
  const [deleteManagerUser] = useDeleteManagerUserMutation();

  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);

  const usersList: any[] = Array.isArray(usersResponse)
    ? usersResponse
    : Array.isArray((usersResponse as any)?.data)
    ? (usersResponse as any).data
    : [];

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    
    try {
      setDeletingId(id);
      await deleteManagerUser(id).unwrap();
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      alert(error?.data?.message || "Échec de la suppression de l'utilisateur.");
    } finally {
      setDeletingId(null);
    }
  };

  const getProfileBadgeColor = (profileName: string = "") => {
    const role = profileName.toLowerCase();
    if (role.includes("admin")) {
      return "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50";
    }
    if (role.includes("manager")) {
      return "bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50";
    }
    if (role.includes("chef") || role.includes("commercial")) {
      return "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50";
    }
    return "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50";
  };

  return (
    <>
      <h2 className="text-xl md:text-2xl mt-8 ml-4 font-bold text-[#0f172a] dark:text-white py-2 px-2 border-b border-gray-100 dark:border-gray-800 tracking-tight">
        Gestion des Utilisateurs
      </h2>
      
      <div className="w-full bg-white dark:bg-gray-900 mt-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden" ref={tableRef}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-20">ID</th>
                <th className="py-4 px-6">Nom</th>
                <th className="py-4 px-6">Nom d'utilisateur</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Profil</th>
                <th className="py-4 px-6 w-24 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Chargement des données utilisateurs...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-red-500 font-medium">
                    Échec du chargement de la liste des utilisateurs. Veuillez rafraîchir la page.
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 font-medium">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                usersList.map((user: any) => {
                  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || "N/A";
                  const profileName = user.role?.name || user.role_name || user.profile || "User";
                  const isThisUserDeleting = deletingId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/50 transition">
                      
                      <td className="py-5 px-6 font-medium text-gray-400 dark:text-gray-500">
                        #{user.id}
                      </td>

                      <td className="py-5 px-6 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {fullName}
                      </td>

                      <td className="py-5 px-6 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        @{user.username || "—"}
                      </td>

                      <td className="py-5 px-6 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {user.email}
                      </td>

                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getProfileBadgeColor(profileName)}`}>
                          {profileName}
                        </span>
                      </td>

                      <td className="py-5 px-6 text-right">

                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setIsEditUserOpen(true);
                          }}
                          className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition cursor-pointer inline-flex items-center"
                          title="Modifier l'utilisateur"
                        >
                          <PencilLine className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <button
                          disabled={isThisUserDeleting}
                          onClick={() => handleDelete(user.id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 transition cursor-pointer inline-flex items-center disabled:opacity-40"
                          title="Supprimer l'utilisateur"
                        >
                          {isThisUserDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          )}
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      <UserUpdate
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        userId={selectedUserId}
        // refetchUsers={refetchUsers}
      />
    </>
  );
}