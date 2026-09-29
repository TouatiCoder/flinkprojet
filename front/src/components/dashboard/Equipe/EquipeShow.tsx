import React from "react";
import {
  ArrowLeft,
  Pencil,
  Users,
  Tag,
  Calendar,
  Crown,
  BarChart3,
  Clock3,
  Plus,
  Eye,
} from "lucide-react";
import RowActionsMenu from "../../ui/table/RowActionsMenu";
import type { EquipeItem } from "../../../services/equipeApi";
import type { MembreItem } from "../membre/MembresTable";
import { formatNombre, type EquipeStats, type ObjectifAgrege } from "./equipeStats";

interface EquipeShowProps {
  equipe: EquipeItem;
  /** Indicateurs de cette équipe, agrégés depuis /membres (equipeStats.ts). */
  stats: EquipeStats;
  /** Commerciaux rattachés à l'équipe. */
  membres: MembreItem[];
  onBack: () => void;
  onEdit?: () => void;
  onAddMembre?: () => void;
  onViewMembre?: (membre: MembreItem) => void;
  /** Absent sans le droit de modifier les membres : l'action est masquée. */
  onEditMembre?: (membre: MembreItem) => void;
}

/** Nombre de secteurs affichés avant le badge « +N ». */
const MAX_SECTEURS_VISIBLES = 3;

const initiales = (nom: string) =>
  nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("") || "?";

/**
 * `created_at` n'est pas renvoyé aujourd'hui par EquipeController@getEquipes :
 * on affiche « — » plutôt qu'une date inventée.
 */
const formatDate = (valeur?: string | null): string => {
  if (!valeur) {
    return "—";
  }

  const date = new Date(valeur);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const estActif = (membre: MembreItem) =>
  membre.is_active === 1 || membre.is_active === true;

const SecteurBadges: React.FC<{ secteurs: string[] }> = ({ secteurs }) => {
  if (secteurs.length === 0) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  const visibles = secteurs.slice(0, MAX_SECTEURS_VISIBLES);
  const reste = secteurs.length - visibles.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibles.map((secteur) => (
        <span
          key={secteur}
          className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
        >
          {secteur}
        </span>
      ))}
      {reste > 0 && (
        <span
          title={secteurs.slice(MAX_SECTEURS_VISIBLES).join(", ")}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        >
          +{reste}
        </span>
      )}
    </div>
  );
};

const StatutPastille: React.FC<{ actif: boolean; label: string }> = ({ actif, label }) => (
  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${actif ? "bg-emerald-500" : "bg-rose-500"}`}
    />
    {label}
  </span>
);

/** Carte objectif : atteint / cible + barre. */
const ObjectifCard: React.FC<{
  icon: React.ReactNode;
  iconWrapperClass: string;
  title: string;
  objectif: ObjectifAgrege;
  suffixe?: string;
  barClass: string;
  pourcentageClass: string;
}> = ({ icon, iconWrapperClass, title, objectif, suffixe = "", barClass, pourcentageClass }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
    <div className="flex items-start gap-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {formatNombre(objectif.actuel)} / {formatNombre(objectif.objectif)}
          {suffixe}
        </p>
      </div>
    </div>

    <div className="mt-3 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${objectif.pourcentage}%` }}
        />
      </div>
      <span className={`shrink-0 text-sm font-bold ${pourcentageClass}`}>
        {objectif.pourcentage}%
      </span>
    </div>
  </div>
);

