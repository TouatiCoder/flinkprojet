import type React from "react";
import {
  DollarLineIcon,
  CheckCircleIcon,
  TimeIcon,
  CloseIcon,
  BoxIcon,
  ArrowUpIcon,
} from "../../../icons"; 

export interface PaymentStat {
  label: string;
  value: string;
  footer?: string;
  footerTrend?: "up" | "neutral";
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  valueColor?: string;
  footerColor?: string;
}

interface PaymentStatCardsProps {
  totalAmount?: string;
  validatedAmount?: string;
  validatedPercent?: string;
  pendingAmount?: string;
  pendingPercent?: string;
  refusedAmount?: string;
  refusedPercent?: string;
  count?: number;
  countTrend?: string;
  totalTrend?: string;
}

const PaymentStatCards: React.FC<PaymentStatCardsProps> = ({
  totalAmount = "482 500 DH",
  totalTrend = "+12% vs mois dernier",
  validatedAmount = "421 000 DH",
  validatedPercent = "87% du total",
  pendingAmount = "48 000 DH",
  pendingPercent = "10% du total",
  refusedAmount = "13 500 DH",
  refusedPercent = "3% du total",
  count = 36,
  countTrend = "+8% vs mois dernier",
}) => {
  const stats: PaymentStat[] = [
    {
      label: "Total des paiements",
      value: totalAmount,
      footer: totalTrend,
      footerTrend: "up",
      icon: <DollarLineIcon className="size-5 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      cardBg: "bg-blue-50/70 dark:bg-blue-500/[0.08]",
    },
    {
      label: "Paiements validés",
      value: validatedAmount,
      footer: validatedPercent,
      icon: <CheckCircleIcon className="size-5 text-green-600 dark:text-green-400" />,
      iconBg: "bg-green-100 dark:bg-green-500/20",
      cardBg: "bg-green-50/70 dark:bg-green-500/[0.08]",
      valueColor: "text-green-700 dark:text-green-400",
    },
    {
      label: "En attente",
      value: pendingAmount,
      footer: pendingPercent,
      icon: <TimeIcon className="size-5 text-orange-500 dark:text-orange-400" />,
      iconBg: "bg-orange-100 dark:bg-orange-500/20",
      cardBg: "bg-orange-50/70 dark:bg-orange-500/[0.08]",
      valueColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Refusés",
      value: refusedAmount,
      footer: refusedPercent,
      icon: <CloseIcon className="size-5 text-red-500 dark:text-red-400" />,
      iconBg: "bg-red-100 dark:bg-red-500/20",
      cardBg: "bg-red-50/70 dark:bg-red-500/[0.08]",
      valueColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Nombre de paiements",
      value: String(count),
      footer: countTrend,
      footerTrend: "up",
      icon: <BoxIcon className="size-5 text-purple-600 dark:text-purple-400" />,
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      cardBg: "bg-purple-50/70 dark:bg-purple-500/[0.08]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex items-start gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-800 ${stat.cardBg}`}
        >
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}
          >
            {stat.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </span>
            <span
              className={`mt-0.5 text-lg font-semibold text-gray-800 dark:text-white/90 ${
                stat.valueColor ?? ""
              }`}
            >
              {stat.value}
            </span>
            {stat.footer && (
              <span
                className={`mt-1 flex items-center gap-1 text-xs ${
                  stat.footerTrend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {stat.footerTrend === "up" && (
                  <ArrowUpIcon className="size-3" />
                )}
                {stat.footer}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentStatCards;
