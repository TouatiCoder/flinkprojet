import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  UserIcon,
  BoxCubeIcon,
  DocsIcon,
  BoltIcon,
  PageIcon,
  PieChartIcon,
  UserCircleIcon,
  // CalenderIcon,
  GroupIcon,
  PlugInIcon,
  DollarLineIcon,
  ChatIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuthPermissions } from "../hooks/useAuthPermissions";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; icon?: React.ReactNode }[];
};

type NavGroup = {
  name: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    name: "PRINCIPAL",
    items: [
      { name: "Accueil", path: "/home", icon: <GridIcon /> },
    ]
  },
  {
    name: "CRM",
    items: [
      { name: "Prospects", path: "/prospect", icon: <UserCircleIcon /> },
      { name: "Utilisateurs", path: "/users", icon: <UserIcon /> },
      { name: "Comptes Pro", path: "/etablissements", icon: <BoxCubeIcon /> },
      { name: "Opportunités", path: "/test", icon: <ListIcon /> },
      // { name: "Activités", path: "/activites", icon: <CalenderIcon /> },
    ]
  },
  {
    name: "FINANACE",
    items: [
      { name: "Paiements", path: "/payments", icon: <DollarLineIcon /> },
    ]
  },
  {
    name: "CONTENU",
    items: [
      { name: "Publications", path: "/publications", icon: <DocsIcon /> },
      { name: "Tags", path: "/tags", icon: <BoltIcon /> },
    ]
  },
  {
    name: "MESSAGERIE",
    items: [
      { name: "WhatsApp Templates", path: "/whatsapp/templates", icon: <ChatIcon /> },
    ]
  },
  {
    name: "ÉQUIPE COMMERCIALE",
    items: [
      { name: "Équipes commerciales", path: "/equipe", icon: <GroupIcon /> },
      { name: "Membres", path: "/membres", icon: <UserCircleIcon /> },
    ]
  },
  {
    name: "ADMINISTRATION",
    items: [
      { name: "Rôles & Permissions", path: "/role", icon: <UserCircleIcon /> },
      {
        name: "Paramètres",
        icon: <PlugInIcon />,
        subItems: [
          { name: "Pays", path: "/pays", icon: <PageIcon /> },
          { name: "Villes", path: "/villes", icon: <GridIcon /> },
          { name: "Régions", path: "/regions", icon: <PieChartIcon /> },
        ]
      }
    ]
  },
 
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const { allowedRoutes, isSuperAdmin } = useAuthPermissions();

  const filterMenuGroups = useCallback((groups: NavGroup[]): NavGroup[] => {
    if (isSuperAdmin) return groups;

    return groups
      .map((group) => {
        const filteredItems = group.items
          .map((item) => {
            if (item.path) {
              if (item.path === "/" || allowedRoutes.includes(item.path)) {
                return item;
              }
              return null;
            }

            if (item.subItems) {
              const validSubItems = item.subItems.filter(
                (sub) => sub.path === "/" || allowedRoutes.includes(sub.path)
              );

              if (validSubItems.length === 0) return null;

              return {
                ...item,
                subItems: validSubItems,
              };
            }

            return null;
          })
          .filter((item): item is NavItem => item !== null);

        if (filteredItems.length === 0) return null;

        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((group): group is NavGroup => group !== null);
  }, [allowedRoutes, isSuperAdmin]);

  const navGroupsData = useMemo(() => filterMenuGroups(navGroups), [filterMenuGroups]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    groupIndex: number;
    itemIndex: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navGroupsData.forEach((group, groupIndex) => {
      group.items.forEach((nav, itemIndex) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ groupIndex, itemIndex });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navGroupsData]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.groupIndex}-${openSubmenu.itemIndex}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (groupIndex: number, itemIndex: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.groupIndex === groupIndex &&
        prevOpenSubmenu.itemIndex === itemIndex
      ) {
        return null;
      }
      return { groupIndex, itemIndex };
    });
  };

  const renderNavGroups = () => (
    <div className="flex flex-col gap-6">
      {navGroupsData.map((group, groupIndex) => (
        <div key={group.name}>
          <div className="flex items-center gap-4 mb-2">
            <h2 style={{ textTransform: 'uppercase' }}
              className={`text-xs font-semibold  flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered
                  ? "lg:hidden"
                  : ""
              }`}
            >
              {group.name}
            </h2>
            {(!isExpanded && !isHovered) && !isMobileOpen ? (
              <div className="w-full flex justify-center">
                <HorizontaLDots className="size-6 text-gray-400" />
              </div>
            ) : null}
          </div>
          <ul className="flex flex-col gap-1">
            {group.items.map((nav, itemIndex) => {
              const isSubmenuOpen = openSubmenu?.groupIndex === groupIndex && openSubmenu?.itemIndex === itemIndex;
              const hasActiveSubItem = nav.subItems?.some(subItem => isActive(subItem.path));
              const isItemActive = nav.path && isActive(nav.path);
              const isActiveClass = isItemActive || hasActiveSubItem;
              
              return (
                <li key={nav.name}>
                  {nav.subItems ? (
                    <button
                      onClick={() => handleSubmenuToggle(groupIndex, itemIndex)}
                      className={`menu-item group ${
                        isActiveClass || isSubmenuOpen
                          ? "menu-item-active before:absolute before:inset-y-1 before:-left-5 before:w-[3px] before:bg-brand-500 before:rounded-r-full"
                          : "menu-item-inactive"
                      } cursor-pointer ${
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isActiveClass || isSubmenuOpen
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                          className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                            isSubmenuOpen
                              ? "rotate-180 text-brand-500"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                    </button>
                  ) : (
                    nav.path && (
                      <Link
                        to={nav.path}
                        className={`menu-item group ${
                          isItemActive ? "menu-item-active before:absolute before:inset-y-1 before:-left-5 before:w-[3px] before:bg-brand-500 before:rounded-r-full" : "menu-item-inactive"
                        } ${
                          !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "lg:justify-start"
                        }`}
                      >
                        <span
                          className={`menu-item-icon-size ${
                            isItemActive
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }`}
                        >
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text">{nav.name}</span>
                        )}
                      </Link>
                    )
                  )}

                  {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                    <div
                      ref={(el) => {
                        subMenuRefs.current[`${groupIndex}-${itemIndex}`] = el;
                      }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height:
                          isSubmenuOpen
                            ? `${subMenuHeight[`${groupIndex}-${itemIndex}`]}px`
                            : "0px",
                      }}
                    >
                      <ul className="mt-2 space-y-1 relative before:absolute before:left-[22px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-gray-700">
                        {nav.subItems.map((subItem) => (
                          <li key={subItem.name} className="relative">
                            <Link
                              to={subItem.path}
                              className={`menu-dropdown-item flex items-center gap-2 pl-9 ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-item-active text-brand-500"
                                  : "menu-dropdown-item-inactive"
                              }`}
                            >
                              <span
                                className={`absolute left-[19px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                                  isActive(subItem.path)
                                    ? "bg-brand-500 ring-[3px] ring-white dark:ring-gray-900"
                                    : "bg-gray-300 dark:bg-gray-600 ring-[3px] ring-white dark:ring-gray-900"
                                }`}
                              />
                              {subItem.icon && <span className="w-4 h-4 flex items-center justify-center text-gray-500">{subItem.icon}</span>}
                              <span className="text-sm">{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[200px]"
            : isHovered
            ? "w-[200px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/flinkPro_black.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/flinkPro.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/icone-flink.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          {renderNavGroups()}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;