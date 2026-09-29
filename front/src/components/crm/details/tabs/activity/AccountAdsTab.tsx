import { Megaphone, MoreVertical, ArrowRight, Loader2 } from "lucide-react";
import { useGetAdsHistoryQuery } from "../../../../../services/accountActivityApi";

interface AccountAdsTabProps {
  type?: "user" | "etablissement" | "prospect";
  entityId: number | string;
}

export default function AccountAdsTab({ type = "user", entityId }: AccountAdsTabProps) {
  const { data: response, isLoading, isError } = useGetAdsHistoryQuery(
    { type, id: entityId },
    { skip: !entityId }
  );

  const campaigns = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-xs">Chargement des campagnes Ads...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-rose-500 text-xs font-medium">
        Impossible de charger les campagnes publicitaires.
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
        <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>Aucune campagne Ads trouvée pour ce compte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 dark:text-slate-400/80 font-medium border-b border-slate-100 dark:border-gray-800/50 pb-2">
              <th className="pb-3 font-medium">Campagne</th>
              <th className="pb-3 font-medium">Objectif</th>
              <th className="pb-3 font-medium">Budget</th>
              <th className="pb-3 font-medium">Impressions</th>
              <th className="pb-3 font-medium">Clics</th>
              <th className="pb-3 font-medium">CTR</th>
              <th className="pb-3 font-medium">Statut</th>
              <th className="pb-3 font-medium">Période</th>
              <th className="pb-3 font-medium w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
            {campaigns.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg border border-slate-200/60 dark:border-gray-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Campagne #{item.id}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300 font-medium">
                  {item.objectif}
                </td>

                <td className="py-3.5 pr-4 text-slate-800 dark:text-slate-200 font-bold">
                  {item.montant_format || `${item.montant.toLocaleString("fr-FR")} DH`}
                </td>

                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 font-semibold">
                  {item.vues.toLocaleString("fr-FR")}
                </td>

                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 font-semibold">
                  {item.clics.toLocaleString("fr-FR")}
                </td>

                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 font-semibold">
                  {item.ctr}
                </td>

                <td className="py-3.5 pr-4">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      item.is_active
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/20"
                    }`}
                  >
                    {item.status_label}
                  </span>
                </td>

                <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 font-medium">
                  {item.periode}
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
          <span>Voir toutes les campagnes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}