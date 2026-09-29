import { useEffect, useMemo, useState } from "react";

import MembreHeader from "../../components/dashboard/membre/MembreHeader";
import MembreInsertData from "../../components/dashboard/membre/MembreInsertData";
import MembreFilter, {MembreFilterValues,} from "../../components/dashboard/membre/MembreFilter";
import MembreCards from "../../components/dashboard/membre/MembreCards";


import MembresTable, {
  MembreItem,
} from "../../components/dashboard/membre/MembresTable";

import {
  useGetMembresQuery,
  useGetFormDependenciesQuery,
} from "../../services/membresApi";

import MembreEditData from "../../components/dashboard/membre/MembreEditData";
import MembreShowData from "../../components/dashboard/membre/MembreShowData";

import {
  MembreCardsSkeleton,
  MembresTableSkeleton,
} from "../../components/dashboard/membre/MembresSkeleton";

// ============================================================
// HELPERS
// ============================================================

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isMemberActive(member: MembreItem): boolean {
  return member.is_active === 1 || member.is_active === true;
}

function isInPeriod(
  dateValue: string | undefined | null,
  dateFrom: string,
  dateTo: string
): boolean {
  // Aucune borne renseignée : la période ne filtre rien.
  if (!dateFrom && !dateTo) {
    return true;
  }

  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (dateFrom) {
    const start = new Date(`${dateFrom}T00:00:00`);

    if (date < start) {
      return false;
    }
  }

  if (dateTo) {
    // Borne haute incluse : on va jusqu'à la fin de la journée.
    const end = new Date(`${dateTo}T23:59:59`);

    if (date > end) {
      return false;
    }
  }

  return true;
}

// ============================================================
// COMPONENT
// ============================================================

