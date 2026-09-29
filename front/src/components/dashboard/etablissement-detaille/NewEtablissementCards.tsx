import { Building2, Database, Users, Clock, ShieldAlert } from "lucide-react";

export interface EtablissementStatsData {
  comptes_pro_actives?: number;
  comptes_pro_total?: number;
  solde_ads_total?: number;
  solde_ads_moyenne?: number;
  pro_a_traiter?: number;
  relances_en_retard?: number;
  pro_non_verifies?: number;
}

interface NewEtablissementCardsProps {
  stats?: EtablissementStatsData;
}

export default function NewEtablissementCards({ stats }: NewEtablissementCardsProps) {
  const comptesProActives = stats?.comptes_pro_actives ?? 320;
  const soldeAdsTotal = stats?.solde_ads_total ?? 1280500;
  const soldeAdsMoyenne = stats?.solde_ads_moyenne ?? 4000;
  const proATraiter = stats?.pro_a_traiter ?? 48;
  const relancesEnRetard = stats?.relances_en_retard ?? 12;
  const proNonVerifies = stats?.pro_non_verifies ?? 28;

  const cards = [
    {
      id: "comptes_pro",
      title: "Comptes Pro activés",
      value: comptesProActives.toLocaleString("fr-FR"),
      icon: Building2,
      cardBg: "bg-gradient-to-br from-blue-50/70 via-blue-50/30 to-white dark:from-blue-950/20 dark:via-gray-900 dark:to-gray-900",
      iconBg: "bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-100/80 dark:border-blue-900/30",
      progress: {
        percentage: 80,
        barColor: "bg-emerald-500",
        trackColor: "bg-emerald-100 dark:bg-emerald-950/40",
        textColor: "text-emerald-600 dark:text-emerald-400",
      },
    },
    {
      id: "solde_ads",
      title: "Solde Ads total",
      value: `${soldeAdsTotal.toLocaleString("fr-FR")} DH`,
      subtitle: `Moyenne : ${soldeAdsMoyenne.toLocaleString("fr-FR")} DH`,
      icon: Database,
      cardBg: "bg-gradient-to-br from-purple-50/70 via-purple-50/30 to-white dark:from-purple-950/20 dark:via-gray-900 dark:to-gray-900",
      iconBg: "bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-100/80 dark:border-purple-900/30",
    },
    {
      id: "pro_a_traiter",
      title: "Pro à traiter",
      value: proATraiter.toLocaleString("fr-FR"),
      icon: Users,
      cardBg: "bg-gradient-to-br from-sky-50/70 via-sky-50/30 to-white dark:from-sky-950/20 dark:via-gray-900 dark:to-gray-900",
      iconBg: "bg-sky-100/70 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
      borderColor: "border-sky-100/80 dark:border-sky-900/30",
    },
    {
      id: "relances_retard",
      title: "Relances en retard",
      value: relancesEnRetard.toLocaleString("fr-FR"),
      icon: Clock,
      cardBg: "bg-gradient-to-br from-rose-50/70 via-rose-50/30 to-white dark:from-rose-950/20 dark:via-gray-900 dark:to-gray-900",
      iconBg: "bg-rose-100/70 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400",
      borderColor: "border-rose-100/80 dark:border-rose-900/30",
    },
    {
      id: "pro_non_verifies",
      title: "Pro non vérifiés",
      value: proNonVerifies.toLocaleString("fr-FR"),
      icon: ShieldAlert,
      cardBg: "bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-white dark:from-amber-950/20 dark:via-gray-900 dark:to-gray-900",
      iconBg: "bg-amber-100/70 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400",
      borderColor: "border-amber-100/80 dark:border-amber-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full mb-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={`relative p-4 rounded-2xl border ${card.borderColor} ${card.cardBg} shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {card.title}
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {card.value}
                </span>
              </div>
            </div>

            {card.progress && (
              <div className="mt-3 flex items-center gap-2 pl-14">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${card.progress.trackColor}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${card.progress.barColor}`}
                    style={{ width: `${card.progress.percentage}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold shrink-0 ${card.progress.textColor}`}>
                  {card.progress.percentage}%
                </span>
              </div>
            )}

            {card.subtitle && (
              <div className="mt-2 pl-14 text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                {card.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}