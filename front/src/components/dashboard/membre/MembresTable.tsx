import { useEffect, useRef, useState } from "react";
import {
  Eye,
  User,
  Pencil,
  Download,
  MoreVertical,
} from "lucide-react";
import Pagination from "../../ui/pagination/Pagination";

export interface MetricValue {
  actuel: number;
  objectif: number;
  pourcentage: number;
}

export interface MembreItem {
  id: number;
  nom_complet: string;
  email: string;
  avatar?: string | null;

  role: {
    id?: number;
    name: string;
    type?: "manager" | "commercial" | "support" | string;
  };

  equipe_principale?: {
    id: number;
    nom: string;
    color?: string;
  } | null;

  responsable?: {
    id: number;
    nom: string;
    avatar?: string | null;
  } | null;

  equipes_accessibles?: Array<{
    id: number;
    nom: string;
    color?: string;
  }>;

  secteurs?: string[];
  secteur_ids?: number[];

  leads_actifs: number;
  capacite_max_leads: number;
  capacite?: number;

  devenir_user?: MetricValue;
  compte_pro?: MetricValue;
  solde_ads?: MetricValue;

  retards?: number;

  is_active: boolean | number;

  created_at?: string;
}

interface MembreTableProps {
  data?: MembreItem[];
  isLoading?: boolean;

  /**
   * Nombre TOTAL de membres après filtrage.
   * Ce n'est pas data.length lorsque la pagination est active.
   */
  total?: number;

  currentPage?: number;
  lastPage?: number;
  perPage?: number;

  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;

  onViewMembre?: (id: number) => void;
  onActionClick?: (id: number) => void;
  onEditMembre?: (id: number) => void;
  onExport?: () => void;
}

const resolveMetric = (
  metric: MetricValue | undefined,
  fallbackActuel = 0,
  fallbackObjectif = 0
): MetricValue => {
  if (metric) {
    return metric;
  }

  const pourcentage =
    fallbackObjectif > 0
      ? Math.min(
          100,
          Math.round(
            (fallbackActuel / fallbackObjectif) * 100
          )
        )
      : 0;

  return {
    actuel: fallbackActuel,
    objectif: fallbackObjectif,
    pourcentage,
  };
};

const getBadgeColor = (
  pct: number,
  mode: "positive" | "spend"
) => {
  if (mode === "spend") {
    return "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300";
  }

  if (pct >= 70) {
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (pct >= 40) {
    return "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300";
  }

  return "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300";
};

const MetricProgress = ({
  metric,
  barColorClass,
  badgeMode,
  format,
}: {
  metric: MetricValue;
  barColorClass: string;
  badgeMode: "positive" | "spend";
  format?: (value: number) => string;
}) => {
  const fmt =
    format ?? ((value: number) => String(value));

  return (
    <div className="min-w-[130px] space-y-1.5 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-xs font-bold text-slate-800 dark:text-slate-200">
          {fmt(metric.actuel)} / {fmt(metric.objectif)}
        </span>

        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${getBadgeColor(
            metric.pourcentage,
            badgeMode
          )}`}
        >
          {metric.pourcentage}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, metric.pourcentage)
            )}%`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Menu « Actions » d'une ligne.
 *
 * Le tableau est dans un conteneur `overflow-x-auto` : un menu en position
 * absolue y serait rogné. Il est donc positionné en `fixed`, à partir de la
 * position réelle du bouton.
 */
function MembreRowActions({
  onView,
  onEdit,
}: {
  onView: () => void;
  onEdit: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [position, setPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const close = () => setIsOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [isOpen]);

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      setPosition({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    setIsOpen(true);
  };

  const runAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Actions du membre"
        className="cursor-pointer shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-2xs transition-colors hover:border-slate-300 hover:text-slate-800 dark:border-slate-800 dark:bg-[#070e1b] dark:hover:text-slate-200"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && position && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            top: position.top,
            right: position.right,
          }}
          className="fixed z-[99999] w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg dark:border-slate-800 dark:bg-[#0b1526]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onView)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-blue-400"
          >
            <Eye className="h-4 w-4" />
            Afficher
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onEdit)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-violet-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-violet-400"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        </div>
      )}
    </>
  );
}

