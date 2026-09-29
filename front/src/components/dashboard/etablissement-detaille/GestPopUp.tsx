import { mediaBaseUrl } from "../../../constants/publicConstants";
import { X, Mail, Building2, Tag } from "lucide-react";

interface GestPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  gestionnaires: any[];
  etablissementNom?: string;
}

export default function GestPopUp({
  isOpen,
  onClose,
  gestionnaires,
  etablissementNom,
}: GestPopUpProps) {
  if (!isOpen) return null;

  const isEtabList =
    gestionnaires.length > 0 &&
    (gestionnaires[0]?.nom !== undefined || gestionnaires[0]?.activite_name !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEtabList ? "Comptes Pro associés" : "Gestionnaires"}
            </h3>
            {etablissementNom && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {etablissementNom}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-1">
          {gestionnaires.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">
              {isEtabList ? "Aucun compte pro trouvé." : "Aucun gestionnaire trouvé."}
            </p>
          ) : (
            gestionnaires.map((item) => {
              const isItemEtab = item.nom !== undefined;
              const name = isItemEtab
                ? item.nom
                : `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Sans nom";

              const imageSrc = isItemEtab
                ? item.logo
                  ? item.logo.startsWith("http")
                    ? item.logo
                    : mediaBaseUrl + item.logo
                  : null
                : item.avatar
                ? item.avatar.startsWith("http")
                  ? item.avatar
                  : mediaBaseUrl + item.avatar
                : "/images/user/default-avatar-user.jpg";

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-gray-800 flex items-center justify-center">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {name}
                    </span>

                    {isItemEtab ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.activite_name && (
                          <span className="flex items-center gap-1 truncate text-[11px] font-medium text-purple-600 dark:text-purple-400">
                            <Tag className="w-3 h-3 shrink-0" />
                            {item.activite_name}
                          </span>
                        )}
                        {item.activite_name && item.email && <span>•</span>}
                        {item.email && (
                          <span className="truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" />
                            {item.email}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        {item.email || "—"}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-400 font-mono shrink-0">
                    {isItemEtab ? `CP${item.id}` : `#${item.id}`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}