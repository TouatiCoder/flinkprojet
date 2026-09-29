

// function Bonjour() {
//     return (
//         <>
//             <div>
//                 <h1>Bonjouuuur</h1>
//             </div>
//         </>
//     )
// }
// export default Bonjour;


import { useAuthUser } from "../../hooks/useAuthUser";
import { Check, X, ShieldCheck, UserCheck, Crown } from "lucide-react";

function Bonjour() {
  const {
    fullName,
    roleName,
    isSuperAdmin,
    isChef,
    equipeId,
    permissions,
    isLoading,
    isError,
  } = useAuthUser();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Chargement des données du profil...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm font-bold text-rose-500 bg-rose-50 rounded-2xl border border-rose-200">
        Erreur lors de la récupération des informations utilisateur.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Bonjour, {fullName || "Utilisateur"} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Voici les détails de votre profil et de vos privilèges d'accès.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#5C24E8] border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50 shadow-2xs">
                <Crown className="w-3.5 h-3.5" />
                Super Admin
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              {roleName || "Aucun rôle"}
            </span>

            {isChef && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
                <UserCheck className="w-3.5 h-3.5" />
                Chef d'équipe (ID: {equipeId || "N/A"})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Liste de vos permissions assignées
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Total : {permissions.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-gray-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-gray-800">
                <th className="py-3 px-4">Permission</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-center">Créer</th>
                <th className="py-3 px-4 text-center">Modifier</th>
                <th className="py-3 px-4 text-center">Supprimer</th>
                <th className="py-3 px-4 text-center">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-medium text-slate-800 dark:text-slate-200">
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucune permission spécifique n'a été trouvée pour ce rôle.
                  </td>
                </tr>
              ) : (
                permissions.map((perm) => (
                  <tr
                    key={perm.permission_id}
                    className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold">{perm.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {perm.slug}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isSuperAdmin || perm.can_create ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-400 dark:bg-gray-800">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isSuperAdmin || perm.can_update ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-400 dark:bg-gray-800">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isSuperAdmin || perm.can_delete ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-400 dark:bg-gray-800">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300">
                        {isSuperAdmin ? "all" : perm.scope}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Bonjour;