export default function MembresTable({
  data = [],
  isLoading = false,
  total = 0,
  currentPage = 1,
  lastPage = 1,
  perPage = 10,
  onPageChange,
  onViewMembre,
  onEditMembre,
  onExport,
}: MembreTableProps) {
  /**
   * `total` = nombre total de résultats après filtrage.
   * `data` = uniquement les membres de la page courante.
   */
  const displayTotal = Math.max(0, total);

  const safeCurrentPage = Math.max(
    1,
    currentPage
  );

  const safePerPage = Math.max(
    1,
    perPage
  );

  const safeLastPage = Math.max(
    1,
    lastPage
  );

  const rangeStart =
    displayTotal === 0
      ? 0
      : (safeCurrentPage - 1) *
          safePerPage +
        1;

  const rangeEnd =
    displayTotal === 0
      ? 0
      : Math.min(
          safeCurrentPage * safePerPage,
          displayTotal
        );

  return (
    <div className="space-y-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#070e1b]">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-base font-bold text-indigo-950 dark:text-white">
            Liste des membres ({displayTotal})
          </h2>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-[#070e1b] dark:text-slate-300 dark:hover:bg-slate-800/60"
          >
            <Download className="h-3.5 w-3.5" />

            <span>
              Exporter
            </span>
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        {isLoading ? (
          <div className="flex h-72 w-full items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />

              <span className="text-xs font-medium">
                Chargement des membres...
              </span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-72 w-full items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Aucun membre trouvé
              </div>

              <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Aucun membre ne correspond aux critères actuels.
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap text-left">
              {/* =================================================
                  TABLE HEADER
              ================================================== */}

              <thead>
                <tr className="whitespace-nowrap border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-[#091322]/40 dark:text-slate-500">
                  {/* 1 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Membre
                  </th>

                  {/* 2 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Équipe
                  </th>

                  {/* 3 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Secteur(s)
                  </th>

                  {/* 4 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Responsable
                  </th>

                  {/* 5 */}
                  <th className="whitespace-nowrap px-4 py-3.5 text-center">
                    Opportunités actives
                  </th>

                  {/* 6 */}
                  <th className="whitespace-nowrap px-4 py-3.5 text-center">
                    Capacité
                  </th>

                  {/* 7 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Devenir User
                  </th>

                  {/* 8 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Compte Pro
                  </th>

                  {/* 9 */}
                  <th className="whitespace-nowrap px-4 py-3.5">
                    Solde Ads
                  </th>

                  {/* 10 */}
                  <th className="whitespace-nowrap px-4 py-3.5 text-center">
                    Retards
                  </th>

                  {/* 11 */}
                  <th className="whitespace-nowrap px-4 py-3.5 text-center">
                    Statut
                  </th>

                  {/* 12 */}
                  <th className="whitespace-nowrap px-4 py-3.5 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================== */}

              <tbody className="divide-y divide-slate-100 whitespace-nowrap text-xs dark:divide-slate-800/60">
                {data.map((item) => {
                  const isActive =
                    item.is_active === 1 ||
                    item.is_active === true;

                  /*
                   * Opportunités actives
                   * = leads_actifs venant de l'API.
                   */
                  const opportunitesActives =
                    Number(
                      item.leads_actifs || 0
                    );

                  /*
                   * Capacité
                   * On utilise `capacite` si disponible,
                   * sinon capacite_max_leads.
                   */
                  const capacite =
                    item.capacite ??
                    item.capacite_max_leads ??
                    0;

                  /*
                   * Metrics existantes.
                   * Aucun faux objectif n'est ajouté.
                   */
                  const devenirUser =
                    resolveMetric(
                      item.devenir_user
                    );

                  const comptePro =
                    resolveMetric(
                      item.compte_pro
                    );

                  const soldeAds =
                    resolveMetric(
                      item.solde_ads
                    );

                  const retards =
                    item.retards ?? 0;

                  return (
                    <tr
                      key={item.id}
                      // Toute la ligne ouvre la fiche du membre : chaque
                      // colonne est cliquable, sauf « Actions » qui conserve
                      // son propre menu (stopPropagation sur sa cellule).
                      onClick={() =>
                        onViewMembre?.(
                          item.id
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          onViewMembre?.(
                            item.id
                          );
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Afficher la fiche de ${item.nom_complet}`}
                      title="Afficher la fiche du membre"
                      className="cursor-pointer whitespace-nowrap transition-colors hover:bg-slate-50/60 focus:outline-hidden focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40 dark:hover:bg-slate-850/40 dark:focus-visible:bg-slate-800/40"
                    >
                      {/* =================================================
                          1 — MEMBRE
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex flex-nowrap items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.nom_complet}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              item.nom_complet
                                .slice(0, 2)
                                .toUpperCase()
                            )}
                          </div>

                          <div className="space-y-0.5 whitespace-nowrap">
                            <p className="whitespace-nowrap font-bold leading-tight text-slate-900 dark:text-white">
                              {item.nom_complet}
                            </p>

                            <p className="whitespace-nowrap text-[11px] text-slate-400 dark:text-slate-500">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          2 — ÉQUIPE
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        {item.equipe_principale ? (
                          <div className="inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-lg border border-purple-200/60 bg-purple-50/60 px-2.5 py-1 text-[11px] font-medium text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/30 dark:text-purple-300">
                            <User className="h-3.5 w-3.5 shrink-0" />

                            <span className="whitespace-nowrap">
                              {
                                item
                                  .equipe_principale
                                  .nom
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 font-semibold text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          3 — SECTEUR(S)
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {item.secteurs &&
                        item.secteurs.length > 0 ? (
                          item.secteurs.join(
                            ", "
                          )
                        ) : (
                          <span className="font-semibold text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          4 — RESPONSABLE
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        {item.responsable ? (
                          <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-[9px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {item.responsable
                                .avatar ? (
                                <img
                                  src={
                                    item
                                      .responsable
                                      .avatar
                                  }
                                  alt={
                                    item
                                      .responsable
                                      .nom
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                item.responsable.nom
                                  .slice(0, 2)
                                  .toUpperCase()
                              )}
                            </div>

                            <span className="whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {
                                item
                                  .responsable
                                  .nom
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 font-semibold text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          5 — OPPORTUNITÉS ACTIVES
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {opportunitesActives}
                        </span>
                      </td>

                      {/* =================================================
                          6 — CAPACITÉ
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {capacite}
                        </span>
                      </td>

                      {/* =================================================
                          7 — DEVENIR USER
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <MetricProgress
                          metric={
                            devenirUser
                          }
                          barColorClass="bg-blue-500"
                          badgeMode="positive"
                        />
                      </td>

                      {/* =================================================
                          8 — COMPTE PRO
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <MetricProgress
                          metric={
                            comptePro
                          }
                          barColorClass="bg-violet-500"
                          badgeMode="positive"
                        />
                      </td>

                      {/* =================================================
                          9 — SOLDE ADS
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <MetricProgress
                          metric={
                            soldeAds
                          }
                          barColorClass="bg-rose-500"
                          badgeMode="spend"
                          format={(value) =>
                            value.toLocaleString(
                              "fr-FR"
                            )
                          }
                        />
                      </td>

                      {/* =================================================
                          10 — RETARDS
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <span
                          className={
                            retards > 0
                              ? "font-bold text-rose-500"
                              : "font-bold text-slate-500 dark:text-slate-400"
                          }
                        >
                          {retards}
                        </span>
                      </td>

                      {/* =================================================
                          11 — STATUT
                      ================================================== */}

                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                            isActive
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {isActive
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </td>

                      {/* =================================================
                          12 — ACTIONS
                      ================================================== */}

                      <td
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        className="whitespace-nowrap px-4 py-3.5 text-center"
                      >
                        <div className="flex flex-nowrap items-center justify-center whitespace-nowrap">
                          <MembreRowActions
                            onView={() =>
                              onViewMembre?.(
                                item.id
                              )
                            }
                            onEdit={() =>
                              onEditMembre?.(
                                item.id
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* =====================================================
            PAGINATION FOOTER
        ====================================================== */}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800/60 sm:flex-row">
          <div className="flex items-center gap-4">
            <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
              {isLoading
                ? "Chargement en cours..."
                : displayTotal === 0
                ? "Aucun membre trouvé"
                : `Affichage de ${rangeEnd - rangeStart + 1} membres sur ${displayTotal}`}
            </span>
          </div>

          <Pagination
            totalPages={safeLastPage}
            currentPage={
              safeCurrentPage
            }
            onPageChange={(page) =>
              onPageChange?.(page)
            }
            // « Previous » et « Next » restent visibles (grisés) même sur une
            // page unique, comme sur la maquette.
            alwaysShowNav
          />
        </div>
      </div>
    </div>
  );
}