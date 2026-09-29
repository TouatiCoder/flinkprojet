import React from "react";
import { Users, Loader2, Eye, Pencil } from "lucide-react";
import Pagination from "../../ui/pagination/Pagination";
import RowActionsMenu from "../../ui/table/RowActionsMenu";
import type { EquipeItem } from "../../../services/equipeApi";
import { emptyStats, formatNombre, type EquipeStats } from "./equipeStats";

interface EquipeDataGridProps {
  equipes?: EquipeItem[];
  /** Indicateurs agrégés depuis /membres, indexés par id d'équipe. */
  stats: Map<number, EquipeStats>;
  isLoading?: boolean;
  currentPage?: number;
  lastPage?: number;
  total?: number;
  from?: number;
  to?: number;
  onPageChange?: (page: number) => void;
  /** Clic (ou Entrée / Espace) sur une ligne, et action « Afficher ». */
  onSelectEquipe?: (equipe: EquipeItem) => void;
  /** Action « Modifier » du menu de ligne. */
  onEditEquipe?: (equipe: EquipeItem) => void;
}

/** Initiales utilisées tant que l'API ne renvoie pas d'avatar de responsable. */
const initiales = (nom: string) =>
  nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("") || "?";

const ObjectifCell: React.FC<{ pourcentage: number; barClass: string }> = ({
  pourcentage,
  barClass,
}) => (
  <td className="px-4 py-4 align-middle">
    <div className="space-y-1.5">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{pourcentage}%</span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
    </div>
  </td>
);

export default function EquipeDataGrid({
  equipes = [],
  stats,
  isLoading = false,
  currentPage = 1,
  lastPage = 1,
  total = 0,
  from = 0,
  to = 0,
  onPageChange,
  onSelectEquipe,
  onEditEquipe,
}: EquipeDataGridProps) {
  const thBase =
    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800/80 dark:bg-[#07101e]/80">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-[#091122]/40">
            {/* Deux niveaux d'en-tête : « Objectifs » coiffe ses trois colonnes. */}
            <tr>
              <th rowSpan={2} className={`${thBase} pl-6`}>
                Nom de l'équipe
              </th>
              <th rowSpan={2} className={thBase}>
                Secteur(s)
              </th>
              <th rowSpan={2} className={thBase}>
                Responsable
              </th>
              <th rowSpan={2} className={`${thBase} text-center`}>
                Membres
              </th>
              <th
                colSpan={3}
                className="border-x border-slate-100 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800/60 dark:text-slate-500"
              >
                Objectifs (taux d'atteinte)
              </th>
              <th rowSpan={2} className={`${thBase} text-center`}>
                Leads
                <br />
                actifs
              </th>
              <th rowSpan={2} className={`${thBase} text-center`}>
                Retards
              </th>
              <th rowSpan={2} className={`${thBase} text-center`}>
                Statut
              </th>
              <th rowSpan={2} className={`${thBase} pr-6 text-right`}>
                Actions
              </th>
            </tr>
            <tr>
              <th className={`${thBase} border-l border-slate-100 dark:border-slate-800/60`}>
                Devenir User
              </th>
              <th className={thBase}>Compte Pro</th>
              <th className={`${thBase} border-r border-slate-100 dark:border-slate-800/60`}>
                Solde Ads
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="px-6 py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des équipes...
                  </div>
                </td>
              </tr>
            ) : equipes.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Users className="h-8 w-8" />
                    <span className="text-sm font-semibold">Aucune équipe trouvée</span>
                  </div>
                </td>
              </tr>
            ) : (
              equipes.map((equipe) => {
                const stat = stats.get(equipe.id) ?? emptyStats();

                const secteurs = (equipe.activites_json ?? []).map((a) => a.name);
                const description = secteurs.join(", ");

                const isActive = (equipe.status || "").toLowerCase() === "active";

                return (
                  <tr
                    key={equipe.id}
                    onClick={() => onSelectEquipe?.(equipe)}
                    onKeyDown={(e) => {
                      // Une ligne cliquable doit rester atteignable au clavier.
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectEquipe?.(equipe);
                      }
                    }}
                    role={onSelectEquipe ? "button" : undefined}
                    tabIndex={onSelectEquipe ? 0 : undefined}
                    aria-label={onSelectEquipe ? `Ouvrir la fiche de ${equipe.nom}` : undefined}
                    className={`transition-colors hover:bg-slate-50/70 focus:bg-slate-50/70 focus:outline-none dark:hover:bg-slate-800/20 dark:focus:bg-slate-800/20 ${
                      onSelectEquipe ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Équipe */}
                    <td className="py-4 pl-6 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: equipe.color || "#7C3AED" }}
                        >
                          {initiales(equipe.nom)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {equipe.nom}
                          </p>
                          <p className="max-w-[180px] truncate text-[11px] text-slate-400 dark:text-slate-500">
                            {description || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Secteur principal */}
                    <td className="px-4 py-4 align-middle text-slate-600 dark:text-slate-300">
                      {equipe.activite || "—"}
                    </td>

                    {/* Responsable */}
                    <td className="px-4 py-4 align-middle">
                      {equipe.chef ? (
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-violet-50 text-[10px] font-bold text-[#5C24E8] dark:border-slate-700 dark:bg-violet-950/40 dark:text-violet-300">
                            {equipe.chef.avatar ? (
                              <img
                                src={equipe.chef.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initiales(equipe.chef.name)
                            )}
                          </span>
                          <span className="truncate text-slate-700 dark:text-slate-200">
                            {equipe.chef.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Membres */}
                    <td className="px-4 py-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-200">
                      {equipe.total_membres ?? 0}
                    </td>

                    {/* Objectifs */}
                    <ObjectifCell pourcentage={stat.devenirUser.pourcentage} barClass="bg-blue-500" />
                    <ObjectifCell pourcentage={stat.comptePro.pourcentage} barClass="bg-violet-500" />
                    <ObjectifCell pourcentage={stat.soldeAds.pourcentage} barClass="bg-rose-500" />

                    {/* Leads actifs */}
                    <td className="px-4 py-4 text-center align-middle font-semibold text-slate-700 dark:text-slate-200">
                      {formatNombre(stat.leadsActifs)}
                    </td>

                    {/* Retards */}
                    <td
                      className={`px-4 py-4 text-center align-middle font-bold ${
                        stat.retards > 0
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {stat.retards}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-4 text-center align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {equipe.status || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6 text-right align-middle">
                      <div className="flex justify-end">
                        <RowActionsMenu
                          ariaLabel={`Actions pour l'équipe ${equipe.nom}`}
                          actions={[
                            {
                              label: "Afficher",
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => onSelectEquipe?.(equipe),
                              hoverClass: "hover:text-blue-600 dark:hover:text-blue-400",
                            },
                            // Absente sans le droit de modification.
                            ...(onEditEquipe
                              ? [
                                  {
                                    label: "Modifier",
                                    icon: <Pencil className="h-4 w-4" />,
                                    onClick: () => onEditEquipe(equipe),
                                    hoverClass: "hover:text-violet-600 dark:hover:text-violet-400",
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800/60 sm:flex-row">
        <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
          {isLoading
            ? "Chargement en cours..."
            : total === 0
            ? "Aucune équipe trouvée"
            : `Affichage de ${to - from + 1} équipes sur ${total}`}
        </span>

        <Pagination
          totalPages={Math.max(1, lastPage)}
          currentPage={Math.max(1, currentPage)}
          onPageChange={(page) => onPageChange?.(page)}
          alwaysShowNav
        />
      </div>
    </div>
  );
}
