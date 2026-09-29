"use client";

import { useState, useRef } from "react";
import { PencilLine, Trash2, Loader2 } from "lucide-react";
import RoleDetaille from "./RoleDetaille/RoleDetaille";
import PermissionUpdate from "./Update/PermissionUpdate";
import RoleUpdate from "./Update/RoleUpdate";
import { 
  useGetRolesQuery, 
  useGetManagerPermissionsQuery,
  useDeleteRoleMutation 
} from "../../../services/managerRolePermissionApi";
import { useDeletePermissionMutation } from "../../../services/ManagerPermissions";

export default function RoleTable() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [isDetailleOpen, setIsDetailleOpen] = useState(false);

  const [selectedPermissionId, setSelectedPermissionId] = useState<number | string | null>(null);
  const [isEditPermissionOpen, setIsEditPermissionOpen] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState<number | string | null>(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);

  const [permissionToDelete, setPermissionToDelete] = useState<number | string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [roleToDelete, setRoleToDelete] = useState<number | string | null>(null);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);

  const { 
    data: rolesData, 
    isLoading: isLoadingRoles, 
    isError: isErrorRoles,
    refetch: refetchRoles
  } = useGetRolesQuery();

  const { 
    data: permissionsData, 
    isLoading: isLoadingPermissions, 
    isError: isErrorPermissions,
    refetch: refetchPermissions
  } = useGetManagerPermissionsQuery();

  const [deletePermission, { isLoading: isDeletingPermission }] = useDeletePermissionMutation();
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteRoleMutation();

  const rolesList: any[] = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray((rolesData as any)?.data)
    ? (rolesData as any).data
    : [];

  const permissionsList: any[] = Array.isArray(permissionsData)
    ? permissionsData
    : Array.isArray((permissionsData as any)?.data)
    ? (permissionsData as any).data
    : [];

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;

    try {
      await deletePermission(permissionToDelete).unwrap();
      setPermissionToDelete(null);
      setIsDeleteModalOpen(false);
      refetchPermissions();
    } catch (error) {
      console.error("Failed to delete permission:", error);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete).unwrap();
      setRoleToDelete(null);
      setIsDeleteRoleModalOpen(false);
      refetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 mt-8" ref={containerRef}>

      {/* 🔹 Table des Rôles */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-slate-800 dark:text-white">Liste des Rôles</h3>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[350px]">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider shadow-sm">
                <th className="py-4 px-6 w-20">ID</th>
                <th className="py-4 px-6">Nom du Rôle</th>
                <th className="py-4 px-6 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-slate-700 dark:text-slate-300">
              {isLoadingRoles ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Chargement des rôles...</span>
                    </div>
                  </td>
                </tr>
              ) : isErrorRoles ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-red-500 font-medium">
                    Échec du chargement des rôles.
                  </td>
                </tr>
              ) : rolesList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400 font-medium">
                    Aucun rôle trouvé.
                  </td>
                </tr>
              ) : (
                rolesList.map((role: any) => (
                  <tr 
                    key={role.id} 
                    onClick={() => {
                      setSelectedRole(role);
                      setIsDetailleOpen(true);
                    }}
                    className="hover:bg-gray-50/40 dark:hover:bg-gray-800/50 transition cursor-pointer"
                  >
                    <td className="py-5 px-6 font-medium text-gray-400 dark:text-gray-500">#{role.id}</td>
                    <td className="py-5 px-6 font-semibold text-slate-900 dark:text-white">{role.name}</td>
                    <td className="py-5 px-6 text-right space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoleId(role.id);
                          setIsEditRoleOpen(true);
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition cursor-pointer inline-flex items-center"
                        title="Modifier le rôle"
                      >
                        <PencilLine className="w-4 h-4" strokeWidth={2} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoleToDelete(role.id);
                          setIsDeleteRoleModalOpen(true);
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 transition cursor-pointer inline-flex items-center"
                        title="Supprimer le rôle"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-slate-800 dark:text-white">Liste des Permissions</h3>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[350px]">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider shadow-sm">
                <th className="py-4 px-6 w-20">ID</th>
                <th className="py-4 px-6">Permission</th>
                <th className="py-4 px-6 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-slate-700 dark:text-slate-300">
              {isLoadingPermissions ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Chargement des permissions...</span>
                    </div>
                  </td>
                </tr>
              ) : isErrorPermissions ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-red-500 font-medium">
                    Échec du chargement des permissions.
                  </td>
                </tr>
              ) : permissionsList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400 font-medium">
                    Aucune permission trouvée.
                  </td>
                </tr>
              ) : (
                permissionsList.map((perm: any) => {
                  const permId = perm.id || perm.permission_id;
                  const permName = perm.permission_name || perm.name;

                  return (
                    <tr key={permId || permName} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/50 transition">
                      <td className="py-5 px-6 font-medium text-gray-400 dark:text-gray-500">#{permId}</td>
                      <td className="py-5 px-6 font-semibold text-slate-900 dark:text-white">{permName}</td>
                      <td className="py-5 px-6 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedPermissionId(permId);
                            setIsEditPermissionOpen(true);
                          }}
                          className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition cursor-pointer inline-flex items-center"
                        >
                          <PencilLine className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <button
                          onClick={() => {
                            setPermissionToDelete(permId);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 transition cursor-pointer inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoleDetaille 
        isOpen={isDetailleOpen}
        onClose={() => setIsDetailleOpen(false)}
        roleId={selectedRole?.id || null}
        roleName={selectedRole?.name}
      />

      <PermissionUpdate
        isOpen={isEditPermissionOpen}
        onClose={() => setIsEditPermissionOpen(false)}
        permissionId={selectedPermissionId}
        refetchPermissions={refetchPermissions}
      />

      <RoleUpdate
        isOpen={isEditRoleOpen}
        onClose={() => setIsEditRoleOpen(false)}
        roleId={selectedRoleId}
        refetchRoles={refetchRoles}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">Delete Permission?</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to delete this permission? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePermission}
                disabled={isDeletingPermission}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeletingPermission && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeletingPermission ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteRoleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white">Delete Role?</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to delete this role? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteRoleModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                disabled={isDeletingRole}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeletingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeletingRole ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}