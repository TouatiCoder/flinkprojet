import { useMemo } from "react";
import { useGetManagerProfileQuery } from "../services/managerAuthApi";

export function useAuthPermissions() {
  const { data: profileResponse, isLoading, isError, refetch } = useGetManagerProfileQuery();

  const userProfile = profileResponse?.data;

  const authData = useMemo(() => {
    if (!userProfile) {
      return {
        role: null,
        allowedRoutes: [],
        isSuperAdmin: false,
      };
    }

    const roleName = userProfile.role ? userProfile.role.toLowerCase() : "";
    
    const isSuperAdmin =  roleName === "super admin" || roleName === "super-admin";

    const rawRoutes: string[] = userProfile.allowed_routes || [];

    const allowedRoutes = Array.from(new Set(["/", ...rawRoutes]));

    return {
      role: userProfile.role,
      allowedRoutes,
      isSuperAdmin,
    };
  }, [userProfile]);

  const hasAccessToRoute = (path: string): boolean => {
    if (authData.isSuperAdmin) return true;
    if (path === "/") return true;
    return authData.allowedRoutes.includes(path);
  };

  return {
    ...authData,
    hasAccessToRoute,
    isLoading,
    isError,
    refetchProfile: refetch,
  };
}