import { X, Globe, Wifi, MapPin } from "lucide-react";

export interface Connexion {
  adresse_mac: string;
  ip: string;
  ville: string;
}

interface UserPopUpVilleProps {
  isOpen?: boolean;
  onClose?: () => void;
  connexions?: Connexion[];
  isInline?: boolean;
}

export default function UserPopUpVille({
  isOpen,
  onClose,
  connexions = [],
  isInline = false,
}: UserPopUpVilleProps) {
  if (!isInline && !isOpen) return null;

  return (
    <>
      {!isInline && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={isInline ? "" : "fixed inset-0 z-[120] flex items-center justify-center p-4"}>
        <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl ${isInline ? 'mt-4 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] w-full' : 'shadow-xl w-full max-w-md overflow-hidden transform transition-all'}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Historique des connexions
            </h3>
            {!isInline && onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-5 max-h-[280px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {connexions.length > 0 ? (
              connexions.map((conn, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3.5 border border-gray-100 dark:border-gray-700/50 space-y-2 text-sm shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> Ville
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {conn.ville || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-medium">
                      <Globe className="w-3.5 h-3.5 text-blue-500" /> Adresse IP
                    </span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {conn.ip || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-medium">
                      <Wifi className="w-3.5 h-3.5 text-green-500" /> Adresse MAC
                    </span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {conn.adresse_mac || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                Aucun historique de connexion disponible.
              </p>
            )}
          </div>

          {!isInline && onClose && (
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 text-right">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}