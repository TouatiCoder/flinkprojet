import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { resolveAvatarUrl } from "../../utils/avatar";
import EditProfileModal from "./EditProfileModal";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { user, logout, refreshUser } = useAuth();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const avatarSrc = resolveAvatarUrl(user?.avatar);

  const userInitials =
    user?.first_name || user?.last_name
      ? `${user?.first_name?.charAt(0) || ""}${user?.last_name?.charAt(0) || ""}`.toUpperCase()
      : user?.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 cursor-pointer"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 shrink-0 border border-slate-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center font-bold text-xs text-[#5C24E8] dark:text-purple-300">
          {avatarSrc && !imgError ? (
            <img
              src={avatarSrc}
              // alt={user?.username || "User"}
              className="h-full w-full object-cover"
              onError={() => {
                console.warn("Avatar failed to load from URL:", avatarSrc);
                setImgError(true);
              }}
            />
          ) : (
            <span>{userInitials}</span>
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{user?.username}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-purple-50 dark:bg-purple-950/40 border border-slate-200 dark:border-gray-700 flex items-center justify-center font-bold text-xs text-[#5C24E8] dark:text-purple-300 shrink-0">
            {avatarSrc && !imgError ? (
              <img
                src={avatarSrc}
                // alt={user?.username || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="block font-bold text-gray-800 text-theme-sm dark:text-white truncate">
              {`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.username}
            </span>
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              tag="button"
              onItemClick={() => {
                closeDropdown();
                setIsEditProfileOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Modifier mon profil
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Account settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Support
            </DropdownItem>
          </li>
        </ul>

        <Link
          onClick={logout}
          to="/signin"
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Sign out
        </Link>
      </Dropdown>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaved={refreshUser}
      />
    </div>
  );
}