import { User } from "../../../services/usersApi";
import UserInfo from "./UserInfo";
import UserNote from "./UserNote";
import UserAction from "./UserAction";

interface UserDetailleProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetaille({ user, isOpen, onClose }: UserDetailleProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-[90] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 top-[77px] z-[100] w-full max-w-[420px] bg-white dark:bg-gray-900 shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-[15px] font-semibold text-gray-800 dark:text-gray-100">
            Détails utilisateur
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fermer"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user ? (
            <>
              <UserInfo user={user} />
              <UserNote user={user} />
              <div className="px-6 pb-6">
                <UserAction user={user} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Aucun utilisateur sélectionné
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
