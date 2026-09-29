import React from "react";
import { Users, Crown, BarChart3, Target, Clock3 } from "lucide-react";
import { formatNombre, type ObjectifAgrege } from "./equipeStats";

interface EquipeCardsProps {
  devenirUser: ObjectifAgrege;
  comptePro: ObjectifAgrege;
  soldeAds: ObjectifAgrege;
  leadsActifs: number;
  relancesEnRetard: number;
}

/**
 * Carte « objectif » : valeur atteinte / cible + barre de progression.
 */
interface ObjectifCardProps {
  icon: React.ReactNode;
  iconWrapperClass: string;
  title: string;
  valeur: string;
  pourcentage: number;
  barClass: string;
}

const ObjectifCard: React.FC<ObjectifCardProps> = ({
  icon,
  iconWrapperClass,
  title,
  valeur,
  pourcentage,
  barClass,
}) => (
  <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
    <div className="flex items-start gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {valeur}
        </p>
      </div>
    </div>

    <div className="mt-3 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
        {pourcentage}%
      </span>
    </div>
  </div>
);

/**
 * Carte « compteur » : un seul nombre, fond teinté, pas de barre.
 */
interface CompteurCardProps {
  icon: React.ReactNode;
  cardClass: string;
  iconWrapperClass: string;
  title: string;
  valeur: number;
  valeurClass?: string;
}

const CompteurCard: React.FC<CompteurCardProps> = ({
  icon,
  cardClass,
  iconWrapperClass,
  title,
  valeur,
  valeurClass = "text-slate-900 dark:text-white",
}) => (
  <div className={`min-w-0 rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${cardClass}`}>
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{title}</p>
        <p className={`mt-0.5 text-2xl font-bold tracking-tight ${valeurClass}`}>{valeur}</p>
      </div>
    </div>
  </div>
);

export default function EquipeCards({
  devenirUser,
  comptePro,
  soldeAds,
  leadsActifs,
  relancesEnRetard,
}: EquipeCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <ObjectifCard
        icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        iconWrapperClass="bg-blue-50 dark:bg-blue-950/60"
        title="Devenir User"
        valeur={`${formatNombre(devenirUser.actuel)} / ${formatNombre(devenirUser.objectif)}`}
        pourcentage={devenirUser.pourcentage}
        barClass="bg-blue-500"
      />

      <ObjectifCard
        icon={<Crown className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
        iconWrapperClass="bg-violet-50 dark:bg-violet-950/60"
        title="Compte Pro"
        valeur={`${formatNombre(comptePro.actuel)} / ${formatNombre(comptePro.objectif)}`}
        pourcentage={comptePro.pourcentage}
        barClass="bg-violet-500"
      />

      <ObjectifCard
        icon={<BarChart3 className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        iconWrapperClass="bg-rose-50 dark:bg-rose-950/60"
        title="Solde Ads"
        valeur={`${formatNombre(soldeAds.actuel)} / ${formatNombre(soldeAds.objectif)} DH`}
        pourcentage={soldeAds.pourcentage}
        barClass="bg-rose-500"
      />

      <CompteurCard
        icon={<Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        cardClass="border-emerald-100/80 bg-emerald-50/50 dark:border-slate-800 dark:bg-[#091122]"
        iconWrapperClass="bg-emerald-100 dark:bg-emerald-950/60"
        title="Leads actifs"
        valeur={leadsActifs}
      />

      <CompteurCard
        icon={<Clock3 className="h-5 w-5 text-orange-500 dark:text-orange-400" />}
        cardClass="border-orange-100/80 bg-orange-50/50 dark:border-slate-800 dark:bg-[#091122]"
        iconWrapperClass="bg-orange-100 dark:bg-orange-950/60"
        title="Relances en retard"
        valeur={relancesEnRetard}
        valeurClass={
          relancesEnRetard > 0
            ? "text-orange-600 dark:text-orange-400"
            : "text-slate-900 dark:text-white"
        }
      />
    </div>
  );
}
