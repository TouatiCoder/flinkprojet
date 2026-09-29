import {
  ChevronRight,
  Pencil,
  MoreVertical,
  Users,
  User,
  Target,
  Layers,
  GitBranch,
  Calendar,
  Clock,
  Info,
  FileText,
  Hourglass,
  Trophy,
  XCircle,
  TrendingUp,
  Award,
  Wallet,
  ArrowUpRight,
  ChevronDown,
  Phone,
  MessageCircle,
  Monitor,
  Mail,
  Loader2,
  MapPin,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * ---------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------------
 */

export interface MembreShowActivite {
  id: number | string;
  date: string;
  heure: string;

  /**
   * Catégorie normalisée par l'API, ou null quand le type enregistré en base
   * n'entre dans aucune des catégories connues : `typeLabel` est alors affiché
   * tel quel, avec un style neutre.
   */
  type: "appel" | "whatsapp" | "demo" | "email" | null;
  typeLabel?: string | null;

  prospect: string;
  opportuniteRef: string;

  /**
   * Même principe que `type` : null lorsque le résultat réel ne correspond à
   * aucune des catégories connues, `resultatLabel` prend alors le relais.
   */
  resultat:
    | "interesse"
    | "a_relancer"
    | "pas_interesse"
    | "reponse_recue"
    | null;
  resultatLabel?: string | null;

  prochaineAction?: string | null;
}

export interface MembreShowObjectif {
  actuel: number;
  objectif: number;
}

export interface MembreShowData {
  id: number;

  nomComplet: string;
  email: string;
  telephone: string;

  avatar?: string | null;

  isActive: boolean;

  roleName: string;

  ville?: string | null;

  equipeNom?: string | null;
  responsableNom?: string | null;

  secteurs: string[];

  capaciteMaxLeads: number;
  leadsActifs: number;

  /**
   * Ces informations ne sont actuellement pas exposées par le backend.
   * Elles peuvent donc être null au lieu d'afficher une donnée inventée.
   */
  limiteProspectionJour?: number | null;
  methodeAffectation?: string | null;

  membreDepuisLe: string;

  notesInternes?: string | null;

  kpis: {
    relancesEnRetard?: number | null;

    opportunitesGagnees?: number | null;
    opportunitesGagneesEvolutionPct?: number | null;

    opportunitesPerdues?: number | null;
    opportunitesPerdueEvolutionPct?: number | null;
  };

  objectifs: {
    devenirUser: MembreShowObjectif;
    comptePro: MembreShowObjectif;
    soldeAds: MembreShowObjectif;
  };

  activitesRecentes: MembreShowActivite[];
}

interface MembreShowProps {
  data: MembreShowData | null;
  isLoading?: boolean;
  onBack: () => void;
  onEdit: () => void;
}

/**
 * ---------------------------------------------------------------------------
 * Configuration activités
 * ---------------------------------------------------------------------------
 */

const activiteTypeConfig: Record<
  NonNullable<MembreShowActivite["type"]>,
  {
    label: string;
    icon: typeof Phone;
    className: string;
  }
> = {
  appel: {
    label: "Appel",
    icon: Phone,
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },

  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },

  demo: {
    label: "Démo",
    icon: Monitor,
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },

  email: {
    label: "Email",
    icon: Mail,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

const resultatConfig: Record<
  NonNullable<MembreShowActivite["resultat"]>,
  {
    label: string;
    className: string;
  }
> = {
  interesse: {
    label: "Intéressé",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-300",
  },

  a_relancer: {
    label: "À relancer",
    className:
      "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-300",
  },

  pas_interesse: {
    label: "Pas intéressé",
    className:
      "bg-rose-50 text-rose-600 border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-300",
  },

  reponse_recue: {
    label: "Réponse reçue",
    className:
      "bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/30 dark:text-blue-300",
  },
};

/**
 * ---------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------
 */

function InfoRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {label}
          </p>

          {hint && (
            <div title={hint}>
              <Info className="h-3 w-3 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return value.toLocaleString("fr-FR");
}

function calculatePercentage(
  actuel: number,
  objectif: number,
): number | null {
  if (objectif <= 0) {
    return null;
  }

  return Math.min(
    100,
    Math.max(0, Math.round((actuel / objectif) * 100)),
  );
}

/**
 * ---------------------------------------------------------------------------
 * Composant principal
 * ---------------------------------------------------------------------------
 */

export default function MembreShow({
  data,
  isLoading,
  onBack,
  onEdit,
}: MembreShowProps) {
  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

        <span className="text-xs font-medium">
          Chargement de la fiche membre...
        </span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  /**
   * -------------------------------------------------------------------------
   * Capacité
   * -------------------------------------------------------------------------
   */

  const capacitePct =
    data.capaciteMaxLeads > 0
      ? Math.min(
          100,
          Math.round(
            (data.leadsActifs / data.capaciteMaxLeads) * 100,
          ),
        )
      : 0;

  /**
   * -------------------------------------------------------------------------
   * Objectifs
   * -------------------------------------------------------------------------
   */

  const objDevenirUserPct = calculatePercentage(
    data.objectifs.devenirUser.actuel,
    data.objectifs.devenirUser.objectif,
  );

  const objCompteProPct = calculatePercentage(
    data.objectifs.comptePro.actuel,
    data.objectifs.comptePro.objectif,
  );

  const objSoldeAdsPct = calculatePercentage(
    data.objectifs.soldeAds.actuel,
    data.objectifs.soldeAds.objectif,
  );

  /**
   * -------------------------------------------------------------------------
   * KPI disponibles
   * -------------------------------------------------------------------------
   */

  const relancesEnRetard =
    data.kpis.relancesEnRetard ?? null;

  const opportunitesGagnees =
    data.kpis.opportunitesGagnees ?? null;

  const opportunitesGagneesEvolution =
    data.kpis.opportunitesGagneesEvolutionPct ?? null;

  const opportunitesPerdues =
    data.kpis.opportunitesPerdues ?? null;

  const opportunitesPerduesEvolution =
    data.kpis.opportunitesPerdueEvolutionPct ?? null;

  return (
    <div className="w-full space-y-6 font-sans text-slate-700 dark:text-slate-200">
      {/* =====================================================================
          BREADCRUMB + ACTIONS
      ====================================================================== */}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <nav className="flex min-w-0 items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer font-semibold text-slate-400 transition-colors hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
          >
            Membres
          </button>

          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-700" />

          <span className="truncate font-bold text-slate-900 dark:text-white">
            {data.nomComplet}
          </span>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-[#070e1b] dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            <Pencil className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />

            <span>Modifier le membre</span>
          </button>

          <button
            type="button"
            aria-label="Plus d'actions"
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-[#070e1b] dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          CARTE PRINCIPALE
      ====================================================================== */}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#070e1b]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_280px] lg:gap-8">
          {/* -----------------------------------------------------------------
              IDENTITÉ
          ------------------------------------------------------------------ */}

          <div className="flex items-start gap-4 lg:w-64">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-lg font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt={data.nomComplet}
                  className="h-full w-full object-cover"
                />
              ) : (
                data.nomComplet
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                  {data.nomComplet}
                </h2>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    data.isActive
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      data.isActive
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  {data.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {data.roleName}
              </p>

              <div className="space-y-1 pt-1">
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate">
                    {data.email || "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5 shrink-0" />

                  <span>
                    {data.telephone || "—"}
                  </span>
                </div>

                {data.ville && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />

                    <span>{data.ville}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              INFORMATIONS D'AFFECTATION
          ------------------------------------------------------------------ */}

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:border-l lg:border-r lg:border-slate-100 lg:px-8 lg:dark:border-slate-800/60">
            <InfoRow
              icon={Users}
              label="Équipe"
              value={data.equipeNom || "—"}
            />

            <InfoRow
              icon={Target}
              label="Secteur(s) d'activité"
              value={
                data.secteurs.length > 0 ? (
                  <span className="inline-flex max-w-full items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                    {data.secteurs.join(", ")}
                  </span>
                ) : (
                  "—"
                )
              }
            />

            <InfoRow
              icon={User}
              label="Responsable"
              value={data.responsableNom || "—"}
            />

            <InfoRow
              icon={Layers}
              label="Capacité max d'opportunités"
              value={formatNumber(data.capaciteMaxLeads)}
            />

            <InfoRow
              icon={Clock}
              label="Limite de création de prospects / jour"
              value={
                data.limiteProspectionJour !== null &&
                data.limiteProspectionJour !== undefined
                  ? `${data.limiteProspectionJour} / jour`
                  : "—"
              }
              hint="Nombre maximum de nouveaux prospects que ce membre peut créer par jour."
            />

            <InfoRow
              icon={GitBranch}
              label="Méthode d'affectation"
              value={data.methodeAffectation || "—"}
            />

            <InfoRow
              icon={Calendar}
              label="Membre depuis le"
              value={data.membreDepuisLe || "—"}
            />
          </div>

          {/* -----------------------------------------------------------------
              NOTES INTERNES
          ------------------------------------------------------------------ */}

          <div className="h-fit space-y-2 rounded-2xl border border-purple-200/60 bg-purple-500/5 p-4 dark:border-purple-800/40">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <FileText className="h-4 w-4" />

              <span>Notes internes</span>
            </div>

            <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {data.notesInternes || "Aucune note pour le moment."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          KPIs
      ====================================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* -------------------------------------------------------------------
            OPPORTUNITÉS ACTIVES
        -------------------------------------------------------------------- */}

        <div className="space-y-3 rounded-2xl border border-blue-100/80 bg-blue-50/50 p-4 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <Target className="h-5 w-5 stroke-[2.2]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Opportunités actives
              </p>

              <h3 className="mt-0.5 text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                {formatNumber(data.leadsActifs)}

                <span className="text-sm font-semibold text-slate-400">
                  {" "}
                  / {formatNumber(data.capaciteMaxLeads)}
                </span>
              </h3>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${capacitePct}%`,
                }}
              />
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {capacitePct}%
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            RELANCES EN RETARD
        -------------------------------------------------------------------- */}

        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-rose-100/80 bg-rose-50/50 p-4 shadow-xs dark:border-rose-900/40 dark:bg-rose-950/20 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
              <Hourglass className="h-5 w-5 stroke-[2.2]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Relances en retard
              </p>

              <h3 className="mt-0.5 text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                {relancesEnRetard === null
                  ? "—"
                  : formatNumber(relancesEnRetard)}
              </h3>
            </div>
          </div>

          <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            {relancesEnRetard === null
              ? "Donnée non disponible"
              : relancesEnRetard > 0
                ? "À traiter au plus vite"
                : "Aucune relance en retard"}
          </p>
        </div>

        {/* -------------------------------------------------------------------
            OPPORTUNITÉS GAGNÉES
        -------------------------------------------------------------------- */}

        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <Trophy className="h-5 w-5 stroke-[2.2]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Opportunités gagnées
              </p>

              <h3 className="mt-0.5 text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                {opportunitesGagnees === null
                  ? "—"
                  : formatNumber(opportunitesGagnees)}
              </h3>
            </div>
          </div>

          {opportunitesGagnees === null ? (
            <p className="text-[11px] font-medium text-slate-400">
              Donnée non disponible
            </p>
          ) : (
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-slate-500">
                Cette semaine
              </span>

              {opportunitesGagneesEvolution !== null && (
                <span className="text-right">
                  <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />

                    {opportunitesGagneesEvolution >= 0
                      ? "+"
                      : ""}
                    {opportunitesGagneesEvolution}%
                  </span>

                  <span className="block text-[10px] font-medium text-slate-400">
                    vs semaine dernière
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------
            OPPORTUNITÉS PERDUES
        -------------------------------------------------------------------- */}

        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-rose-100/80 bg-rose-50/50 p-4 shadow-xs dark:border-rose-900/40 dark:bg-rose-950/20 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
              <XCircle className="h-5 w-5 stroke-[2.2]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Opportunités perdues
              </p>

              <h3 className="mt-0.5 text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                {opportunitesPerdues === null
                  ? "—"
                  : formatNumber(opportunitesPerdues)}
              </h3>
            </div>
          </div>

          {opportunitesPerdues === null ? (
            <p className="text-[11px] font-medium text-slate-400">
              Donnée non disponible
            </p>
          ) : (
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-slate-500">
                Cette semaine
              </span>

              {opportunitesPerduesEvolution !== null && (
                <span className="text-right">
                  <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400">
                    <ArrowUpRight className="h-3 w-3" />

                    {opportunitesPerduesEvolution >= 0
                      ? "+"
                      : ""}
                    {opportunitesPerduesEvolution}%
                  </span>

                  <span className="block text-[10px] font-medium text-slate-400">
                    vs semaine dernière
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          OBJECTIFS INDIVIDUELS
      ====================================================================== */}

      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#070e1b]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Objectifs individuels
            </h3>
          </div>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-[#091322] dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cette semaine

            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* -----------------------------------------------------------------
              DEVENIR USER
          ------------------------------------------------------------------ */}

          <div className="space-y-3 rounded-2xl border border-blue-200/60 bg-blue-500/5 p-4 dark:border-blue-800/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Devenir User
                </h4>

                <span className="text-[10px] text-slate-400">
                  Objectif :{" "}
                  {formatNumber(
                    data.objectifs.devenirUser.objectif,
                  )}{" "}
                  / semaine
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {formatNumber(
                  data.objectifs.devenirUser.actuel,
                )}

                <span className="text-sm font-semibold text-slate-400">
                  {" "}
                  /{" "}
                  {formatNumber(
                    data.objectifs.devenirUser.objectif,
                  )}
                </span>
              </span>

              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {objDevenirUserPct === null
                  ? "—"
                  : `${objDevenirUserPct}%`}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${objDevenirUserPct ?? 0}%`,
                }}
              />
            </div>
          </div>

          {/* -----------------------------------------------------------------
              COMPTE PRO
          ------------------------------------------------------------------ */}

          <div className="space-y-3 rounded-2xl border border-purple-200/60 bg-purple-500/5 p-4 dark:border-purple-800/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Award className="h-4 w-4" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Compte Pro
                </h4>

                <span className="text-[10px] text-slate-400">
                  Objectif :{" "}
                  {formatNumber(
                    data.objectifs.comptePro.objectif,
                  )}{" "}
                  / mois
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {formatNumber(
                  data.objectifs.comptePro.actuel,
                )}

                <span className="text-sm font-semibold text-slate-400">
                  {" "}
                  /{" "}
                  {formatNumber(
                    data.objectifs.comptePro.objectif,
                  )}
                </span>
              </span>

              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {objCompteProPct === null
                  ? "—"
                  : `${objCompteProPct}%`}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${objCompteProPct ?? 0}%`,
                }}
              />
            </div>
          </div>

          {/* -----------------------------------------------------------------
              SOLDE ADS
          ------------------------------------------------------------------ */}

          <div className="space-y-3 rounded-2xl border border-amber-200/60 bg-amber-500/5 p-4 dark:border-amber-800/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Wallet className="h-4 w-4" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Solde Ads
                </h4>

                <span className="text-[10px] text-slate-400">
                  Objectif :{" "}
                  {formatNumber(
                    data.objectifs.soldeAds.objectif,
                  )}{" "}
                  MAD / an
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {formatNumber(
                  data.objectifs.soldeAds.actuel,
                )}

                <span className="text-sm font-semibold text-slate-400">
                  {" "}
                  /{" "}
                  {formatNumber(
                    data.objectifs.soldeAds.objectif,
                  )}
                </span>
              </span>

              <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-xs font-bold text-rose-500">
                {objSoldeAdsPct === null
                  ? "—"
                  : `${objSoldeAdsPct}%`}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${objSoldeAdsPct ?? 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ACTIVITÉS RÉCENTES
      ====================================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#070e1b]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Activités récentes
            </h3>
          </div>

          {data.activitesRecentes.length > 0 && (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Voir toutes les activités

              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {data.activitesRecentes.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center px-6 py-10">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Clock className="h-5 w-5" />
              </div>

              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Aucune activité récente
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Les activités seront affichées lorsqu'elles seront disponibles.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
                  <th className="whitespace-nowrap px-6 py-3 font-semibold">
                    Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Type
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Prospect / Opportunité
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Résultat
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Prochaine action
                  </th>

                  <th className="px-6 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                {data.activitesRecentes.map((activite) => {
                  // Catégorie inconnue : on retombe sur un style neutre et on
                  // affiche le libellé réellement enregistré en base.
                  const typeCfg = activite.type
                    ? activiteTypeConfig[activite.type]
                    : {
                        label:
                          activite.typeLabel || "—",
                        icon: Info,
                        className:
                          "bg-slate-500/10 text-slate-500 dark:text-slate-400",
                      };

                  const resCfg = activite.resultat
                    ? resultatConfig[activite.resultat]
                    : {
                        label:
                          activite.resultatLabel || "—",
                        className:
                          "bg-slate-50 text-slate-600 border-slate-200/70 dark:bg-slate-800/40 dark:text-slate-300",
                      };

                  const TypeIcon = typeCfg.icon;

                  return (
                    <tr
                      key={activite.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-850/40"
                    >
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {activite.date}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {activite.heure}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeCfg.className}`}
                          >
                            <TypeIcon className="h-3.5 w-3.5" />
                          </div>

                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {typeCfg.label}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {activite.prospect}
                        </p>

                        {activite.opportuniteRef && (
                          <p className="text-[11px] text-slate-400">
                            Opportunité #{activite.opportuniteRef}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${resCfg.className}`}
                        >
                          {resCfg.label}
                        </span>
                      </td>

                      <td className="whitespace-pre-line px-4 py-3.5 font-medium text-slate-500 dark:text-slate-400">
                        {activite.prochaineAction || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-3.5 text-right">
                        <button
                          type="button"
                          aria-label="Actions de l'activité"
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:text-slate-800 dark:border-slate-800 dark:bg-[#070e1b] dark:hover:text-slate-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}