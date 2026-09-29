"use client";

import React from "react";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { useGetRoleByIdQuery } from "../../../../services/managerRolePermissionApi";

interface RoleDetailleProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | string | null;
  roleName?: string;
}

const RoleDetaille: React.FC<RoleDetailleProps> = ({
  isOpen,
  onClose,
  roleId,
  roleName,
}) => {
  const { data, isLoading, isError } = useGetRoleByIdQuery(roleId!, {
    skip: !roleId || !isOpen,
  });

  const roleData = data?.data;
  const permissions = roleData?.permissions || [];
  const currentRoleName = roleData?.name || roleName || "Role";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col font-sans`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {currentRoleName} Permissions
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              The following permissions are granted to the{" "}
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {currentRoleName}
              </span>{" "}
              role:
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading permissions...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-red-500 text-sm">
              Failed to load permissions for this role.
            </div>
          ) : permissions.length > 0 ? (
            <div className="space-y-3">
              {permissions.map((perm) => (
                <div
                  key={perm.permission_id}
                  className="flex flex-col p-3.5 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-100 dark:bg-green-900/40 p-1 rounded-md flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">
                        {perm.permission_name}
                      </span>
                    </div>

                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-2 py-0.5 rounded-md text-xs font-semibold uppercase">
                      {/* Même défaut que getScope() dans useAuthUser. */}
                      {perm.scope || "own"}
                    </span>
                  </div>

                  {perm.route_name && (
                    <div className="text-xs text-gray-400 font-mono">
                      Route: <span className="text-slate-600 dark:text-slate-300">{perm.route_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        perm.can_create
                          ? "bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 line-through opacity-50"
                      }`}
                    >
                      Create
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        perm.can_update
                          ? "bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 line-through opacity-50"
                      }`}
                    >
                      Update
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        perm.can_delete
                          ? "bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 line-through opacity-50"
                      }`}
                    >
                      Delete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No permissions assigned to this role.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoleDetaille;