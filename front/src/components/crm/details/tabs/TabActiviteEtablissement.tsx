import { Power, FileText, Zap, CreditCard, Activity, User } from "lucide-react";
import { Etablissement } from "../../../../services/etablissementsApi";

interface TabActiviteEtablissementProps {
  etablissement: Etablissement;
}

function getTimeAgo(dateString?: string | null): string {
  if (!dateString) return "Jamais";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime()) || diffInSeconds < 0) return "Jamais";
  if (diffInSeconds < 60) return "À l'instant";

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} j`;

  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

export default function TabActiviteEtablissement({
  etablissement,
}: TabActiviteEtablissementProps) {
  const backendActivites = (etablissement as any)?.activites_recentes || [
    {
      id: 1,
      type: "activite",
      title: "Dernière activité enregistrée",
      subtitle: (etablissement as any).derniere_activite
        ? getTimeAgo((etablissement as any).derniere_activite)
        : "Aucune activité",
      user_name: null,
      date: (etablissement as any).derniere_activite || null,
    },
    {
      id: 2,
      type: "annonce",
      title: "Publication d'annonce",
      subtitle: "Pack Pro Annonces",
      user_name: "Gestionnaire",
      date: (etablissement as any).created_at || null,
    },
    {
      id: 3,
      type: "boost",
      title: "Achat boost visibilité",
      subtitle: "Aucun boost actif",
      user_name: null,
      date: null,
    },
    {
      id: 4,
      type: "paiement",
      title: "Paiement abonnement",
      subtitle: "Compte Pro Activé",
      user_name: null,
      date: null,
    },
  ];

  const activities = Array.isArray(backendActivites)
    ? backendActivites.map((act: any) => {
        let icon = <Activity className="w-4 h-4 text-slate-500" />;
        let iconBg = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
        const timeDisplay = act.date ? getTimeAgo(act.date) : "Jamais";

        const formattedSubtitle =
          typeof act.subtitle === "string"
            ? act.subtitle
            : act.subtitle
            ? String(act.subtitle)
            : "—";

        const formattedTitle =
          typeof act.title === "string"
            ? act.title
            : act.title
            ? String(act.title)
            : "Activité";

        if (act.type === "activite" || act.id === 1) {
          icon = <Power className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
        } else if (act.type === "annonce" || act.id === 2) {
          icon = <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
          iconBg = "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/50";
        } else if (act.type === "boost" || act.id === 3) {
          icon = <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
          iconBg = "bg-orange-50 dark:bg-orange-950/40 border-orange-200/60 dark:border-orange-800/50";
        } else if (act.type === "paiement" || act.id === 4) {
          icon = <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
          iconBg = "bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/50";
        }

        return {
          id: act.id,
          title: formattedTitle,
          subtitle: formattedSubtitle,
          userName: typeof act.user_name === "string" ? act.user_name : null,
          time: timeDisplay,
          icon,
          iconBg,
        };
      })
    : [];

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-gray-800">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#5C24E8]">
          <Activity className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Activité récente de l'établissement
        </h3>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-4">
        {activities.map((activity: any, index: number) => (
          <div
            key={activity.id || index}
            className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1 pr-2">
              <div
                className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-xs ${activity.iconBg}`}
              >
                {activity.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">
                  {activity.title}
                </p>
                <p
                  className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate"
                  title={activity.subtitle}
                >
                  {activity.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-2 mt-0.5">
              <span className="text-[11.5px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                {activity.time}
              </span>
              {activity.userName && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap mt-0.5 inline-flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Par {activity.userName}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}