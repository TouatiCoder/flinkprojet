import { User } from "../../../services/usersApi";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import { Eye } from "lucide-react";
import UserPopUpTelephones from "./UserPopUpTelephones";
import { useState } from "react";

interface UserInfoProps {
  user: User;
}

function getRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UserInfo({ user }: UserInfoProps) {
  const avatarSrc = user.avatar
    ? mediaBaseUrl + user.avatar
    : "/images/user/default-avatar-user.jpg";

  const isActive = !!user.is_verified;

  const [isPhonePopUpOpen, setIsPhonePopUpOpen] = useState(false);

  return (
    <div className="px-6 py-6">
      <div className="flex items-start gap-4">
        <img
          src={avatarSrc}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-[72px] h-[72px] rounded-full object-cover border-2 border-gray-100 dark:border-gray-800 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white leading-tight truncate">
              {user.first_name} {user.last_name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
              {isActive ? "Actif" : "Inactif"}
            </span>
          </div>

          <p className="text-sm text-gray-400 mt-0.5">
            ID: #{user.id}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-between items-start gap-4">
        <div className="space-y-2.5 min-w-0">
          <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{user.tele || "Non renseigné"}</span>
            <button
              type="button"
              className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800 transition-colors ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhonePopUpOpen(true);
              }}
              title="Voir les utilisateurs liés"
            >
                  <Eye className="w-4 h-4" />
                </button>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{user.ville?.name || "Non renseigné"}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              CA: {Number(user.ca || 0).toLocaleString('fr-FR')} DH
            </span>
          </div>
        </div>

        <div className="text-right space-y-3 shrink-0">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mb-1">Inscription</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {user.created_at ? formatDate(user.created_at) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mb-1">Dernière connexion</p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
              {user.latest_connexion?.date_connexion
                ? getRelativeTime(user.latest_connexion.date_connexion)
                : "Jamais"}
            </p>
          </div>
        </div>
      </div>

      <UserPopUpTelephones
        isOpen={isPhonePopUpOpen}
        onClose={() => setIsPhonePopUpOpen(false)}
        relationTelephones={user.relation_telephones}
        userPhone={user.tele}
      />

    </div>
  );
}
