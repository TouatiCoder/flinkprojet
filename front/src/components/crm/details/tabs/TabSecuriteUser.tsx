import { Globe, MapPin, Wifi, ShieldCheck } from "lucide-react";
import { User, useGetUserEditQuery } from "../../../../services/usersApi";

interface TabSecuriteUserProps {
  user: User;
}

export default function TabSecuriteUser({ user }: TabSecuriteUserProps) {
  const { data: editData, isLoading: isEditLoading } = useGetUserEditQuery(
    { id: user.id },
    { skip: !user?.id }
  );

  const connexions = editData?.data?.connexions || [];

  if (isEditLoading) {
    return (
      <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-12 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
        <span className="text-xs font-medium text-slate-400">
          Chargement de l'historique des connexions...
        </span>
      </div>
    );
  }

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Sécurité & Historique des connexions
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          {connexions.length} session(s)
        </span>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {connexions.length > 0 ? (
          connexions.map((conn: any, idx: number) => (
            <div
              key={idx}
              className="bg-slate-50/80 dark:bg-gray-800/50 rounded-xl p-4 border border-slate-100 dark:border-gray-700/60 space-y-2.5 text-xs transition-all hover:border-slate-300 dark:hover:border-gray-600"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Ville</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {conn.ville || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Adresse IP</span>
                </span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {conn.ip || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Adresse MAC</span>
                </span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {conn.adresse_mac || "N/A"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
            Aucun historique de connexion disponible pour cet utilisateur.
          </p>
        )}
      </div>
    </div>
  );
}