export default function EquipeShow({
  equipe,
  stats,
  membres,
  onBack,
  onEdit,
  onAddMembre,
  onViewMembre,
  onEditMembre,
}: EquipeShowProps) {
  const secteurs = (equipe.activites_json ?? []).map((a) => a.name).filter(Boolean);
  const actif = (equipe.status || "").toLowerCase() === "active";

  // `description` n'existe pas dans la table `ma_equipes` : la liste des
  // secteurs joue ce rôle, comme dans le tableau des équipes.
  const description = secteurs.join(", ");

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux équipes
      </button>

      {/* =====================================================================
          En-tête
      ====================================================================== */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ backgroundColor: equipe.color || "#7C3AED" }}
            >
              {initiales(equipe.nom)}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {equipe.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    actif
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${actif ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  {equipe.status || "—"}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                {description || "Aucun secteur rattaché."}
              </p>
            </div>
          </div>

          {/* Absent sans le droit de modification. */}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          )}
        </div>

        {/* Ligne méta */}
        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 dark:border-slate-800/60 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-violet-50 text-[11px] font-bold text-[#5C24E8] dark:border-slate-700 dark:bg-violet-950/40 dark:text-violet-300">
              {equipe.chef?.avatar ? (
                <img src={equipe.chef.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initiales(equipe.chef?.name ?? "")
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Responsable</p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {equipe.chef?.name ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Membres</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {equipe.total_membres ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Tag className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Secteur(s)</p>
              <div className="mt-1">
                <SecteurBadges secteurs={secteurs} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Créée le</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(equipe.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          Indicateurs
      ====================================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ObjectifCard
          icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          iconWrapperClass="bg-blue-50 dark:bg-blue-950/60"
          title="Devenir User"
          objectif={stats.devenirUser}
          barClass="bg-blue-500"
          pourcentageClass="text-blue-600 dark:text-blue-400"
        />
        <ObjectifCard
          icon={<Crown className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          iconWrapperClass="bg-violet-50 dark:bg-violet-950/60"
          title="Compte Pro"
          objectif={stats.comptePro}
          barClass="bg-violet-500"
          pourcentageClass="text-violet-600 dark:text-violet-400"
        />
        <ObjectifCard
          icon={<BarChart3 className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          iconWrapperClass="bg-rose-50 dark:bg-rose-950/60"
          title="Solde Ads"
          objectif={stats.soldeAds}
          suffixe=" DH"
          barClass="bg-rose-500"
          pourcentageClass="text-rose-600 dark:text-rose-400"
        />

        <div className="rounded-2xl border border-orange-100/80 bg-orange-50/50 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60">
              <Clock3 className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Opportunités en retard
              </p>
              <p
                className={`mt-0.5 text-2xl font-bold tracking-tight ${
                  stats.retards > 0
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {stats.retards}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          Informations + membres
      ====================================================================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Informations</h2>

          <dl className="mt-5 space-y-5 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Responsable</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-violet-50 text-[10px] font-bold text-[#5C24E8] dark:border-slate-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {equipe.chef?.avatar ? (
                    <img src={equipe.chef.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initiales(equipe.chef?.name ?? "")
                  )}
                </span>
                <span className="truncate font-semibold text-slate-900 dark:text-white">
                  {equipe.chef?.name ?? "—"}
                </span>
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-slate-500 dark:text-slate-400">Secteur(s)</dt>
              <dd className="min-w-0">
                <SecteurBadges secteurs={secteurs} />
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Statut</dt>
              <dd>
                <StatutPastille actif={actif} label={equipe.status || "—"} />
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Date de création</dt>
              <dd className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatDate(equipe.created_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
          <div className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Membres de l'équipe ({membres.length})
            </h2>

            {onAddMembre && (
              <button
                type="button"
                onClick={onAddMembre}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Ajouter un membre
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-[#07101e]/40">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <th className="py-3 pl-6 pr-4">Membre</th>
                  <th className="px-4 py-3 text-center">Opportunités actives</th>
                  <th className="px-4 py-3 text-center">Capacité max</th>
                  <th className="px-4 py-3 text-center">Retards</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="py-3 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {membres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Users className="h-7 w-7" />
                        <span className="text-sm font-semibold">
                          Aucun commercial rattaché à cette équipe
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  membres.map((membre) => {
                    const capacite = Number(membre.capacite_max_leads ?? 0);
                    const leads = Number(membre.leads_actifs ?? 0);
                    const retards = Number(membre.retards ?? 0);

                    return (
                      <tr
                        key={membre.id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                      >
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-violet-50 text-[10px] font-bold text-[#5C24E8] dark:border-slate-700 dark:bg-violet-950/40 dark:text-violet-300">
                              {membre.avatar ? (
                                <img
                                  src={membre.avatar}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initiales(membre.nom_complet)
                              )}
                            </span>
                            <span className="truncate font-semibold text-slate-900 dark:text-white">
                              {membre.nom_complet}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center font-semibold text-slate-700 dark:text-slate-200">
                          {leads} / {capacite}
                        </td>

                        <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300">
                          {capacite}
                        </td>

                        <td
                          className={`px-4 py-4 text-center font-bold ${
                            retards > 0
                              ? "text-rose-500 dark:text-rose-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {retards}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <StatutPastille
                            actif={estActif(membre)}
                            label={estActif(membre) ? "Actif" : "Inactif"}
                          />
                        </td>

                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex justify-end">
                            <RowActionsMenu
                              ariaLabel={`Actions pour ${membre.nom_complet}`}
                              actions={[
                                {
                                  label: "Afficher",
                                  icon: <Eye className="h-4 w-4" />,
                                  onClick: () => onViewMembre?.(membre),
                                  hoverClass: "hover:text-blue-600 dark:hover:text-blue-400",
                                },
                                ...(onEditMembre
                                  ? [
                                      {
                                        label: "Modifier",
                                        icon: <Pencil className="h-4 w-4" />,
                                        onClick: () => onEditMembre(membre),
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
        </div>
      </div>
    </div>
  );
}
