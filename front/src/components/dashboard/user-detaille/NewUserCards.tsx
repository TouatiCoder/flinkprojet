import React from "react";
import { Users, Wallet, User, Clock, Shield } from "lucide-react";

export interface StatCardData {
  id: string;
  title: string;
  current: number;
  total: number;
  unit?: string;
  icon: React.ElementType;
  theme: "blue" | "green" | "orange" | "rose" | "purple";
}

const DEFAULT_CARDS: StatCardData[] = [
  {
    id: "comptes_pro",
    title: "Comptes Pro",
    current: 124,
    total: 200,
    icon: Users,
    theme: "blue",
  },
  {
    id: "solde_ads",
    title: "Solde Ads",
    current: 85000,
    total: 400000,
    unit: "DH",
    icon: Wallet,
    theme: "green",
  },
  {
    id: "users_a_traiter",
    title: "Users à traiter",
    current: 36,
    total: 50,
    icon: User,
    theme: "orange",
  },
  {
    id: "relances_retard",
    title: "Relances en retard",
    current: 12,
    total: 20,
    icon: Clock,
    theme: "rose",
  },
  {
    id: "users_non_verifies",
    title: "Users non vérifiés",
    current: 18,
    total: 30,
    icon: Shield,
    theme: "purple",
  },
];

const THEME_STYLES = {
  blue: {
    cardBg: "bg-gradient-to-br from-[#f0f7ff] to-[#ffffff] border-blue-100/60 dark:from-blue-950/20 dark:to-gray-900/60 dark:border-blue-900/30",
    iconWrapper: "bg-[#dbeafe] text-[#2563eb] dark:bg-blue-900/40 dark:text-blue-400",
    barFill: "bg-[#0284c7]",
    barBg: "bg-[#e0f2fe]",
    percentText: "text-[#0284c7]",
  },
  green: {
    cardBg: "bg-gradient-to-br from-[#f0fdf4] to-[#ffffff] border-emerald-100/60 dark:from-emerald-950/20 dark:to-gray-900/60 dark:border-emerald-900/30",
    iconWrapper: "bg-[#dcfce7] text-[#16a34a] dark:bg-emerald-900/40 dark:text-emerald-400",
    barFill: "bg-[#10b981]",
    barBg: "bg-[#d1fae5]",
    percentText: "text-[#10b981]",
  },
  orange: {
    cardBg: "bg-gradient-to-br from-[#fffaf0] to-[#ffffff] border-orange-100/60 dark:from-amber-950/20 dark:to-gray-900/60 dark:border-amber-900/30",
    iconWrapper: "bg-[#ffedd5] text-[#ea580c] dark:bg-orange-900/40 dark:text-orange-400",
    barFill: "bg-[#f97316]",
    barBg: "bg-[#ffedd5]",
    percentText: "text-[#10b981]",
  },
  rose: {
    cardBg: "bg-gradient-to-br from-[#fff1f2] to-[#ffffff] border-rose-100/60 dark:from-rose-950/20 dark:to-gray-900/60 dark:border-rose-900/30",
    iconWrapper: "bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-900/40 dark:text-rose-400",
    barFill: "bg-[#f43f5e]",
    barBg: "bg-[#ffe4e6]",
    percentText: "text-slate-800 dark:text-slate-200",
  },
  purple: {
    cardBg: "bg-gradient-to-br from-[#f5f3ff] to-[#ffffff] border-purple-100/60 dark:from-purple-950/20 dark:to-gray-900/60 dark:border-purple-900/30",
    iconWrapper: "bg-[#ede9fe] text-[#7c3aed] dark:bg-purple-900/40 dark:text-purple-400",
    barFill: "bg-[#7c3aed]",
    barBg: "bg-[#ede9fe]",
    percentText: "text-slate-800 dark:text-slate-200",
  },
};

interface NewUserCardsProps {
  cards?: StatCardData[];
}

export default function NewUserCards({ cards = DEFAULT_CARDS }: NewUserCardsProps) {
  const formatNumber = (val: number) => {
    return val.toLocaleString("fr-FR");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
      {cards.map((card) => {
        const style = THEME_STYLES[card.theme];
        const Icon = card.icon;
        const percentage = card.total > 0 ? Math.round((card.current / card.total) * 100) : 0;

        return (
          <div
            key={card.id}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl border shadow-xs transition-all hover:shadow-md ${style.cardBg}`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${style.iconWrapper}`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                {card.title}
              </p>

              <div className="flex items-baseline gap-1 text-slate-900 dark:text-white leading-none">
                <span className="text-sm font-extrabold tracking-tight">
                  {formatNumber(card.current)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  / {formatNumber(card.total)} {card.unit || ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${style.barBg} dark:bg-gray-800`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.barFill}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold shrink-0 ${style.percentText}`}>
                  {percentage}%
                </span>
              </div>

              <p className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 leading-none">
                Objectif mensuel
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}