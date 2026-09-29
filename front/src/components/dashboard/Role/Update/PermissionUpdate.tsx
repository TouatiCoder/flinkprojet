"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { 
  useGetPermissionByIdQuery, 
  useUpdatePermissionMutation 
} from "../../../../services/ManagerPermissions";

interface PermissionUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  permissionId: number | string | null;
  refetchPermissions?: () => void;
}

export default function PermissionUpdate({ isOpen, onClose, permissionId, refetchPermissions }: PermissionUpdateProps) {
  const [name, setName] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: editData, isLoading, isError } = useGetPermissionByIdQuery(permissionId!, {
    skip: !permissionId || !isOpen,
  });

  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  useEffect(() => {
    if (editData?.data?.permission) {
      setName(editData.data.permission.name || "");
      const rawSlug = editData.data.permission.slug || "";
      // Remplit le slug sans le '/' du début pour l'input
      setSlugInput(rawSlug.startsWith('/') ? rawSlug.substring(1) : rawSlug);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!permissionId || !name.trim() || !slugInput.trim()) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    // T-akkad blli l-slug kay-bdā b '/'
    const formattedSlug = slugInput.trim().startsWith('/') 
      ? slugInput.trim() 
      : `/${slugInput.trim()}`;

    try {
      await updatePermission({
        id: permissionId,
        name: name.trim(),
        slug: formattedSlug,
      }).unwrap();

      if (refetchPermissions) {
        refetchPermissions();
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to update permission:", error);
      setErrorMessage(error?.data?.message || "Error updating permission.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-xs" 
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans">

        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Edit Permission
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
            <span className="text-sm font-medium">Loading details...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500 text-sm">
            Failed to load permission details.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                  {errorMessage}
                </div>
              )}

              {/* Name Input */}
              <div>
                <label htmlFor="permName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Permission Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="permName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Gestion Utilisateurs"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                />
              </div>

              {/* Slug / Route Input */}
              <div>
                <label htmlFor="permSlug" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Slug / Route <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-gray-400 dark:text-gray-500 font-bold text-sm select-none">
                    /
                  </span>
                  <input 
                    type="text" 
                    id="permSlug"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    required
                    placeholder="utilisateurs"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  Prefix <code className="text-blue-500 font-bold">/</code> is automatically included.
                </p>
              </div>

            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
              <button 
                type="submit"
                disabled={isUpdating || !name.trim() || !slugInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-500/10 text-sm flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdating ? "Updating..." : "Update Permission"}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}