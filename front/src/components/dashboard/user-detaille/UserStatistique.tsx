import { User } from "../../../services/usersApi";

interface UserStatistiqueProps {
  user: User;
}

export default function UserStatistique({ user }: UserStatistiqueProps) {
  const stats = {
    annonces: Number(user.total_annonces) || 0,
    annoncesActives: Number(user.total_annonces_actives) || 0,
    favoris: user.total_favoris || 0,
    followers: user.total_followers || 0,
    vues: user.total_vues || 0,
    clicsTelephone: user.total_click_tele || 0,
    clicsWhatsapp: user.total_click_whatsapp || 0,
    signalements: 5,
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] p-5 mt-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
            <polyline points="14 2 14 8 20 8" />
            <circle cx="9" cy="16" r="3" />
            <path d="M10.5 17.5 12 19" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Statistiques rapides</h3>
      </div>

      <div className="grid grid-cols-4 gap-y-8 gap-x-2 text-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-2.5">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.annonces)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Annonces</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/50 mb-2.5">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 11 3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.annoncesActives)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">publication </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/40 border border-purple-100 dark:border-purple-800/50 mb-2.5">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.favoris)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Favoris</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-2.5">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.followers)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Followers</span>
        </div>

        <div className="flex flex-col items-center mt-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50 mb-2.5">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.vues)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Vues</span>
        </div>

        <div className="flex flex-col items-center mt-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/50 mb-2.5">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.clicsTelephone)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Téléphone</span>
        </div>

        <div className="flex flex-col items-center mt-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800/50 mb-2.5">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.clicsWhatsapp)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">WhatsApp</span>
        </div>

        <div className="flex flex-col items-center mt-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/40 border border-red-100 dark:border-red-800/50 mb-2.5">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatNumber(stats.signalements)}</span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Signalements</span>
        </div>
      </div>
    </div>
  );
}
