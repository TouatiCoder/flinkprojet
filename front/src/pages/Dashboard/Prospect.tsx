import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProspectCards, { ProspectStatsData } from "../../components/dashboard/CRM/prospect/ProspectCards";
import ProspectFilter, { ProspectFilterState, ProspectFilterOptionsData } from "../../components/dashboard/CRM/prospect/ProspectFilter";
import ProspectDataUsers from "../../components/dashboard/CRM/prospect/ProspectDataUsers";
import ProspectCreateDrawer from "../../components/dashboard/CRM/prospect/ProspectCreateDrawer";
import {
  useGetProspectsQuery,
  useGetFilterResponsablesQuery,
  useGetProspectStatsCardsQuery,
  useGetProspectCreateDataQuery,
  ProspectItem,
} from "../../services/ProspectApi";
import { useGetPipelineQuery } from "../../services/opportuniteApi";
import EntityDetailView from "../../components/crm/details/EntityDetailView";
import { useAuthUser } from "../../hooks/useAuthUser";
import { Plus } from "lucide-react";

function Prospect() {
  const location = useLocation();
  const { canCreate, isSuperAdmin, isChef, getScope, userId } = useAuthUser();

  const currentSlug = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments[0] || "prospect";
  }, [location.pathname]);

  const showAddButton = isSuperAdmin || canCreate(currentSlug);
  const scope = getScope(currentSlug);
  const isSimpleCommercial = !isSuperAdmin && scope === "own" && !isChef;

  const { data: respData } = useGetFilterResponsablesQuery();
  const filterResponsablesList = respData?.data || [];

  const { data: createDataResponse } = useGetProspectCreateDataQuery();
  const { data: pipelineResponse } = useGetPipelineQuery();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selectedProspect, setSelectedProspect] = useState<ProspectItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (prospect: ProspectItem) => {
    setSelectedProspect(prospect);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedProspect(null);
  };

  const INITIAL_FILTERS: ProspectFilterState = {
    search: "",
    responsable: isSimpleCommercial && userId ? String(userId) : "all",
    etape: "all",
    objectif: "all",
    secteur: "all",
    source: "all",
    periode: "this_month",
    startDate: "",
    endDate: "",
  };

  const [filterState, setFilterState] = useState<ProspectFilterState>(INITIAL_FILTERS);

  const apiPeriode = useMemo(() => {
    switch (filterState.periode) {
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
        return "mois";
    }
  }, [filterState.periode]);

  const { data: statsResponse } = useGetProspectStatsCardsQuery({
    periode: apiPeriode,
    start_date: filterState.periode === "custom" ? filterState.startDate : undefined,
    end_date: filterState.periode === "custom" ? filterState.endDate : undefined,
    commercial: filterState.responsable !== "all" ? filterState.responsable : undefined,
    secteur: filterState.secteur !== "all" ? filterState.secteur : undefined,
    source: filterState.source !== "all" ? filterState.source : undefined,
    objectif: filterState.objectif !== "all" ? filterState.objectif : undefined,
    etape: filterState.etape !== "all" ? filterState.etape : undefined,
  } as any);

  const statsData: ProspectStatsData = useMemo(() => {
    const raw = statsResponse?.data;
    if (!raw) {
      return {
        users: { current: 0, target: 0, percentage: 0, periodText: "Cette semaine" },
        comptesPro: { current: 0, target: 0, percentage: 0, periodText: "Ce mois" },
        soldeAds: { current: 0, target: 0, percentage: 0, unit: "DH", periodText: "Cette année" },
        prospectsATraiter: { count: 0, total: 0, total_prospects: 0, statusText: "Actuel", subText: "Avec activité ouverte" },
        relancesEnRetard: { count: 0, total: 0, statusText: "Actuel", subText: "À traiter au plus vite" },
      };
    }

    return {
      ...raw,
      users: {
        ...raw.users,
        current: raw.users.actual,
        target: raw.users.target,
        percentage: raw.users.percentage,
        periodText: raw.users.label,
      },
      comptesPro: {
        ...raw.comptes_pro,
        current: raw.comptes_pro.actual,
        target: raw.comptes_pro.target,
        percentage: raw.comptes_pro.percentage,
        periodText: raw.comptes_pro.label,
      },
      soldeAds: {
        ...raw.solde_ads,
        current: raw.solde_ads.actual,
        target: raw.solde_ads.target,
        percentage: raw.solde_ads.percentage,
        unit: raw.solde_ads.unit ? raw.solde_ads.unit.toUpperCase() : "DH",
        periodText: raw.solde_ads.label,
      },
      prospectsATraiter: {
        ...raw.prospects_a_traiter,
        count: raw.prospects_a_traiter.activites_ouvertes,
        activites_ouvertes: raw.prospects_a_traiter.activites_ouvertes,
        total: raw.prospects_a_traiter.total_prospects,
        total_prospects: raw.prospects_a_traiter.total_prospects,
        statusText: "Actuel",
        subText: raw.prospects_a_traiter.total_prospects > 0
          ? `Sur ${raw.prospects_a_traiter.total_prospects} prospects`
          : raw.prospects_a_traiter.subtitle,
      },
      prospects_a_traiter: raw.prospects_a_traiter,
      relancesEnRetard: {
        ...raw.relances_en_retard,
        count: raw.relances_en_retard.total,
        total: raw.relances_en_retard.total,
        total_activites_en_cours: raw.relances_en_retard.total_activites_en_cours,
        statusText: "Actuel",
        subText: raw.relances_en_retard.subtitle,
      },
      relances_en_retard: raw.relances_en_retard,
    };
  }, [statsResponse]);

  const statsDataFilter: ProspectFilterOptionsData = useMemo(() => {
    let finalResponsables: Array<{
      id: string;
      name: string;
      role?: string;
      avatar?: string | null;
    }> = [];

    if (isSimpleCommercial) {
      finalResponsables = filterResponsablesList.map((r) => ({
        id: String(r.id),
        name: r.name,
        role: r.role,
        avatar: r.avatar,
      }));

      if (finalResponsables.length === 0 && userId) {
        finalResponsables = [{ id: String(userId), name: "Moi", role: "Commercial", avatar: null }];
      }
    } else {
      const allLabel = isChef ? "Toute mon équipe" : "Tous les commerciaux";
      finalResponsables = [
        { id: "all", name: allLabel },
        ...filterResponsablesList.map((r) => ({
          id: String(r.id),
          name: r.name,
          role: r.role,
          avatar: r.avatar,
        })),
      ];
    }

    const dbActivites = createDataResponse?.data?.activites;
    const dbInterets = createDataResponse?.data?.prospect_interets;
    const dbSources = (createDataResponse?.data as any)?.prospect_sources || (createDataResponse?.data as any)?.sources;
    const dbPipelineEtapes = pipelineResponse?.data?.pipeline;

    const secteurs = dbActivites && dbActivites.length > 0
      ? [{ id: "all", name: "Tous" }, ...dbActivites.map((a) => ({ id: String(a.id), name: a.name }))]
      : [{ id: "all", name: "Tous" }];

    const objectifs = dbInterets && dbInterets.length > 0
      ? [{ id: "all", name: "Tous" }, ...dbInterets.map((i) => ({ id: String(i.id), name: i.name }))]
      : [{ id: "all", name: "Tous" }];

    const etapes = dbPipelineEtapes && dbPipelineEtapes.length > 0
      ? [{ id: "all", name: "Toutes" }, ...dbPipelineEtapes.map((s) => ({ id: String(s.id), name: s.name }))]
      : [{ id: "all", name: "Toutes" }];

    const sources = dbSources && dbSources.length > 0
      ? [{ id: "all", name: "Toutes" }, ...dbSources.map((s: any) => ({ id: String(s.id), name: s.name }))]
      : [{ id: "all", name: "Toutes" }];

    return {
      responsables: finalResponsables,
      etapes,
      objectifs,
      secteurs,
      sources,
    };
  }, [filterResponsablesList, isSimpleCommercial, isChef, userId, createDataResponse, pipelineResponse]);

  const { data: apiResponse, isLoading, refetch } = useGetProspectsQuery({
    page: currentPage,
    per_page: perPage,
    search: filterState.search || undefined,
    secteur: filterState.secteur !== "all" ? filterState.secteur : undefined,
    commercial: filterState.responsable !== "all" ? filterState.responsable : undefined,
    objectif: filterState.objectif !== "all" ? filterState.objectif : undefined,
    etape: filterState.etape !== "all" ? filterState.etape : undefined,
    source: filterState.source !== "all" ? filterState.source : undefined,
    periode: apiPeriode,
    start_date: filterState.periode === "custom" ? filterState.startDate : undefined,
    end_date: filterState.periode === "custom" ? filterState.endDate : undefined,
  } as any);

  const paginationData = apiResponse?.data;
  const prospectsList = paginationData?.data || [];

  const totalItems = paginationData?.total || 0;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from || 0;
  const to = paginationData?.to || 0;

  const handleFilterChange = (key: keyof ProspectFilterState, value: string) => {
    setFilterState((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterState({
      search: "",
      responsable: isSimpleCommercial && userId ? String(userId) : "all",
      etape: "all",
      objectif: "all",
      secteur: "all",
      source: "all",
      periode: "this_month",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Gestion des Prospects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Suivez et qualifiez vos opportunités commerciales en temps réel
          </p>
        </div>

        {showAddButton && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C24E8] hover:bg-[#4d1ec4] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouveau prospect</span>
          </button>
        )}
      </div>

      <ProspectFilter
        filters={filterState}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onMoreFiltersClick={() => console.log("Open more filters")}
        options={statsDataFilter}
      />

      <ProspectCards stats={statsData} />

      {isLoading ? (
        <div className="w-full h-48 flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800">
          <p className="text-sm font-semibold text-slate-500">Chargement des prospects...</p>
        </div>
      ) : (
        <ProspectDataUsers
          prospects={prospectsList}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          from={from}
          to={to}
          onPageChange={setCurrentPage}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
          onActionClick={handleOpenDetail}
        />
      )}

      <ProspectCreateDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newProspect) => {
          refetch();
          if (newProspect) {
            setSelectedProspect(newProspect);
            setIsDetailOpen(true);
          }
        }}
      />

      <EntityDetailView
        prospect={selectedProspect}
        type="prospect"
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

export default Prospect;