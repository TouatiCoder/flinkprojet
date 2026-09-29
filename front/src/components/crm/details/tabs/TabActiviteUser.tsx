import { Power, FileText, Zap, CreditCard, Activity } from "lucide-react";
import { User } from "../../../../services/usersApi";

interface TabActiviteUserProps {
  user: User;
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return "Jamais";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime()) || diffInSeconds < 0) return "Jamais";
  if (diffInSeconds < 60) return "À l'instant";

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;

  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

function formatThreeWords(text?: string): string {
  if (!text || text === "Aucune annonce") return "Aucune annonce";
  const cleanText = text.replace(/-/g, " ");
  const words = cleanText.trim().split(/\s+/);
  if (words.length <= 3) return words.join(" ");
  return words.slice(0, 3).join("-") + " ...";
}

export default function TabActiviteUser({ user }: TabActiviteUserProps) {
  const backendActivites = (user as any)?.activites || [];

  const defaultActivities = [
    {
      id: 1,
      type: "connexion",
      title: "Dernière connexion",
      subtitle: (user as any)?.latest_connexion?.ip_address || "Session web active",
      date: (user as any)?.latest_connexion?.date_connexion || new Date().toISOString(),
    },
    {
      id: 2,
      type: "annonce",
      title: "Publication annonce",
      subtitle: "Appartement de luxe - Casablanca",
      date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 3,
      type: "boost",
      title: "Boost d'annonce",
      subtitle: "Pack Visibilité 7 jours",
      date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 4,
      type: "paiement",
      title: "Paiement effectué",
      subtitle: "Recharge Solde Ads",
      date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
  ];

  const rawList = backendActivites.length > 0 ? backendActivites : defaultActivities;

  const activities = rawList.map((act: any) => {
    let icon = <Activity className="w-4 h-4 text-slate-500" />;
    let iconBg = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    let timeDisplay = "—";
    let formattedSubtitle = act.subtitle;

    if (act.type === "connexion" || act.id === 1) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Jamais";
      icon = <Power className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    } else if (act.type === "annonce" || act.id === 2) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Il y a 5 heures";
      formattedSubtitle = formatThreeWords(act.subtitle);
      icon = <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      iconBg = "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/50";
    } else if (act.type === "boost" || act.id === 3) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Hier, 14:30";
      icon = <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      iconBg = "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50";
    } else if (act.type === "paiement" || act.id === 4) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Hier, 11:20";
      icon = <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      iconBg = "bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/50";
    }

    return {
      id: act.id,
      title: act.title,
      subtitle: formattedSubtitle,
      time: timeDisplay,
      icon,
      iconBg,
    };
  });

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-gray-800">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#5C24E8]">
          <Activity className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Activité récente de l'utilisateur
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {activities.map((activity: any) => (
          <div
            key={activity.id}
            className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-xs ${activity.iconBg}`}
              >
                {activity.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">
                  {activity.title}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {activity.subtitle}
                </p>
              </div>
            </div>
            <span className="text-[11.5px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap ml-3 mt-0.5">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}