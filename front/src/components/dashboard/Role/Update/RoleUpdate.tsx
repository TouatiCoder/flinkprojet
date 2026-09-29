"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { 
  useGetRoleEditByIdQuery, 
  useUpdateRoleMutation,
  RolePermissionPayload 
} from "../../../../services/managerRolePermissionApi";

interface RoleUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | string | null;
  refetchRoles?: () => void;
}

export default function RoleUpdate({ isOpen, onClose, roleId, refetchRoles }: RoleUpdateProps) {
  const [roleName, setRoleName] = useState("");
  const [permissionsState, setPermissionsState] = useState<Record<number, RolePermissionPayload>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const { data: editData, isLoading, isError } = useGetRoleEditByIdQuery(roleId!, {
    skip: !roleId || !isOpen,
  });

  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  useEffect(() => {
    if (editData?.data) {
      setRoleName(editData.data.role.name || "");

      const initialMap: Record<number, RolePermissionPayload> = {};

      editData.data.role.permissions.forEach((p) => {
        initialMap[p.permission_id] = {
          permission_id: p.permission_id,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete,
          scope: p.scope || "own",
        };
      });

      setPermissionsState(initialMap);
    }
  }, [editData]);

  const togglePermission = (permId: number) => {
    setPermissionsState((prev) => {
      const next = { ...prev };
      if (next[permId]) {
        delete next[permId];
      } else {
        next[permId] = {
          permission_id: permId,
          can_create: false,
          can_update: false,
          can_delete: false,
          scope: "own",
        };
      }
      return next;
    });
  };

  const updatePermissionAttr = (
    permId: number, 
    field: 'can_create' | 'can_update' | 'can_delete' | 'scope', 
    value: any
  ) => {
    setPermissionsState((prev) => {
      if (!prev[permId]) return prev;
      return {
        ...prev,
        [permId]: {
          ...prev[permId],
          [field]: value,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!roleId || !roleName.trim()) {
      setErrorMessage("Please enter a role name.");
      return;
    }

    try {
      const formattedPermissions = Object.values(permissionsState);

      await updateRole({
        id: roleId,
        name: roleName.trim(),
        permissions: formattedPermissions,
      }).unwrap();

      if (refetchRoles) {
        refetchRoles();
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to update role:", error);
      setErrorMessage(error?.data?.message || "Error updating role.");
    }
  };

  if (!isOpen) return null;

  const allAvailablePermissions = editData?.data?.all_permissions || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-xs" 
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans">

        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Edit Role
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
            <span className="text-sm font-medium">Loading role details...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500 text-sm">
            Failed to load role details.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              
              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                  {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="roleNameInput" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="roleNameInput"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  placeholder="e.g. Manager, Admin..."
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Role Permissions
                </label>

                <div className="space-y-3">
                  {allAvailablePermissions.map((perm: any) => {
                    const isSelected = !!permissionsState[perm.id];
                    const permConfig = permissionsState[perm.id];

                    return (
                      <div 
                        key={perm.id} 
                        className={`p-3.5 rounded-xl border transition ${
                          isSelected 
                            ? "border-blue-200 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-900/10" 
                            : "border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-sm text-slate-800 dark:text-gray-200">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermission(perm.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                            />
                            <span>{perm.name}</span>
                          </label>

                          {perm.slug && (
                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                              {perm.slug}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={permConfig?.can_create || false}
                                  onChange={(e) => updatePermissionAttr(perm.id, 'can_create', e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                Create
                              </label>

                              <label className="flex items-center gap-1 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={permConfig?.can_update || false}
                                  onChange={(e) => updatePermissionAttr(perm.id, 'can_update', e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                Update
                              </label>

                              <label className="flex items-center gap-1 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={permConfig?.can_delete || false}
                                  onChange={(e) => updatePermissionAttr(perm.id, 'can_delete', e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                Delete
                              </label>
                            </div>

                            <select
                              value={permConfig?.scope || "own"}
                              onChange={(e) => updatePermissionAttr(perm.id, 'scope', e.target.value)}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-gray-200"
                            >
                              <option value="own">Scope: Own</option>
                              <option value="team">Scope: Team</option>
                              <option value="all">Scope: All</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-blue-500/10 text-sm flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdating ? "Updating Role..." : "Update Role"}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}