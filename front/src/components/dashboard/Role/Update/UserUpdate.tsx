"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { 
  useGetUserByIdQuery, 
  useUpdateUserMutation 
} from "../../../../services/managerAuthApi";

interface UserUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string | null;
  refetchUsers?: () => void;
}

export default function UserUpdate({ isOpen, onClose, userId, refetchUsers }: UserUpdateProps) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<number | string>("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: editData, isLoading, isError } = useGetUserByIdQuery(userId!, {
    skip: !userId || !isOpen,
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (editData?.data?.user) {
      const u = editData.data.user;
      setUsername(u.username || "");
      setFirstName(u.first_name || "");
      setLastName(u.last_name || "");
      setEmail(u.email || "");
      setRoleId(u.role_id || "");
      setPassword("");
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userId || !username.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !roleId) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    try {
      const payload: any = {
        id: userId,
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        role_id: Number(roleId),
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      await updateUser(payload).unwrap();

      if (refetchUsers) {
        refetchUsers();
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to update user:", error);
      setErrorMessage(error?.data?.message || "Error updating user.");
    }
  };

  if (!isOpen) return null;

  const rolesList = editData?.data?.roles || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-xs" 
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans">

        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Edit User
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading user details...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500 text-sm">
            Failed to load user details.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editFirstName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="editFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="John"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="editLastName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="editLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Doe"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editUsername" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="editUsername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="johndoe"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="editEmail" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="editEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@example.com"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="editRoleSelect" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="editRoleSelect"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-semibold text-slate-700 dark:text-white cursor-pointer"
                >
                  <option value="">Select Role</option>
                  {rolesList.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="editPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  New Password <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input 
                  type="password" 
                  id="editPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                />
              </div>

            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-500/10 text-sm flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdating ? "Updating User..." : "Update User"}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}