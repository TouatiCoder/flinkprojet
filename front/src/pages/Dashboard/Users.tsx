import { useState, useMemo, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UsersTable from "../../components/tables/BasicTables/UsersTable";
import Pagination from "../../components/ui/pagination/Pagination";
import { useGetUsersQuery, useGetUsersFilterDataQuery, User } from "../../services/usersApi";
// import StatCardUser, { StatItem } from "../../components/dashboard/StatCardUser";
// import {
//   GroupIcon,
//   CheckCircleIcon,
//   AlertHexaIcon,
//   AlertIcon,
// } from "../../icons";
import UserUpdate from "../../components/dashboard/user-detaille/UserUpdate";
import EntityDetailView from "../../components/crm/details/EntityDetailView";
import NewUserCards from "../../components/dashboard/user-detaille/NewUserCards";
import UsersFilter, { UsersFilterState } from "../../components/dashboard/user-detaille/UsersFilter";

// function getUserStatItems(
//   total: number,
//   totalEtablissements: number,
//   totalSignales: number,
//   totalConsommationSolde: number,
//   totalActives: number,
//   total_bloque: number,
//   totalCa: number
// ): StatItem[] {
//   return [
//     {
//       title: "Total utilisateurs",
//       value: total,
//       icon: <GroupIcon className="w-5 h-5 fill-current" />,
//       percentage: "12.5% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-blue-600",
//     },
//     {
//       title: "Actives",
//       value: totalActives,
//       icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
//       percentage: "12.5% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-emerald-500",
//     },
//     {
//       title: "Solde",
//       value: totalConsommationSolde,
//       icon: <AlertHexaIcon className="w-5 h-5 fill-current" />,
//       percentage: "4.6% ce mois",
//       isPositive: false,
//       iconBgClass: "bg-amber-500",
//     },
//     {
//       title: "Bloqué",
//       value: total_bloque,
//       icon: <AlertIcon className="w-5 h-5 fill-current" />,
//       percentage: "2.1% ce mois",
//       isPositive: false,
//       iconBgClass: "bg-red-500",
//     },
//     {
//       title: "CA",
//       value: formatNumber(totalCa),
//       icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
//       percentage: "8.3% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-emerald-500",
//     },
//     {
//       title: "Avec comptes Pro",
//       value: totalEtablissements,
//       icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
//       percentage: "8.3% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-emerald-500",
//     },
//     {
//       title: "Signalés",
//       value: totalSignales,
//       icon: <AlertIcon className="w-5 h-5 fill-current" />,
//       percentage: "2.1% ce mois",
//       isPositive: false,
//       iconBgClass: "bg-red-500",
//     },
//   ];
// }

export default function Users() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [filters, setFilters] = useState<UsersFilterState>({
    search: "",
    commercial: "all",
    secteur: "all",
    source: "all",
    verification: "all",
    compte_pro: "all",
    periode: "this_month",
    startDate: "",
    endDate: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { data: filterDataResponse } = useGetUsersFilterDataQuery();

  const filterOptions = useMemo(() => {
    const raw = filterDataResponse?.data;
    return {
      commerciaux: raw?.commerciaux,
      secteurs: raw?.secteurs,
      sources: raw?.sources,
    };
  }, [filterDataResponse]);

  const handleFilterChange = (key: keyof UsersFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      commercial: "all",
      secteur: "all",
      source: "all",
      verification: "all",
      compte_pro: "all",
      periode: "this_month",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const apiPeriode = useMemo(() => {
    switch (filters.periode) {
      case "yesterday":
        return "hier";
      case "today":
        return "aujourdhui";
      case "this_week":
        return "semaine";
      case "this_month":
        return "mois";
      case "this_year":
        return "annee";
      case "custom":
        return "custom";
      case "all":
        return "all";
      default:
        return filters.periode || "semaine";
    }
  }, [filters.periode]);

  const { data: users, isLoading: usersIsLoading } = useGetUsersQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
    commercial: filters.commercial !== "all" ? filters.commercial : undefined,
    secteur: filters.secteur !== "all" ? filters.secteur : undefined,
    source: filters.source !== "all" ? filters.source : undefined,
    verification: filters.verification !== "all" ? filters.verification : undefined,
    compte_pro: filters.compte_pro !== "all" ? filters.compte_pro : undefined,
    periode: apiPeriode,
    start_date: filters.periode === "custom" ? filters.startDate : undefined,
    end_date: filters.periode === "custom" ? filters.endDate : undefined,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<User | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleOpenUpdate = (user: User) => {
    setSelectedUserForUpdate(user);
    setIsUpdateOpen(true);
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (usersIsLoading && !users) return <div className="p-6">Chargement...</div>;

  return (
    <>
      <PageMeta
        title="Dashboard Users"
        description="Dashboard page Users Table"
      />
      <PageBreadcrumb pageTitle={`Utilisateurs (${users?.data?.total ?? 0})`} />

      <UsersFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        options={filterOptions}
      />

      {/* <StatCardUser
        items={getUserStatItems(
          users?.data.total ?? 0,
          users?.total_etablissements ?? 0,
          users?.total_signalements ?? 0,
          users?.total_consommation_solde ?? 0,
          users?.total_actives ?? 0,
          users?.total_bloque ?? 0,
          users?.total_ca ?? 0,
        )}
      /> */}

      <div className="w-full mb-5">
        <NewUserCards />
      </div>

      <div className="space-y-6">
        <UsersTable
          users={users?.data?.data ?? []}
          onRowClick={handleOpenDetail}
          onEditClick={handleOpenUpdate}
        />

        {users && users.data.total > 0 && (
          <Pagination
            totalPages={Math.ceil(users.data.total / users.data.per_page)}
            currentPage={users.data.current_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <EntityDetailView
        user={selectedUser}
        type="user"
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />

      <UserUpdate
        user={selectedUserForUpdate}
        isOpen={isUpdateOpen}
        onClose={handleCloseUpdate}
        villes={users?.villes || []}
      />
    </>
  );
}