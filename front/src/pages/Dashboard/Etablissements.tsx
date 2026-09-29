import { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EtablissementsTable from "../../components/tables/BasicTables/EtablissementsTable";
import Pagination from "../../components/ui/pagination/Pagination";
import { Etablissement, useGetEtablissementsQuery } from "../../services/etablissementsApi";
import DynamicFilterBar, { FilterField } from "../../components/tables/BasicTables/DynamicFilterBar";
// import StatCardUser, { StatItem } from "../../components/dashboard/StatCardUser";
// import {
//   GroupIcon,
//   CheckCircleIcon,
//   AlertHexaIcon,
//   AlertIcon,
// } from "../../icons";
import EtablissementUpdate from "../../components/dashboard/user-detaille/EtablissementUpdate";
import EntityDetailView from "../../components/crm/details/EntityDetailView";
import NewEtablissementCards from "../../components/dashboard/etablissement-detaille/NewEtablissementCards";

// function getEtablissementStatItems(
//   total: number,
//   totalActives: number,
//   totalSolde: number | string,
//   totalCa: number,
//   totalBloque: number
// ): StatItem[] {
//   return [
//     {
//       title: "Total établissements",
//       value: total,
//       icon: <GroupIcon className="w-5 h-5 fill-current" />,
//       percentage: "10.2% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-blue-600",
//     },
//     {
//       title: "Actives",
//       value: totalActives,
//       icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
//       percentage: "5.8% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-emerald-500",
//     },
//     {
//       title: "Solde",
//       value: totalSolde,
//       icon: <AlertHexaIcon className="w-5 h-5 fill-current" />,
//       percentage: "3.1% ce mois",
//       isPositive: false,
//       iconBgClass: "bg-amber-500",
//     },
//     {
//       title: "Bloqué",
//       value: totalBloque,
//       icon: <AlertIcon className="w-5 h-5 fill-current" />,
//       percentage: "2.1% ce mois",
//       isPositive: false,
//       iconBgClass: "bg-red-500",
//     },
//     {
//       title: "CA",
//       value: `${Number(totalCa || 0).toLocaleString("fr-FR")} DH`,
//       icon: <CheckCircleIcon className="w-5 h-5 fill-current" />,
//       percentage: "8.3% ce mois",
//       isPositive: true,
//       iconBgClass: "bg-emerald-500",
//     },
//     {
//       title: "Signalés",
//       value: 5,
//       icon: <AlertIcon className="w-5 h-5 fill-current" />,
//       percentage: "1.4% ce mois",
//       isPositive: false,
//       iconBgClass: "bg-red-500",
//     },
//   ];
// }


export default function Etablissements() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    search: "",
    ville: "",
    statut: "",
    activite_id: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filterValues.search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValues.search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterValues.ville, filterValues.statut, filterValues.activite_id]);

  const { data: etablissements, isLoading: etablissementsIsLoading } = useGetEtablissementsQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
    ville_id: filterValues.ville || undefined,
    activite_id: filterValues.activite_id || undefined,
    statut: filterValues.statut || undefined,
  });

  const etablissementsFilterFields: FilterField[] = useMemo(() => {
    const villeOptions = [
      { label: "Toutes les villes", value: "" },
      ...(etablissements?.villes?.map((v) => ({
        label: v.name,
        value: String(v.id),
        status: Number(v.status),
      })) || []),
    ];

    const activiteOptions = [
      { label: "Tous les activites", value: "" },
      ...(etablissements?.activites?.map((a) => ({
        label: a.name,
        value: String(a.id),
        status: Number(a.status),
      })) || []),
    ];

    return [
      {
        id: "search",
        label: "Recherche",
        type: "text",
        placeholder: "Nom, adresse ou ID...",
      },
      {
        id: "ville",
        label: "Ville",
        type: "select",
        isSearchable: true,
        options: villeOptions,
      },
      {
        id: "statut",
        label: "Statut",
        type: "select",
        options: [
          { label: "Tous les statuts", value: "" },
          { label: "Actif", value: "actif" },
          { label: "Inactif", value: "inactif" },
        ],
      },
      {
        id: "activite_id",
        label: "Activtes",
        type: "select",
        isSearchable: true,
        options: activiteOptions,
      },
    ];
  }, [etablissements?.villes, etablissements?.activites]);

  const handleFilterChange = (id: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };

  const [selectedEtablissement, setSelectedEtablissement] = useState<Etablissement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (etablissement: Etablissement) => {
    setSelectedEtablissement(etablissement);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [selectedEtabForUpdate, setSelectedEtabForUpdate] = useState<Etablissement | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleOpenUpdate = (etab: Etablissement) => {
    setSelectedEtabForUpdate(etab);
    setIsUpdateOpen(true);
  };

  const handleCloseUpdate = () => {
    setSelectedEtabForUpdate(null);
    setIsUpdateOpen(false);
  };

  if (etablissementsIsLoading || !etablissements) return <div>Loading . . .</div>

  return (
    <>

      <PageBreadcrumb pageTitle={`Compte pro (${etablissements.data.total})`} />
      <DynamicFilterBar
        fields={etablissementsFilterFields}
        values={filterValues}
        onChange={handleFilterChange}
      />
      <PageMeta
        title="Dashboard Etablissements"
        description="Dashboard page Etablissements Table"
      />
      {/* <StatCardUser
        items={getEtablissementStatItems(
          etablissements.data.total ?? 0,
          etablissements.total_actives ?? 0,
          etablissements.total_consommation_solde ?? 0,
          etablissements.total_ca ?? 0,
          etablissements.total_bloque ?? 0,
        )}
      /> */}
      <NewEtablissementCards />
      <div className="space-y-6">
        <EtablissementsTable etablissements={etablissements.data.data} onRowClick={handleOpenDetail} onEditClick={handleOpenUpdate} />
        <Pagination
          totalPages={Math.ceil(etablissements.data.total / etablissements.data.per_page)}
          currentPage={etablissements.data.current_page}
          onPageChange={handlePageChange}
        />
      </div>

      <EntityDetailView
        etablissement={selectedEtablissement}
        type="etablissement"
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />

      <EtablissementUpdate
        etablissement={selectedEtabForUpdate}
        isOpen={isUpdateOpen}
        onClose={handleCloseUpdate}
        villes={etablissements?.villes || []}
      />
    </>
  );
}
