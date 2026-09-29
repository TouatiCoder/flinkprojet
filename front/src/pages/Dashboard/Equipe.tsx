import { useMemo, useState } from "react";
import EquipeHeader from "../../components/dashboard/Equipe/EquipeHeader";
import EquipeFilter, {
  type EquipeFilterValues,
} from "../../components/dashboard/Equipe/EquipeFilter";
import EquipeCards from "../../components/dashboard/Equipe/EquipeCards";
import EquipeDataGrid from "../../components/dashboard/Equipe/EquipeDataGrid";
import EquipeShow from "../../components/dashboard/Equipe/EquipeShow";
import EquipeInsertData from "../../components/dashboard/Equipe/EquipeInsertData";
import MembreInsertData from "../../components/dashboard/membre/MembreInsertData";
import MembreEditData from "../../components/dashboard/membre/MembreEditData";
import MembreShowData from "../../components/dashboard/membre/MembreShowData";
import {
  emptyStats,
  statsGlobales,
  statsParEquipe,
} from "../../components/dashboard/Equipe/equipeStats";
import { useGetEquipesQuery } from "../../services/equipeApi";
import { useGetMembresQuery } from "../../services/membresApi";
import { useAuthUser } from "../../hooks/useAuthUser";

const PER_PAGE = 10;
const SLUG = "equipe";

