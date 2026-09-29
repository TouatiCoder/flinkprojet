import { User } from "../../../services/usersApi";

interface UserActionProps {
  user: User;
}

export default function UserAction({ user }: UserActionProps) {
  console.log("Actions for user:", user?.id);

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] p-5 mt-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Actions rapides</h3>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <button className="flex items-center justify-center w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors">
            Voir fiche complète
          </button>
          <button className="flex items-center justify-center w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-medium rounded-lg transition-colors shadow-sm">
            Voir annonces
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button className="flex items-center justify-center w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-medium rounded-lg transition-colors shadow-sm">
            Voir paiements
          </button>
          <button className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-medium rounded-lg transition-colors shadow-sm">
            Plus d'actions
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <button className="flex items-center justify-center gap-2 w-full mt-1.5 py-2.5 px-4 bg-red-50/50 dark:bg-red-500/10 border border-red-200/80 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[13px] font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m4.9 4.9 14.2 14.2" />
          </svg>
          Suspendre le compte
        </button>
      </div>
    </div>
  );
}
