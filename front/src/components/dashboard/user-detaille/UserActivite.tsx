import { User } from "../../../services/usersApi";

interface UserActiviteProps {
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

export default function UserActivite({ user }: UserActiviteProps) {
  const backendActivites = (user as any)?.activites || [];

  const activities = backendActivites.map((act: any) => {
    let icon = null;
    let iconBg = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700";
    let timeDisplay = "—";

    let formattedSubtitle = act.subtitle;

    if (act.type === "connexion" || act.id === 1) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Jamais";
      icon = (
        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      );
    } else if (act.type === "annonce" || act.id === 2) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Il y a 5 heures";
      formattedSubtitle = formatThreeWords(act.subtitle);
      icon = (
        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    } else if (act.type === "boost" || act.id === 3) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Hier, 14:30";
      icon = (
        <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
      iconBg = "bg-orange-50 dark:bg-orange-900/40 border-orange-100 dark:border-orange-800/50";
    } else if (act.type === "paiement" || act.id === 4) {
      timeDisplay = act.date ? getTimeAgo(act.date) : "Hier, 11:20";
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
      title: act.title,
      // subtitle: act.subtitle,
      subtitle: formattedSubtitle,
      time: timeDisplay,
      icon,
      iconBg,
    };
  });

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
        {activities.map((activity: any) => (
          <div key={activity.id} className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border ${activity.iconBg}`}>
                {activity.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-gray-900 dark:text-white leading-tight">
                  {activity.title}
                </p>
                <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {activity.subtitle}
                </p>
              </div>
            </div>
            <span className="text-[11.5px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap ml-3 mt-0.5">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}