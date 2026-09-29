import { useMemo } from 'react';
import { useGetAuthUserPermissionsQuery } from '../services/userPermissionApi';

export const useAuthUser = () => {
  const { data, isLoading, isFetching, isError, refetch } = useGetAuthUserPermissionsQuery();

  const user = data?.data;
  const permissions = useMemo(() => user?.permissions || [], [user]);

  const isSuperAdmin = useMemo(() => {
    if (!user?.role_name) return false;
    // Même liste que UserManager::SUPER_ADMIN_ROLES côté backend.
    const normalizedRole = user.role_name.toLowerCase().trim();
    return (
      normalizedRole === 'admin' ||
      normalizedRole === 'super admin' ||
      normalizedRole === 'super-admin' ||
      normalizedRole === 'superadmin'
    );
  }, [user?.role_name]);

  const normalizeSlug = (str: string | null | undefined) => {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  };

  const findPermission = (slug: string) => {
    const target = normalizeSlug(slug);
    return permissions.find((p) => normalizeSlug(p.slug) === target);
  };

  const hasPermission = (slug: string): boolean => {
    if (isSuperAdmin) return true;
    return Boolean(findPermission(slug));
  };

  const canCreate = (slug: string): boolean => {
    if (isSuperAdmin) return true;
    const perm = findPermission(slug);
    if (!perm) return false;
    return perm.can_create === true || Number(perm.can_create) === 1;
  };

  const canUpdate = (slug: string): boolean => {
    if (isSuperAdmin) return true;
    const perm = findPermission(slug);
    if (!perm) return false;
    return perm.can_update === true || Number(perm.can_update) === 1;
  };

  const canDelete = (slug: string): boolean => {
    if (isSuperAdmin) return true;
    const perm = findPermission(slug);
    if (!perm) return false;
    return perm.can_delete === true || Number(perm.can_delete) === 1;
  };

  const getScope = (slug: string): 'all' | 'team' | 'own' | string => {
    if (isSuperAdmin) return 'all';
    const perm = findPermission(slug);
    return perm?.scope || 'own';
  };

  return {
    user,
    userId: user?.id,
    fullName: user ? `${user.first_name} ${user.last_name}`.trim() : '',
    roleId: user?.role_id,
    roleName: user?.role_name,
    isSuperAdmin,
    isChef: Boolean(user?.is_chef),
    equipeId: user?.equipe_id,
    permissions,
    isLoading,
    isFetching,
    isError,
    refetch,
    hasPermission,
    canCreate,
    canUpdate,
    canDelete,
    getScope,
  };
};