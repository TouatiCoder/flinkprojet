import React from "react";
import { FileText, Users, User, Briefcase } from "lucide-react";
import type { WhatsappCounts } from "./whatsappTypes";

interface WhatsappCardsProps {
  counts: WhatsappCounts;
  /** Nombre total de templates, toutes audiences et tous statuts confondus. */
  total: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  cardClass: string;
  iconWrapperClass: string;
  title: string;
  valeur: number;
  sousTitre: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  cardClass,
  iconWrapperClass,
  title,
  valeur,
  sousTitre,
}) => (
  <div className={`min-w-0 rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${cardClass}`}>
    <div className="flex items-start gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconWrapperClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {valeur}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{sousTitre}</p>
      </div>
    </div>
  </div>
);

export default function WhatsappCards({ counts, total }: WhatsappCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        cardClass="border-emerald-100/80 bg-emerald-50/40 dark:border-slate-800 dark:bg-[#091122]"
        iconWrapperClass="bg-emerald-100 dark:bg-emerald-950/60"
        title="Templates actifs"
        valeur={counts.actifs}
        sousTitre={`sur ${total} template${total > 1 ? "s" : ""}`}
      />

      <StatCard
        icon={<Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
        cardClass="border-violet-100/80 bg-violet-50/40 dark:border-slate-800 dark:bg-[#091122]"
        iconWrapperClass="bg-violet-100 dark:bg-violet-950/60"
        title="Prospect"
        valeur={counts.prospect}
        sousTitre="templates ciblant les prospects"
      />

      <StatCard
        icon={<User className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        cardClass="border-blue-100/80 bg-blue-50/40 dark:border-slate-800 dark:bg-[#091122]"
        iconWrapperClass="bg-blue-100 dark:bg-blue-950/60"
        title="User"
        valeur={counts.user}
        sousTitre="templates ciblant les users"
      />

      <StatCard
        icon={<Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
        cardClass="border-amber-100/80 bg-amber-50/40 dark:border-slate-800 dark:bg-[#091122]"
        iconWrapperClass="bg-amber-100 dark:bg-amber-950/60"
        title="Compte Pro"
        valeur={counts.comptePro}
        sousTitre="templates ciblant les comptes pro"
      />
    </div>
  );
}
