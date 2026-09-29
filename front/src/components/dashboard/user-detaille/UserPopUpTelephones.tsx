import { X, Phone, Users } from "lucide-react";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import { RelationTelephone } from "../../../services/usersApi";

interface UserPopUpTelephonesProps {
  isOpen: boolean;
  onClose: () => void;
  relationTelephones?: RelationTelephone[];
  userPhone?: string | null;
}

export default function UserPopUpTelephones({
  isOpen,
  onClose,
  relationTelephones = [],
  userPhone,
}: UserPopUpTelephonesProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10 max-h-[85vh] flex flex-col">
        {/* Header Pop-up */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                Téléphones & Comptes associés
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Téléphone principal: <span className="font-medium text-gray-700 dark:text-gray-300">{userPhone || "Non renseigné"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {relationTelephones.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Aucun numéro trouvé.
              </p>
            </div>
          ) : (
            relationTelephones.map((rel, idx) => (
              <div
                key={rel.telephone_id || idx}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3"
              >
                {/* 🟢 Header d kulla block: Numero + Nb Comptes */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {rel.telephone_number}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5" />
                    Utilisé par {rel.usage_count} compte{rel.usage_count > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Liste des utilisateurs liés */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                  {rel.users && rel.users.length > 0 ? (
                    rel.users.map((u) => {
                      const avatarSrc = u.avatar
                        ? mediaBaseUrl + u.avatar
                        : "/images/user/default-avatar-user.jpg";

                      return (
                        <div key={u.id} className="flex items-center gap-3 p-3">
                          <img
                            src={avatarSrc}
                            alt={`${u.first_name} ${u.last_name}`}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                              {u.first_name} {u.last_name}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              {u.email}
                            </p>
                          </div>
                          <span className="text-[10.5px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                            Id: #{u.id}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 p-3 text-center">
                      Aucun utilisateur trouvé.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}