function Membres() {
  // ==========================================================
  // UI STATES
  // ==========================================================

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [editingMembreId, setEditingMembreId] =
    useState<number | null>(null);

  const [viewingMembreId, setViewingMembreId] =
    useState<number | null>(null);

  const [perPage, setPerPage] = useState(10);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [filters, setFilters] =
    useState<MembreFilterValues>({
      search: "",
      equipeId: "",
      secteurId: "",
      statut: "",
      responsableId: "",
      periode: "all",
      dateFrom: "",
      dateTo: "",
    });

  // ==========================================================
  // API — DEPENDENCIES
  // ==========================================================

  const {
    data: createDataRes,
  } = useGetFormDependenciesQuery();

  // ==========================================================
  // API — MEMBERS
  // ==========================================================

  const {
    data: membresRes,
    isLoading,
    isFetching,
  } = useGetMembresQuery();

  // ==========================================================
  // MEMBERS DATA
  // ==========================================================

  const allMembres = useMemo<MembreItem[]>(
    () => membresRes?.data ?? [],
    [membresRes?.data]
  );

  const isTableLoading =
    isLoading || isFetching;

  // ==========================================================
  // EQUIPES
  // ==========================================================

  const equipesOptions =
    createDataRes?.data?.equipes?.map(
      (equipe) => ({
        id: equipe.id,
        name: equipe.nom,
      })
    ) || [];

  // ==========================================================
  // SECTEURS
  // ==========================================================

  const secteursOptions =
    createDataRes?.data?.activites?.map(
      (activite) => ({
        id: activite.id,
        name: activite.name,
      })
    ) || [];

  // ==========================================================
  // RESPONSABLES
  // ==========================================================

  const responsablesOptions = useMemo(() => {
    const responsables =
      new Map<number | string, string>();

    allMembres.forEach((membre) => {
      const responsable =
        membre.responsable;

      if (!responsable) {
        return;
      }

      const id =
        responsable.id;

      const name =
        responsable.nom || "";

      if (
        id !== undefined &&
        name
      ) {
        responsables.set(
          id,
          name
        );
      }
    });

    return Array.from(
      responsables.entries()
    ).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [allMembres]);

  // ==========================================================
  // FILTERING
  // ==========================================================

  const filteredMembres =
    useMemo(() => {
      const search =
        normalize(filters.search);

      return allMembres.filter(
        (membre) => {
          // --------------------------------------------------
          // SEARCH
          // --------------------------------------------------

          if (search) {
            const equipeNames =
              membre.equipes_accessibles
                ?.map(
                  (equipe) =>
                    equipe.nom
                )
                .join(" ") || "";

            const secteurs =
              membre.secteurs
                ?.join(" ") || "";

            const haystack =
              normalize(
                [
                  membre.nom_complet,
                  membre.email,
                  membre.role?.name || "",
                  membre.equipe_principale?.nom || "",
                  membre.responsable?.nom || "",
                  equipeNames,
                  secteurs,
                ].join(" ")
              );

            if (
              !haystack.includes(search)
            ) {
              return false;
            }
          }

          // --------------------------------------------------
          // EQUIPE
          // --------------------------------------------------

          if (
            filters.equipeId &&
            String(
              membre.equipe_principale?.id ?? ""
            ) !== filters.equipeId
          ) {
            return false;
          }

          // --------------------------------------------------
          // SECTEUR
          // --------------------------------------------------

          if (
            filters.secteurId
          ) {
            const secteurIds =
              (
                membre.secteur_ids ||
                []
              ).map(String);

            if (
              !secteurIds.includes(
                filters.secteurId
              )
            ) {
              return false;
            }
          }

          // --------------------------------------------------
          // STATUT
          // --------------------------------------------------

          if (
            filters.statut
          ) {
            const statutMembre =
              isMemberActive(membre)
                ? "actif"
                : "inactif";

            if (
              statutMembre !==
              filters.statut
            ) {
              return false;
            }
          }

          // --------------------------------------------------
          // RESPONSABLE
          // --------------------------------------------------

          if (
            filters.responsableId
          ) {
            if (
              String(
                membre.responsable?.id ??
                  ""
              ) !==
              filters.responsableId
            ) {
              return false;
            }
          }

          // --------------------------------------------------
          // PERIOD
          // --------------------------------------------------

          if (
            !isInPeriod(
              membre.created_at,
              filters.dateFrom,
              filters.dateTo
            )
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      allMembres,
      filters,
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalMembresFiltres =
    filteredMembres.length;

  const lastPage =
    Math.max(
      1,
      Math.ceil(
        totalMembresFiltres /
          perPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      lastPage
    );

  const paginatedMembres =
    useMemo(() => {
      const start =
        (safeCurrentPage - 1) *
        perPage;

      return filteredMembres.slice(
        start,
        start + perPage
      );
    }, [
      filteredMembres,
      safeCurrentPage,
      perPage,
    ]);

  // ==========================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ==========================================================
  // PROTECT CURRENT PAGE
  // ==========================================================

  useEffect(() => {
    if (
      currentPage >
      lastPage
    ) {
      setCurrentPage(lastPage);
    }
  }, [
    currentPage,
    lastPage,
  ]);

  // ==========================================================
  // KPI — MEMBRES ACTIFS
  // ==========================================================

  const membresActifs =
    allMembres.filter(
      isMemberActive
    ).length;

  // ==========================================================
  // KPI — OPPORTUNITES ACTIVES
  // ==========================================================

  const opportunitesActives =
    allMembres.reduce(
      (
        total,
        membre
      ) =>
        total +
        Number(
          membre.leads_actifs || 0
        ),
      0
    );

  // ==========================================================
  // CAPACITE TOTALE
  // ==========================================================

  const capaciteTotale =
    allMembres.reduce(
      (
        total,
        membre
      ) =>
        total +
        Number(
          membre.capacite_max_leads ||
            0
        ),
      0
    );

  // ==========================================================
  // CAPACITE DISPONIBLE
  // ==========================================================

  const capaciteDisponible =
    Math.max(
      capaciteTotale -
        opportunitesActives,
      0
    );

  // ==========================================================
  // RELANCES EN RETARD
  // ==========================================================

  const relancesEnRetard =
    allMembres.reduce(
      (
        total,
        membre
      ) =>
        total +
        Number(
          membre.retards || 0
        ),
      0
    );

  // ==========================================================
  // FILTER CHANGE
  // ==========================================================

  const handleFilterChange = (
    key: keyof MembreFilterValues,
    value: string
  ) => {
    setFilters(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    setCurrentPage(1);
  };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const handleResetFilters =
    () => {
      setFilters({
        search: "",
        equipeId: "",
        secteurId: "",
        statut: "",
        responsableId: "",
        periode: "all",
        dateFrom: "",
        dateTo: "",
      });

      setCurrentPage(1);
    };

  // ==========================================================
  // PAGE CHANGE
  // ==========================================================

  const handlePageChange =
    (newPage: number) => {
      setCurrentPage(
        Math.min(
          Math.max(
            newPage,
            1
          ),
          lastPage
        )
      );
    };

  // ==========================================================
  // PER PAGE CHANGE
  // ==========================================================

  const handlePerPageChange =
    (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    };

  // ==========================================================
  // CSV EXPORT
  // ==========================================================

  const handleExport =
    () => {
      if (
        !filteredMembres.length
      ) {
        return;
      }

      const headers = [
        "Membre",
        "Email",
        "Équipe",
        "Secteur(s)",
        "Responsable",
        "Opportunités actives",
        "Capacité",
        "Devenir User",
        "Compte Pro",
        "Solde Ads",
        "Retards",
        "Statut",
      ];

      const escapeCsvValue =
        (value: unknown) => {
          const stringValue =
            String(
              value ?? ""
            );

          return `"${stringValue.replace(
            /"/g,
            '""'
          )}"`;
        };

      const rows =
        filteredMembres.map(
          (membre) => {
            const secteurs =
              (
                membre.secteurs ||
                []
              ).join(", ");

            const responsable =
              membre.responsable?.nom ||
              "";

            return [
              membre.nom_complet,
              membre.email,
              membre.equipe_principale?.nom ||
                "",
              secteurs,
              responsable,
              membre.leads_actifs ||
                0,
              membre.capacite_max_leads ||
                0,
              membre.devenir_user?.actuel ??
                "",
              membre.compte_pro?.actuel ??
                "",
              membre.solde_ads?.actuel ??
                "",
              membre.retards ??
                0,
              isMemberActive(membre)
                ? "Actif"
                : "Inactif",
            ]
              .map(
                escapeCsvValue
              )
              .join(",");
          }
        );

      const csv = [
        headers
          .map(
            escapeCsvValue
          )
          .join(","),
        ...rows,
      ].join("\r\n");

      const blob =
        new Blob(
          ["\ufeff", csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `membres-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );
    };

  // ==========================================================
  // VIEW MEMBER
  // ==========================================================

  if (
    viewingMembreId
  ) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <MembreShowData
          isOpen={
            !!viewingMembreId
          }
          id={
            viewingMembreId
          }
          onClose={() =>
            setViewingMembreId(null)
          }
          onEditMembre={(id) => {
            setViewingMembreId(
              null
            );

            setEditingMembreId(
              id
            );
          }}
        />

        <MembreEditData
          isOpen={
            !!editingMembreId
          }
          id={
            editingMembreId
          }
          onClose={() =>
            setEditingMembreId(
              null
            )
          }
          onSubmitSuccess={(
            data
          ) => {
            console.log(
              "Membre modifié avec succès:",
              data
            );
          }}
        />
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* HEADER */}

      <MembreHeader onAddMembre={() =>setIsAddOpen(true)}/>


      {/* FILTERS */}

      <div>
        {/*
          Filters exactement comme demandé:
          Recherche
          Équipe
          Secteur
          Statut
          Responsable
          Période
        */}
        <MembreFilter
          filters={
            filters
          }
          onFilterChange={
            handleFilterChange
          }
          onResetFilters={
            handleResetFilters
          }
          equipesOptions={
            equipesOptions
          }
          secteursOptions={
            secteursOptions
          }
          responsablesOptions={
            responsablesOptions
          }
        />
      </div>

      {/* KPI */}

      <div>
        {isTableLoading ? (
          <MembreCardsSkeleton />
        ) : (
          <MembreCards
            membresActifs={ membresActifs}
            totalMembres={ allMembres.length}
            opportunitesActives={opportunitesActives}
            capaciteTotale={ capaciteTotale}
            capaciteDisponible={ capaciteDisponible  }
            relancesEnRetard={ relancesEnRetard  }
          />
        )}
      </div>


      {/* TABLE */}

      <div>
        {isTableLoading ? (
          <MembresTableSkeleton
            rows={perPage}
          />
        ) : (
          <MembresTable
            data={
              paginatedMembres
            }
            total={
              totalMembresFiltres
            }
            currentPage={
              safeCurrentPage
            }
            lastPage={
              lastPage
            }
            perPage={
              perPage
            }
            onPageChange={
              handlePageChange
            }
            onPerPageChange={
              handlePerPageChange
            }
            onViewMembre={(
              id
            ) =>
              setViewingMembreId(
                id
              )
            }
            onEditMembre={(
              id
            ) =>
              setEditingMembreId(
                id
              )
            }
            onActionClick={(
              id
            ) =>
              console.log(
                "Action membre id:",
                id
              )
            }
            onExport={
              handleExport
            }
          />
        )}
      </div>

      {/* ADD MEMBER */}

      <MembreInsertData
        isOpen={
          isAddOpen
        }
        onClose={() =>
          setIsAddOpen(false)
        }
        onSubmitSuccess={(
          data
        ) => {
          console.log(
            "Nouveau membre ajouté avec succès:",
            data
          );
        }}
      />

      {/* EDIT MEMBER */}

      <MembreEditData
        isOpen={
          !!editingMembreId
        }
        id={
          editingMembreId
        }
        onClose={() =>
          setEditingMembreId(
            null
          )
        }
        onSubmitSuccess={(
          data
        ) => {
          console.log(
            "Membre modifié avec succès:",
            data
          );
        }}
      />
    </div>
  );
}

export default Membres;