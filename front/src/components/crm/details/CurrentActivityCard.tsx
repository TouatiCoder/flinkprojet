import { Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getActivityIconMeta } from "./tabs/activity/ActivityIconResolver";

interface CurrentActivityCardProps {
  activity?: any;
  onTerminer?: () => void;
  isLoading?: boolean;
  canTerminer?: boolean;
}

interface TerminerActivityButtonProps {
  onTerminer?: () => void;
  isLoading?: boolean;
  canTerminer?: boolean;
}

export function TerminerActivityButton({
  onTerminer,
  isLoading = false,
  canTerminer = true,
}: TerminerActivityButtonProps) {
  return (
    <button
      type="button"
      disabled={isLoading || !canTerminer}
      onClick={onTerminer}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-md shadow-violet-200 dark:shadow-violet-950/40 cursor-pointer ${
        !canTerminer
          ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500"
          : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98]"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      <span>{canTerminer ? "Terminer l'activité" : "Sélectionnez un résultat"}</span>
    </button>
  );
}

export default function CurrentActivityCard({
  activity,
  onTerminer,
  isLoading = false,
  canTerminer = true,
  showButton = false,
}: CurrentActivityCardProps & { showButton?: boolean }) {
  if (!activity) return null;

  const displayTitle =
    typeof activity.title === "string"
      ? activity.title
      : typeof activity.label === "string"
      ? activity.label
      : "Appel de suivi";

  let scheduledDate = "Aujourd'hui";
  let scheduledTime = activity.heure ? activity.heure.substring(0, 5) : "10:00";

  if (activity.scheduledAt) {
    scheduledDate = new Date(activity.scheduledAt).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const isLate = activity.status === "en_retard" || !!activity.delayMinutes;
  const delayText = typeof activity.retard === "string" ? activity.retard : "En retard";

  const iconMeta = getActivityIconMeta(activity.id || activity.icone || activity.title);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isLate
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
          : "bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLate
                ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                : `${iconMeta.bgClass} ${iconMeta.colorClass}`
            }`}
          >
            {iconMeta.icon}
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
              {displayTitle}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Prévu le {scheduledDate} {scheduledTime ? `à ${scheduledTime}` : ""}
            </p>
          </div>
        </div>

        {isLate && (
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 uppercase tracking-wide">
            <AlertCircle className="w-3 h-3" />
            En retard
          </span>
        )}
      </div>

      {isLate && (
        <div className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl bg-red-100 dark:bg-red-950/40">
          <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[12px] font-medium text-red-700 dark:text-red-300">
            {delayText}
          </p>
        </div>
      )}

      {activity.description && typeof activity.description === "string" && (
        <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-gray-700/60 leading-relaxed">
          {activity.description}
        </p>
      )}

      {showButton && (
        <TerminerActivityButton
          onTerminer={onTerminer}
          isLoading={isLoading}
          canTerminer={canTerminer}
        />
      )}
    </div>
  );
}