function Equipe() {
  const {
    getScope,
    canCreate,
    canUpdate,
    userId,
    equipeId,
    isLoading: isLoadingAuth,
  } = useAuthUser();
  const scope = getScope(SLUG);
  const voitTout = scope === "all";

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  // Équipe ouverte en fiche détaillée. `null` = on affiche la liste.
  const [selectedEquipeId, setSelectedEquipeId] = useState<number | null>(null);
  // Actions sur les membres depuis la fiche équipe.
  const [isAddMembreOpen, setIsAddMembreOpen] = useState(false);
  const [viewingMembreId, setViewingMembreId] = useState<number | null>(null);
  const [editingMembreId, setEditingMembreId] = useState<number | null>(null);
  const [filters, setFilters] = useState<EquipeFilterValues>({
    search: "",
    statut: "tous",
    secteur: "tous",
  });

  // ---------------------------------------------------------------------------
  // Données
  //
  // Les équipes sont chargées d'un seul bloc : la recherche et les filtres
  // statut/secteur sont appliqués côté front et doivent porter sur l'ensemble
  // des équipes, pas sur une seule page renvoyée par le serveur.
  //
  // La liste des membres sert uniquement au calcul des indicateurs : voir
  // equipeStats.ts, l'endpoint /equipes ne les fournit pas.
  // ---------------------------------------------------------------------------
  const { data: equipesRes, isLoading: isLoadingEquipes } = useGetEquipesQuery({
    page: 1,
    per_page: 100,
  });

  const { data: membresRes, isLoading: isLoadingMembres } = useGetMembresQuery();

  const toutesEquipes = useMemo(() => equipesRes?.data?.data ?? [], [equipesRes]);
  const tousMembres = useMemo(() => membresRes?.data ?? [], [membresRes]);

  // ---------------------------------------------------------------------------
  // Scope de la permission « equipe »
  //
  //  - all  : toutes les équipes, tous les membres ;
  //  - team : sa seule équipe, avec tous ses membres ;
  //  - own  : sa seule équipe, mais indicateurs et membres limités à lui-même.
  //
  // Filtrage d'affichage uniquement : /equipes et /membres renvoient tout, la
  // restriction réelle des données doit être faite côté backend.
  // ---------------------------------------------------------------------------
  const equipes = useMemo(
    () => (voitTout ? toutesEquipes : toutesEquipes.filter((equipe) => equipe.id === equipeId)),
    [toutesEquipes, voitTout, equipeId],
  );

  const membres = useMemo(() => {
    if (voitTout) {
      return tousMembres;
    }
    if (scope === "team") {
      return tousMembres.filter((membre) => membre.equipe_principale?.id === equipeId);
    }
    return tousMembres.filter((membre) => membre.id === userId);
  }, [tousMembres, voitTout, scope, equipeId, userId]);

  const stats = useMemo(() => statsParEquipe(membres), [membres]);
  const global = useMemo(() => statsGlobales(membres), [membres]);

  // ---------------------------------------------------------------------------
  // Secteurs proposés au filtre : uniquement ceux réellement rattachés à une
  // équipe, pour ne jamais offrir un filtre qui ne renverrait rien.
  // ---------------------------------------------------------------------------
  const secteurs = useMemo(() => {
    const uniques = new Set<string>();

    for (const equipe of equipes) {
      for (const activite of equipe.activites_json ?? []) {
        if (activite.name) {
          uniques.add(activite.name);
        }
      }
    }

    return [...uniques].sort((a, b) => a.localeCompare(b, "fr"));
  }, [equipes]);

  // ---------------------------------------------------------------------------
  // Filtrage
  // ---------------------------------------------------------------------------
  const equipesFiltrees = useMemo(() => {
    const recherche = filters.search.trim().toLowerCase();

    return equipes.filter((equipe) => {
      if (recherche && !(equipe.nom || "").toLowerCase().includes(recherche)) {
        return false;
      }

      if (
        filters.statut !== "tous" &&
        (equipe.status || "").toLowerCase() !== filters.statut
      ) {
        return false;
      }

      if (filters.secteur !== "tous") {
        const noms = (equipe.activites_json ?? []).map((a) => a.name);
        if (!noms.includes(filters.secteur)) {
          return false;
        }
      }

      return true;
    });
  }, [equipes, filters]);

  // ---------------------------------------------------------------------------
  // Pagination front
  // ---------------------------------------------------------------------------
  const lastPage = Math.max(1, Math.ceil(equipesFiltrees.length / PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const debut = (currentPage - 1) * PER_PAGE;
  const equipesPage = equipesFiltrees.slice(debut, debut + PER_PAGE);

  const handleFilterChange = (key: keyof EquipeFilterValues, value: string) => {
    setFilters((precedent) => ({ ...precedent, [key]: value }));
    // Un filtre plus restrictif peut supprimer la page courante.
    setPage(1);
  };

  // Tant que les permissions ne sont pas chargées, le scope vaut « own » par
  // défaut : on attend pour ne pas afficher brièvement une liste vide.
  const isLoading = isLoadingAuth || isLoadingEquipes || isLoadingMembres;

  const peutCreer = canCreate(SLUG);
  const peutModifier = canUpdate(SLUG);
  const peutAjouterMembre = canCreate("membres");
  const peutModifierMembre = canUpdate("membres");

  // ---------------------------------------------------------------------------
  // Fiche équipe
  //
  // Affichée à la place de la liste, comme le fait la page Membres. Les membres
  // viennent de /membres filtrés sur l'équipe : /equipes ne renvoie que des noms
  // (`membres_json`), sans opportunités, capacité ni retards.
  // ---------------------------------------------------------------------------
  const selectedEquipe = selectedEquipeId
    ? equipes.find((equipe) => equipe.id === selectedEquipeId) ?? null
    : null;

  const membresDeLEquipe = useMemo(
    () =>
      selectedEquipeId
        ? membres.filter((membre) => membre.equipe_principale?.id === selectedEquipeId)
        : [],
    [membres, selectedEquipeId],
  );

  // Formulaire d'édition d'un membre, partagé par la fiche équipe et la fiche
  // membre. Ajout / modification relèvent de la permission « membres », pas
  // « equipe » : c'est elle que le backend contrôle sur /membres.
  const membreEditDrawer = (
    <MembreEditData
      isOpen={!!editingMembreId}
      id={editingMembreId}
      onClose={() => setEditingMembreId(null)}
    />
  );

  // Fiche d'un membre, ouverte depuis la fiche équipe ; « Retour » y ramène.
  if (viewingMembreId) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <MembreShowData
          isOpen
          id={viewingMembreId}
          onClose={() => setViewingMembreId(null)}
          onEditMembre={(id) => {
            if (peutModifierMembre) {
              setEditingMembreId(id);
            }
          }}
        />
        {membreEditDrawer}
      </div>
    );
  }

  if (selectedEquipe) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 p-6">
        <EquipeShow
          equipe={selectedEquipe}
          stats={stats.get(selectedEquipe.id) ?? emptyStats()}
          membres={membresDeLEquipe}
          onBack={() => setSelectedEquipeId(null)}
          onEdit={
            peutModifier ? () => console.log("Modifier l'équipe:", selectedEquipe) : undefined
          }
          onAddMembre={peutAjouterMembre ? () => setIsAddMembreOpen(true) : undefined}
          onViewMembre={(membre) => setViewingMembreId(membre.id)}
          onEditMembre={
            peutModifierMembre ? (membre) => setEditingMembreId(membre.id) : undefined
          }
        />

        <MembreInsertData
          isOpen={isAddMembreOpen}
          onClose={() => setIsAddMembreOpen(false)}
          defaultEquipeId={selectedEquipe.id}
        />
        {membreEditDrawer}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <EquipeHeader
        totalEquipes={equipes.length}
        totalCommerciaux={global.commerciaux}
        onAddEquipe={peutCreer ? () => setIsAddOpen(true) : undefined}
      />

      {!isLoading && !voitTout && !equipeId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          Vous n'êtes rattaché à aucune équipe.
        </div>
      )}

      {/* Inutile hors scope « all » : une seule équipe est visible. */}
      {voitTout && (
        <EquipeFilter values={filters} secteurs={secteurs} onChange={handleFilterChange} />
      )}

      <EquipeCards
        devenirUser={global.devenirUser}
        comptePro={global.comptePro}
        soldeAds={global.soldeAds}
        leadsActifs={global.leadsActifs}
        relancesEnRetard={global.retards}
      />

      <EquipeDataGrid
        equipes={equipesPage}
        stats={stats}
        isLoading={isLoading}
        currentPage={currentPage}
        lastPage={lastPage}
        total={equipesFiltrees.length}
        from={equipesFiltrees.length === 0 ? 0 : debut + 1}
        to={debut + equipesPage.length}
        onPageChange={(nouvellePage) => setPage(nouvellePage)}
        onSelectEquipe={(equipe) => setSelectedEquipeId(equipe.id)}
        onEditEquipe={
          peutModifier
            ? (equipe) => {
                console.log("Modifier l'équipe:", equipe);
              }
            : undefined
        }
      />

      <EquipeInsertData
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmitSuccess={(data) => {
          console.log("Nouvelle équipe créée:", data);
        }}
      />
    </div>
  );
}

export default Equipe;
