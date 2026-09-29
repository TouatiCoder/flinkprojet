import { Building2, MoreVertical, ArrowRight, Loader2 } from "lucide-react";
import { useGetComptesProQuery } from "../../../../../services/accountActivityApi";
import { mediaBaseUrl } from "../../../../../constants/publicConstants";

interface AccountComptesProTabProps {
  type?: "user" | "etablissement" | "prospect";
  entityId: number | string;
}

export default function AccountComptesProTab({
  type = "user",
  entityId,
}: AccountComptesProTabProps) {
  const { data: response, isLoading, isError } = useGetComptesProQuery(
    { type, id: entityId },
    { skip: !entityId }
  );

  const comptes = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-xs">Chargement des comptes pro...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-rose-500 text-xs font-medium">
        Impossible de charger les comptes professionnels.
      </div>
    );
  }

  if (comptes.length === 0) {
    return (
      <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>Aucun compte professionnel associé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 dark:text-slate-400/80 font-medium border-b border-slate-100 dark:border-gray-800/50 pb-2">
              <th className="pb-3 font-medium">Compte Pro</th>
              <th className="pb-3 font-medium">Activité</th>
              <th className="pb-3 font-medium">Date création</th>
              <th className="pb-3 font-medium">Statut</th>
              <th className="pb-3 font-medium">Solde Ads</th>
              <th className="pb-3 font-medium w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
            {comptes.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    {item.logo ? (
                      <img
                        src={
                          item.logo.startsWith("http")
                            ? item.logo
                            : `${mediaBaseUrl}${item.logo}`
                        }
                        alt={item.nom}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200/60 dark:border-gray-700/60 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg border border-slate-200/60 dark:border-gray-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.nom}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300 font-medium">
                  {item.activite_name}
                </td>

                <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 font-medium">
                  {item.date_creation}
                </td>

                <td className="py-3.5 pr-4">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      item.status
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {item.status_label}
                  </span>
                </td>

                <td className="py-3.5 pr-4 text-slate-800 dark:text-slate-200 font-bold">
                  {item.solde_format || `${item.consommation_solde.toLocaleString("fr-FR")} DH`}
                </td>

                <td className="py-3.5 text-right">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-center">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          <span>Voir tous les comptes pro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}