import {
  User,
  Briefcase,
  Megaphone,
  ClipboardList,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export interface ProspectStatsData {
  users?: {
    current?: number;
    actual?: number;
    target?: number;
    percentage?: number;
    periodText?: string;
    label?: string;
  };
  comptesPro?: any;
  comptes_pro?: any;
  soldeAds?: any;
  solde_ads?: any;
  prospectsATraiter?: any;
  prospects_a_traiter?: any;
  relancesEnRetard?: any;
  relances_en_retard?: any;
}

interface ProspectCardsProps {
  stats?: ProspectStatsData | any;
  isLoading?: boolean;
}

export default function ProspectCards({ stats }: ProspectCardsProps) {
  const uData = stats?.users;
  const uCurrent = uData?.actual ?? uData?.current ?? 0;
  const uTarget = uData?.target ?? 0;
  const uPercentage = uData?.percentage ?? (uTarget > 0 ? Math.round((uCurrent / uTarget) * 100) : 0);
  const uPeriod = uData?.periodText ?? uData?.label ?? "Ce mois";

  const cData = stats?.comptes_pro ?? stats?.comptesPro;
  const cCurrent = cData?.actual ?? cData?.current ?? 0;
  const cTarget = cData?.target ?? 0;
  const cPercentage = cData?.percentage ?? (cTarget > 0 ? Math.round((cCurrent / cTarget) * 100) : 0);
  const cPeriod = cData?.periodText ?? cData?.label ?? "Ce mois";

  const sData = stats?.solde_ads ?? stats?.soldeAds;
  const sCurrent = sData?.actual ?? sData?.current ?? 0;
  const sTarget = sData?.target ?? 0;
  const sPercentage = sData?.percentage ?? (sTarget > 0 ? Math.round((sCurrent / sTarget) * 100) : 0);
  const sUnit = sData?.unit ? sData.unit.toUpperCase() : "DH";
  const sPeriod = sData?.periodText ?? sData?.label ?? stats?.periode?.label ?? "Toutes les dates";

  const pData = stats?.prospects_a_traiter ?? stats?.prospectsATraiter;
  const pCount = pData?.activites_ouvertes ?? pData?.count ?? 0;
  let pTotal = pData?.total_prospects ?? pData?.total ?? pData?.totalProspects ?? 0;
  if (!pTotal && pData?.ratio_text && typeof pData.ratio_text === "string" && pData.ratio_text.includes("/")) {
    const parts = pData.ratio_text.split("/");
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      pTotal = Number(parts[1]);
    }
  }
  if (!pTotal && pData?.subText && typeof pData.subText === "string") {
    const match = pData.subText.match(/Sur\s+(\d+)\s+prospects/i);
    if (match && match[1]) {
      pTotal = Number(match[1]);
    }
  }
  const pPercentage = pTotal > 0 ? Math.round((pCount / pTotal) * 100) : 0;
  const pStatus = pData?.subtitle ?? pData?.statusText ?? "Actuel";

  const rData = stats?.relances_en_retard ?? stats?.relancesEnRetard;
  const rCount = rData?.total ?? rData?.count ?? 0;
  const rTotal = rData?.total_activites_en_cours ?? rData?.totalActivitesEnCours ?? pCount;
  const rPercentage = rTotal > 0 ? Math.round((rCount / rTotal) * 100) : 0;
  const rStatus = rData?.subtitle ?? rData?.statusText ?? "À traiter au plus vite";

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString("fr-FR").replace(/\s/g, " ");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-between min-h-[145px] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              Conversions Users
            </h4>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              {uPeriod}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[23px] font-bold text-slate-900 dark:text-white leading-none">
              {uCurrent}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              / {uTarget}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <span>{uPercentage}%</span>
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.min(uPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-between min-h-[145px] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              Conversions Pro
            </h4>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              {cPeriod}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[23px] font-bold text-slate-900 dark:text-white leading-none">
              {cCurrent}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              / {cTarget}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <span>{cPercentage}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full"
              style={{ width: `${Math.min(cPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-between min-h-[145px] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              Ventes Ads
            </h4>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              {sPeriod}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mt-2.5">
          <div className="flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
            <span className="text-[17px] sm:text-[18px] font-bold text-slate-900 dark:text-white leading-none shrink-0">
              {formatNumber(sCurrent)}
            </span>
            <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              / {formatNumber(sTarget)} {sUnit}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <span>{sPercentage}%</span>
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(sPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-between min-h-[145px] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] sm:text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              Prospects à traiter
            </h4>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              {pStatus}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mt-2.5">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
            <span className="text-[23px] font-bold text-slate-900 dark:text-white leading-none shrink-0">
              {pCount}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              / {pTotal}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
            <span>{pPercentage}%</span>
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(pPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-between min-h-[145px] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] sm:text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              Relances en retard
            </h4>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              {rStatus}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mt-2.5">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
            <span className="text-[23px] font-bold text-rose-500 leading-none shrink-0">
              {rCount}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              / {rTotal}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
            <span>{rPercentage}%</span>
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(rPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}