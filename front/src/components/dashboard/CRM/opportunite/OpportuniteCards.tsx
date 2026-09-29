import { User, Building2, Wallet, Clock, Target, Info } from "lucide-react";

export interface OpportuniteStatsData {
  mesObjectifs: {
    users: { current: number; target: number; period: string; percentage: number };
    comptesPro: { current: number; target: number; period: string; percentage: number };
    soldeAds: { current: number; target: number; period: string; percentage: number };
  };
  indicateurs: {
    enRetard: { count: number; label: string };
    opportunitesOuvertes: { count: number; label: string };
  };
}

interface OpportuniteCardsProps {
  stats: OpportuniteStatsData;
}

export default function OpportuniteCards({ stats }: OpportuniteCardsProps) {
  return (
    <div className="w-full space-y-2.5">
      {/* Titres Headers */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 w-full">
        <div className="md:col-span-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Mes objectifs</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="md:col-span-2 hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Indicateurs</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Grid des 5 Cartes — Taille égale, Border et Shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        {/* Card 1: Users */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between h-[148px]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">Users</p>
              <p className="text-[10.5px] text-slate-400 truncate">Objectif quotidien</p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-bold text-slate-900 dark:text-white">
                {stats.mesObjectifs.users.current}
              </span>
              <span className="text-[12.5px] font-medium text-slate-400">
                / {stats.mesObjectifs.users.target}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10.5px] mt-0.5">
              <span className="text-slate-400">{stats.mesObjectifs.users.period}</span>
              <span className="font-bold text-purple-600">
                {stats.mesObjectifs.users.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.mesObjectifs.users.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Comptes Pro */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between h-[148px]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">Comptes Pro</p>
              <p className="text-[10.5px] text-slate-400 truncate">Objectif mensuel</p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-bold text-slate-900 dark:text-white">
                {stats.mesObjectifs.comptesPro.current}
              </span>
              <span className="text-[12.5px] font-medium text-slate-400">
                / {stats.mesObjectifs.comptesPro.target}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10.5px] mt-0.5">
              <span className="text-slate-400">{stats.mesObjectifs.comptesPro.period}</span>
              <span className="font-bold text-blue-600">
                {stats.mesObjectifs.comptesPro.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.mesObjectifs.comptesPro.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Solde Ads */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between h-[148px]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">Solde Ads</p>
              <p className="text-[10.5px] text-slate-400 truncate">Objectif annuel</p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1 text-[15px] font-bold text-slate-900 dark:text-white truncate">
              <span>{stats.mesObjectifs.soldeAds.current.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-slate-400">
                / {stats.mesObjectifs.soldeAds.target.toLocaleString()} DH
              </span>
            </div>
            <div className="flex items-center justify-between text-[10.5px] mt-0.5">
              <span className="text-slate-400">{stats.mesObjectifs.soldeAds.period}</span>
              <span className="font-bold text-emerald-600">
                {stats.mesObjectifs.soldeAds.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.mesObjectifs.soldeAds.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: En Retard */}
        <div className="p-4 rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[148px] relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/60 text-red-500 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                En retard
              </span>
            </div>
            <div className="mt-1.5">
              <span className="text-[20px] font-bold text-slate-900 dark:text-white leading-none">
                {stats.indicateurs.enRetard.count}
              </span>
              <p className="text-[10.5px] font-medium text-red-500 mt-0.5 truncate">
                {stats.indicateurs.enRetard.label}
              </p>
            </div>
          </div>
          <svg className="w-full h-6 text-red-400/60" viewBox="0 0 100 25" fill="none">
            <path d="M0 15 Q25 5 50 15 T100 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 5: Opportunités Ouvertes */}
        <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[148px] relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-500 flex items-center justify-center shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                Opportunités ouvertes
              </span>
            </div>
            <div className="mt-1.5">
              <span className="text-[20px] font-bold text-slate-900 dark:text-white leading-none">
                {stats.indicateurs.opportunitesOuvertes.count}
              </span>
              <p className="text-[10.5px] font-medium text-amber-500 mt-0.5 truncate">
                {stats.indicateurs.opportunitesOuvertes.label}
              </p>
            </div>
          </div>
          <svg className="w-full h-6 text-amber-400/60" viewBox="0 0 100 25" fill="none">
            <path d="M0 15 Q25 25 50 12 T100 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}