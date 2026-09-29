"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import OpportuniteFilter, {
  OpportuniteFilterState,
  OpportuniteFilterOptions,
} from "../../components/dashboard/CRM/opportunite/OpportuniteFilter";
import OpportuniteEtapes from "../../components/dashboard/CRM/opportunite/OpportuniteEtapes";
import {
  useGetPipelineQuery,
  useGetPipelineFilterDataQuery,
  useMoveCardMutation,
  ApiOpportunityCard,
  ApiOpportunityStage,
} from "../../services/opportuniteApi";
import PipelineEntityDetail from "../../components/crm/details/PipelineEntityDetail";

export const isClosedStage = (stage: ApiOpportunityStage | { name?: string; id?: string | number }) => {
  const name = (stage.name || "").toLowerCase().trim();
  const id = Number(stage.id);
  return id === 5 || id === 6 || name.includes("gagné") || name.includes("gagne") || name.includes("perdu");
};

export default function Opportunite() {
  const [filters, setFilters] = useState<OpportuniteFilterState>({
    search: "",
    commercial: "all",
    etape: "all",
    objectif: "all",
    secteur: "all",
    source: "all",
    periode: "all",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const [cards, setCards] = useState<ApiOpportunityCard[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const apiPeriode = useMemo(() => {
    switch (filters.periode) {
      case "yesterday": return "hier";
      case "today": return "aujourdhui";
      case "this_week": return "semaine";
      case "this_month": return "mois";
      case "this_year": return "annee";
      case "custom": return "custom";
      case "all": return "all";
      default: return "all";
    }
  }, [filters.periode]);

  const { data: filterOptionsRes } = useGetPipelineFilterDataQuery();

  const filterOptions: OpportuniteFilterOptions = useMemo(() => {
    const raw = filterOptionsRes?.data;
    return {
      commercials: raw?.commerciaux ? [{ id: "all", name: "Tous" }, ...raw.commerciaux] : undefined,
      etapes: raw?.etapes ? [{ id: "all", name: "Toutes" }, ...raw.etapes] : undefined,
      objectifs: raw?.objectifs ? [{ id: "all", name: "Tous" }, ...raw.objectifs] : undefined,
      secteurs: raw?.secteurs ? [{ id: "all", name: "Tous" }, ...raw.secteurs] : undefined,
      sources: raw?.sources ? [{ id: "all", name: "Toutes" }, ...raw.sources] : undefined,
    };
  }, [filterOptionsRes]);

  const { data: pipelineResponse, isLoading, isFetching, isError, error } = useGetPipelineQuery({
    commercial: filters.commercial !== "all" ? filters.commercial : undefined,
    etape: filters.etape !== "all" ? filters.etape : undefined,
    objectif: filters.objectif !== "all" ? filters.objectif : undefined,
    secteur: filters.secteur !== "all" ? filters.secteur : undefined,
    source: filters.source !== "all" ? filters.source : undefined,
    periode: apiPeriode,
    start_date: filters.periode === "custom" ? filters.startDate : undefined,
    end_date: filters.periode === "custom" ? filters.endDate : undefined,
    search: filters.search.trim() ? filters.search.trim() : undefined,
    page: page,
    per_page: 10,
  });

  const [moveCardApi] = useMoveCardMutation();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ApiOpportunityCard | null>(null);

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCard(null);
  };

  useEffect(() => {
    if (pipelineResponse?.data?.all_cards) {
      const incoming = pipelineResponse.data.all_cards;
      if (page === 1) {
        setCards(incoming);
      } else {
        setCards((prev) => {
          const existingIds = new Set(prev.map((c) => String(c.id)));
          const uniqueNew = incoming.filter((c) => !existingIds.has(String(c.id)));
          return [...prev, ...uniqueNew];
        });
      }
      setHasMore(Boolean(pipelineResponse.data.has_more));
      setIsFetchingMore(false);
    }
  }, [pipelineResponse, page]);

  const handleScroll = useCallback(() => {
    if (isFetching || isFetchingMore || !hasMore) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.offsetHeight;

    if (scrollTop + windowHeight >= docHeight - 150) {
      setIsFetchingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [isFetching, isFetchingMore, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const allStages: ApiOpportunityStage[] = pipelineResponse?.data?.pipeline || [];
  const activeStages = useMemo(() => {
    return allStages.filter((stage) => !isClosedStage(stage));
  }, [allStages]);

  const handleFilterChange = (key: keyof OpportuniteFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    setCards([]);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      commercial: "all",
      etape: "all",
      objectif: "all",
      secteur: "all",
      source: "all",
      periode: "all",
      startDate: "",
      endDate: "",
    });
    setPage(1);
    setCards([]);
  };

  const handleCardMove = async (cardId: string, targetStageId: string) => {
    const previousCards = [...cards];
    setCards((prev) =>
      prev.map((c) => (String(c.id) === String(cardId) ? { ...c, stage_id: targetStageId } : c))
    );

    try {
      await moveCardApi({
        card_id: cardId,
        target_etape_id: targetStageId,
        new_position: 0,
      }).unwrap();
    } catch (err) {
      console.error("Erreur lors du déplacement:", err);
      setCards(previousCards);
      alert("Impossible de déplacer la carte. Veuillez réessayer.");
    }
  };

  return (
    <div className="p-6 space-y-5 min-h-screen">
      <OpportuniteFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        options={filterOptions}
      />

      {isError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 rounded-xl text-xs">
          {(error as any)?.data?.message || "Erreur de connexion au serveur."}
        </div>
      )}

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Opportunités</p>

      {isLoading && page === 1 ? (
        <div className="w-full h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#5C24E8]" />
          <span className="text-xs font-medium">Chargement du pipeline...</span>
        </div>
      ) : (
        <>
          <OpportuniteEtapes
            stages={activeStages}
            cards={cards}
            onCardMove={handleCardMove}
            onAddOpportunityToStage={(stageId) => {
              console.log("Ajouter à l'étape:", stageId);
            }}
            onCardClick={(card) => {
              setSelectedCard(card);
              setIsDetailOpen(true);
            }}
          />

          {isFetchingMore && (
            <div className="w-full py-6 flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-[#5C24E8]" />
              <span className="text-xs font-semibold">Chargement des opportunités suivantes...</span>
            </div>
          )}
        </>
      )}

      <PipelineEntityDetail
        card={selectedCard}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}