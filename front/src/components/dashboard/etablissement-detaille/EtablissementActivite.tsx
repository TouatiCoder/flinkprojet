import { Etablissement } from "../../../services/etablissementsApi";

interface EtablissementActiviteProps {
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

export default function EtablissementActivite({ etablissement }: EtablissementActiviteProps) {
  const backendActivites = (etablissement as any)?.activites_recentes || [
    {
      id: 1,
      type: "activite",
      title: "Dernière activité enregistrée",
      subtitle: etablissement.derniere_activite ? getTimeAgo(etablissement.derniere_activite) : "Aucune activité",
      user_name: null,
      date: etablissement.derniere_activite,
    },
    {
      id: 2,
      type: "annonce",
      title: "Annonce",
      subtitle: "Aucune annonce",
      user_name: null,
      date: null,
    },
    {
      id: 3,
      type: "boost",
      title: "Achat boost",
      subtitle: "Aucun boost",
      user_name: null,
      date: null,
    },
    {
      id: 4,
      type: "paiement",
      title: "Paiement",
      subtitle: "Aucun paiement",
      user_name: null,
      date: null,
    },
  ];

  const activities = Array.isArray(backendActivites)
    ? backendActivites.map((act: any) => {
        let icon = null;
        let iconBg = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700";
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
          icon = (
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          );
        } else if (act.type === "annonce" || act.id === 2) {
          icon = (
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          );
          iconBg = "bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-800/50";
        } else if (act.type === "boost" || act.id === 3) {
          icon = (
            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          );
          iconBg = "bg-orange-50 dark:bg-orange-900/40 border-orange-100 dark:border-orange-800/50";
        } else if (act.type === "paiement" || act.id === 4) {
          icon = (
            <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          );
          iconBg = "bg-purple-50 dark:bg-purple-900/40 border-purple-100 dark:border-purple-800/50";
        }

        return {
          id: act.id,
          title: formattedTitle,
          subtitle: formattedSubtitle,
          userName: act.user_name || null,
          time: timeDisplay,
          icon,
          iconBg,
        };
      })
    : [];

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] p-5 mt-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Activité récente</h3>
      </div>

      <div className="flex flex-col gap-5">
        {activities.map((activity: any, index: number) => (
          <div key={activity.id || index} className="flex items-start justify-between">
            <div className="flex items-start gap-3.5 min-w-0 flex-1 pr-2">
              <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border ${activity.iconBg}`}>
                {activity.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-gray-900 dark:text-white leading-tight">
                  {activity.title}
                </p>
                <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-1 truncate" title={activity.subtitle}>
                  {activity.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-2 mt-0.5">
              <span className="text-[11.5px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                {activity.time}
              </span>
              {activity.userName && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal whitespace-nowrap mt-0.5" title={`Par ${activity.userName}`}>
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