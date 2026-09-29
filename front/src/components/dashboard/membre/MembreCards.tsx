import React from "react";
import {
  Users,
  Target,
  Gauge,
  Clock3,
} from "lucide-react";

interface MembreCardsProps {
  membresActifs: number;
  totalMembres: number;

  opportunitesActives: number;
  capaciteTotale: number;

  capaciteDisponible: number;

  relancesEnRetard: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  /** Fond et bordure de la carte (teinte propre à l'indicateur). */
  cardClassName: string;
  iconWrapperClass: string;
  title: string;
  value: number | string;
  subtitle: string;
  valueClassName?: string;
  footerClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  cardClassName,
  iconWrapperClass,
  title,
  value,
  subtitle,
  valueClassName = "text-gray-900 dark:text-white",
  footerClassName = "text-gray-500 dark:text-gray-400",
}) => {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-5 shadow-sm dark:bg-gray-dark ${cardClassName}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconWrapperClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </p>

          <div className="mt-1">
            <span
              className={`text-3xl font-bold tracking-tight ${valueClassName}`}
            >
              {value}
            </span>
          </div>

          <p className={`mt-1 text-sm ${footerClassName}`}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const MembreCards: React.FC<MembreCardsProps> = ({
  membresActifs,
  totalMembres,
  opportunitesActives,
  capaciteTotale,
  capaciteDisponible,
  relancesEnRetard,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* Membres actifs */}
      <StatCard
        icon={<Users className="h-7 w-7 text-blue-600" strokeWidth={2} />}
        cardClassName="border-blue-100/80 bg-blue-50/40 dark:border-gray-800"
        iconWrapperClass="bg-blue-100 dark:bg-blue-500/10"
        title="Membres actifs"
        value={membresActifs}
        subtitle={`sur ${totalMembres} membres`}
      />

      {/* Opportunités actives */}
      <StatCard
        icon={
          <Target
            className="h-7 w-7 text-violet-600"
            strokeWidth={2}
          />
        }
        cardClassName="border-violet-100/80 bg-violet-50/40 dark:border-gray-800"
        iconWrapperClass="bg-violet-100 dark:bg-violet-500/10"
        title="Opportunités actives"
        value={opportunitesActives}
        subtitle={`sur ${capaciteTotale} de capacité`}
      />

      {/* Capacité disponible */}
      <StatCard
        icon={
          <Gauge
            className="h-7 w-7 text-emerald-600"
            strokeWidth={2}
          />
        }
        cardClassName="border-emerald-100/80 bg-emerald-50/40 dark:border-gray-800"
        iconWrapperClass="bg-emerald-100 dark:bg-emerald-500/10"
        title="Capacité disponible"
        value={capaciteDisponible}
        subtitle={`sur ${capaciteTotale}`}
      />

      {/* Relances en retard */}
      <StatCard
        icon={
          <Clock3
            className="h-7 w-7 text-orange-500"
            strokeWidth={2}
          />
        }
        cardClassName="border-orange-100/80 bg-orange-50/40 dark:border-gray-800"
        iconWrapperClass="bg-orange-100 dark:bg-orange-500/10"
        title="Relances en retard"
        value={relancesEnRetard}
        subtitle={
          relancesEnRetard > 0
            ? "À traiter au plus vite"
            : "Aucune relance en retard"
        }
        footerClassName={
          relancesEnRetard > 0
            ? "font-medium text-red-500 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400"
        }
      />
    </div>
  );
};

export default MembreCards;
