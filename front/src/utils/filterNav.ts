export interface SubItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

export interface NavItem {
  icon: React.ReactNode;
  name: string;
  subItems?: SubItem[];
}

export function filterNavByRoutes(
  navItems: NavItem[],
  allowedRoutes: string[],
  isSuperAdmin: boolean = false
): NavItem[] {
  if (isSuperAdmin) return navItems;

  return navItems
    .map((group) => {
      if (!group.subItems) return group;

      const validSubItems = group.subItems.filter((sub) =>
        allowedRoutes.includes(sub.path)
      );

      return {
        ...group,
        subItems: validSubItems,
      };
    })
    .filter((group) => !group.subItems || group.subItems.length > 0);
}