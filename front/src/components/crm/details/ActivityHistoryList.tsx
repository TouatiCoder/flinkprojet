import { useState } from "react";
import { useGetHistoriqueActivitesQuery } from "../../../services/activiteHistoriqueApi";
import { ApiBaseUrl } from "../../../constants/publicConstants";
import { getActivityIconMeta } from "./tabs/activity/ActivityIconResolver";

interface ActivityHistoryListProps {
  userId?: number;
  etabId?: number;
  prospectId?: number;
}

export default function ActivityHistoryList({
  userId,
  etabId,
  prospectId,
}: ActivityHistoryListProps) {
  const [showAll, setShowAll] = useState(false);

  const hasEntity = Boolean(userId || etabId || prospectId);

  const { data: historiqueRes, isLoading } = useGetHistoriqueActivitesQuery(
    {
      user_id: userId,
      etab_id: etabId,
      prospect_id: prospectId,
    },
    {
      skip: !hasEntity,
    }
  );

  const list = historiqueRes?.data || [];
  const displayedList = showAll ? list : list.slice(0, 3);

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    try {
      const backendOrigin = new URL(ApiBaseUrl).origin;
      const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
      return `${backendOrigin}${cleanPath}`;
    } catch {
      const cleanBase = ApiBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
      const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
      return `${cleanBase}${cleanPath}`;
    }
  };

  if (!hasEntity) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Historique des activités terminées
        </p>

        {list.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-[12px] font-bold text-[#5C24E8] dark:text-purple-400 hover:underline cursor-pointer"
          >
            {showAll ? "Voir moins" : "Voir tout"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 divide-y divide-slate-100 dark:divide-gray-800">
        {displayedList.length > 0 ? (
          displayedList.map((item: any, idx: number) => {
            const authorAvatar = getAvatarUrl(item.created_by_avatar);
            const authorName = item.created_by_name || "Commercial";
            
            const iconMeta = getActivityIconMeta(item.type_icone || item.type_name);

            return (
              <div
                key={item.id}
                className="relative flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ring-4 ${
                        idx === 0
                          ? "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/60"
                          : "bg-blue-500 ring-blue-100 dark:ring-blue-950/60"
                      }`}
                    />
                  </div>

                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconMeta.bgClass} ${iconMeta.colorClass}`}>
                    {iconMeta.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {item.note_label || item.type_name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.formatted_date}
                    </p>
                    {item.user_note && (
                      <p className="text-slate-400 italic text-[11px] mt-0.5 truncate">
                        "{item.user_note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end justify-center gap-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-gray-600">
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      {authorName}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    Terminée
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center py-6 text-[12px] text-slate-400 dark:text-slate-500">
            Aucune activité terminée pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}