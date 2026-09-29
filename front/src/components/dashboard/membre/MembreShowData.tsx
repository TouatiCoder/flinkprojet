import MembreShow, {
  MembreShowData as MembreShowDataType,
  MembreShowActivite,
} from "./MembreShow";
import { MembreItem } from "./MembresTable";
import {
  useGetMembreByIdQuery,
  useGetMembresQuery,
  type MembreActiviteRecente,
} from "../../../services/membresApi";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface MembreShowDataProps {
  isOpen: boolean;
  id: number | null;
  onClose: () => void;
  onEditMembre: (id: number) => void;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatMembreDepuisLe(
  createdAt?: string | null,
): string {
  if (!createdAt) {
    return "—";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Formate une date d'activité ("2026-09-16") au format « 16 sept. 2026 ».
 */
function formatActiviteDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formate une heure d'activité ("13:20:44") en « 13:20 ».
 */
function formatActiviteHeure(value?: string | null): string {
  if (!value) {
    return "";
  }

  const parts = value.split(":");

  return parts.length >= 2
    ? `${parts[0]}:${parts[1]}`
    : value;
}

/**
 * Formate la prochaine action renvoyée par l'API ("2026-09-18 10:00:00") sur
 * deux lignes : date puis heure, comme dans la colonne du tableau.
 * Renvoie null si la donnée est absente : la colonne affiche alors « — ».
 */
function formatProchaineAction(
  value?: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const [datePart, heurePart] = value.split(" ");

  const dateLabel = formatActiviteDate(datePart);

  const heureLabel = formatActiviteHeure(heurePart);

  return heureLabel
    ? `${dateLabel}\n${heureLabel}`
    : dateLabel;
}

/**
 * Convertit une activité de l'API vers le format attendu par MembreShow.
 * Aucune valeur n'est inventée : les champs absents restent vides.
 */
function toActiviteShow(
  activite: MembreActiviteRecente,
): MembreShowActivite {
  return {
    id: activite.id,

    date: formatActiviteDate(activite.date),

    heure: formatActiviteHeure(activite.heure),

    type: activite.type,

    typeLabel: activite.type_label,

    prospect: activite.prospect ?? "—",

    opportuniteRef: activite.opportunite_ref ?? "",

    resultat: activite.resultat,

    resultatLabel: activite.resultat_label,

    prochaineAction: formatProchaineAction(
      activite.prochaine_action,
    ),
  };
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function MembreShowData({
  isOpen,
  id,
  onClose,
  onEditMembre,
}: MembreShowDataProps) {
  // ---------------------------------------------------------------------------
  // Membres list
  //
  // Déjà en cache (chargée par la page Membres). Sert uniquement de repli le
  // temps que le détail arrive, pour éviter un écran vide.
  // ---------------------------------------------------------------------------

  const { data: membresRes } = useGetMembresQuery(undefined, {
    skip: !isOpen,
  });

  const membre: MembreItem | null =
    membresRes?.data?.find((item) => item.id === id) ?? null;

  // ---------------------------------------------------------------------------
  // Member detail — GET /membres/{id}
  // ---------------------------------------------------------------------------

  const {
    data: membreDetailRes,
    isLoading,
    isFetching,
  } = useGetMembreByIdQuery(id as number, {
    skip: !isOpen || !id,
    // Le détail doit être frais à chaque ouverture. Sans cette option, RTK
    // Query ressert son cache (60 s) sans rappeler GET /membres/{id} : toute
    // modification faite ailleurs (autre onglet, autre utilisateur, SQL
    // direct) reste invisible tant que le cache n'a pas expiré.
    refetchOnMountOrArgChange: true,
  });

  // ---------------------------------------------------------------------------
  // Nothing to display
  // ---------------------------------------------------------------------------

  if (!isOpen || !id) {
    return null;
  }

  const detail = membreDetailRes?.data;

  // ---------------------------------------------------------------------------
  // Statut
  // ---------------------------------------------------------------------------

  const isActive = detail
    ? detail.is_active === "actif"
    : membre?.is_active === 1 ||
      membre?.is_active === true;

  // ---------------------------------------------------------------------------
  // Data utilisée par MembreShow
  //
  // Toutes les valeurs proviennent de GET /membres/{id}. Les informations
  // absentes de la base restent nulles : MembreShow affiche alors « — » ou
  // « Aucune donnée » plutôt qu'une valeur inventée.
  // ---------------------------------------------------------------------------

  const data: MembreShowDataType = {
    id,

    // -------------------------------------------------------------------------
    // Identité
    // -------------------------------------------------------------------------

    nomComplet:
      detail?.nom_complet ??
      membre?.nom_complet ??
      "",

    email:
      detail?.email ??
      membre?.email ??
      "",

    telephone:
      detail?.telephone ??
      "—",

    avatar:
      detail?.avatar ??
      membre?.avatar ??
      null,

    isActive,

    roleName:
      detail?.role?.name ??
      membre?.role?.name ??
      "—",

    // -------------------------------------------------------------------------
    // Localisation
    // -------------------------------------------------------------------------

    ville:
      detail?.ville?.name ??
      null,

    // -------------------------------------------------------------------------
    // Affectation
    // -------------------------------------------------------------------------

    equipeNom:
      detail?.equipe?.nom ??
      membre?.equipe_principale?.nom ??
      null,

    responsableNom:
      detail?.responsable?.nom ??
      membre?.responsable?.nom ??
      null,

    secteurs:
      detail?.secteurs_noms ??
      membre?.secteurs ??
      [],

    // -------------------------------------------------------------------------
    // Capacité
    // -------------------------------------------------------------------------

    capaciteMaxLeads:
      detail?.capacite_max_leads ??
      membre?.capacite_max_leads ??
      0,

    leadsActifs:
      detail?.leads_actifs ??
      membre?.leads_actifs ??
      0,

    // -------------------------------------------------------------------------
    // Paramètres d'affectation
    //
    // `limite_prospection` vient de la colonne `nb_prospect_par_jour`.
    // `methode_affectation` n'existe pas en base : l'API renvoie null.
    // -------------------------------------------------------------------------

    limiteProspectionJour:
      detail?.limite_prospection ??
      null,

    methodeAffectation:
      detail?.methode_affectation ??
      null,

    // -------------------------------------------------------------------------
    // Date d'entrée
    // -------------------------------------------------------------------------

    membreDepuisLe:
      formatMembreDepuisLe(
        detail?.created_at ??
          membre?.created_at,
      ),

    // -------------------------------------------------------------------------
    // Notes internes — pas de colonne dédiée en base.
    // -------------------------------------------------------------------------

    notesInternes:
      detail?.notes_internes ??
      null,

    // -------------------------------------------------------------------------
    // KPI (calculés côté API à partir du pipeline et des activités)
    // -------------------------------------------------------------------------

    kpis: {
      relancesEnRetard:
        detail?.kpis?.relances_en_retard ??
        null,

      opportunitesGagnees:
        detail?.kpis?.opportunites_gagnees ??
        null,

      opportunitesGagneesEvolutionPct:
        detail?.kpis?.opportunites_gagnees_evolution_pct ??
        null,

      opportunitesPerdues:
        detail?.kpis?.opportunites_perdues ??
        null,

      opportunitesPerdueEvolutionPct:
        detail?.kpis?.opportunites_perdues_evolution_pct ??
        null,
    },

    // -------------------------------------------------------------------------
    // Objectifs : cible définie sur le membre + réalisé mesuré en base
    // -------------------------------------------------------------------------

    objectifs: {
      devenirUser: {
        actuel:
          detail?.objectifs_realises?.users_convertis ??
          0,

        objectif:
          detail?.objectifs?.users_convertis ??
          0,
      },

      comptePro: {
        actuel:
          detail?.objectifs_realises?.comptes_pro ??
          0,

        objectif:
          detail?.objectifs?.comptes_pro ??
          0,
      },

      soldeAds: {
        actuel:
          detail?.objectifs_realises?.solde_ads ??
          0,

        objectif:
          detail?.objectifs?.solde_ads ??
          0,
      },
    },

    // -------------------------------------------------------------------------
    // Activités récentes
    // -------------------------------------------------------------------------

    activitesRecentes: (
      detail?.activites_recentes ?? []
    ).map(toActiviteShow),
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <MembreShow
      data={data}
      isLoading={isLoading || isFetching}
      onBack={onClose}
      onEdit={() => onEditMembre(id)}
    />
  );
}
