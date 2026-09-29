import { useEffect, useRef } from "react";
import { Eye, Pencil, Copy, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Loader2, FileText } from "lucide-react";
import Pagination from "../../ui/pagination/Pagination";
import RowActionsMenu from "../../ui/table/RowActionsMenu";
import {
  AUDIENCE_CLASSES,
  AUDIENCE_LABELS,
  LANGUE_FLAGS,
  LANGUE_LABELS,
  STATUT_CLASSES,
  STATUT_DOT_CLASSES,
  STATUT_LABELS,
  classeUsage,
  formatDateTemplate,
  type WhatsappTemplate,
} from "./whatsappTypes";

export type WhatsappSortKey = "nom" | "updated_at";

export interface WhatsappSort {
  key: WhatsappSortKey;
  direction: "asc" | "desc";
}

interface WhatsappTableProps {
  templates: WhatsappTemplate[];
  isLoading?: boolean;

  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;

  sort: WhatsappSort;
  onSortChange: (sort: WhatsappSort) => void;

  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;

  onPreview?: (template: WhatsappTemplate) => void;
  onEdit?: (template: WhatsappTemplate) => void;
  onDuplicate?: (template: WhatsappTemplate) => void;
  onDelete?: (template: WhatsappTemplate) => void;
}

const thBase =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";

const iconButtonClass =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200";

export default function WhatsappTable({
  templates,
  isLoading = false,
  selectedIds,
  onSelectionChange,
  sort,
  onSortChange,
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
}: WhatsappTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  const idsPage = templates.map((t) => t.id);
  const selectionPage = idsPage.filter((id) => selectedIds.includes(id));
  const toutSelectionne = idsPage.length > 0 && selectionPage.length === idsPage.length;

  // L'état « indéterminé » d'une case ne s'exprime qu'en JS, pas en HTML.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectionPage.length > 0 && selectionPage.length < idsPage.length;
    }
  }, [selectionPage.length, idsPage.length]);

  const toggleTout = () => {
    if (toutSelectionne) {
      onSelectionChange(selectedIds.filter((id) => !idsPage.includes(id)));
      return;
    }

    onSelectionChange([...new Set([...selectedIds, ...idsPage])]);
  };

  const toggleLigne = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectionne) => selectionne !== id)
        : [...selectedIds, id],
    );
  };

  /** Clic sur un en-tête triable : même colonne = on inverse, sinon on repart en asc. */
  const trier = (key: WhatsappSortKey) => {
    onSortChange({
      key,
      direction: sort.key === key && sort.direction === "asc" ? "desc" : "asc",
    });
  };

  const SortIcon = ({ colonne }: { colonne: WhatsappSortKey }) => {
    if (sort.key !== colonne) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800/80 dark:bg-[#07101e]/80">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-[#091122]/40">
            <tr>
              <th className="py-3 pl-6 pr-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={toutSelectionne}
                  onChange={toggleTout}
                  aria-label="Tout sélectionner"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/30 dark:border-slate-600"
                />
              </th>

              <th className={thBase}>
                <button
                  type="button"
                  onClick={() => trier("nom")}
                  className="inline-flex cursor-pointer items-center gap-1.5 uppercase transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Nom du template
                  <SortIcon colonne="nom" />
                </button>
              </th>

              <th className={thBase}>Audience</th>
              <th className={thBase}>Type / Usage</th>
              <th className={thBase}>Langue</th>
              <th className={thBase}>Statut</th>

              <th className={thBase}>
                <button
                  type="button"
                  onClick={() => trier("updated_at")}
                  className="inline-flex cursor-pointer items-center gap-1.5 uppercase transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Dernière modification
                  <SortIcon colonne="updated_at" />
                </button>
              </th>

              <th className={`${thBase} pr-6 text-right`}>Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des templates...
                  </div>
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileText className="h-8 w-8" />
                    <span className="text-sm font-semibold">Aucun template trouvé</span>
                  </div>
                </td>
              </tr>
            ) : (
              templates.map((template) => {
                const estSelectionne = selectedIds.includes(template.id);

                return (
                  <tr
                    key={template.id}
                    className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/20 ${
                      estSelectionne ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                    }`}
                  >
                    <td className="py-4 pl-6 pr-3 align-middle">
                      <input
                        type="checkbox"
                        checked={estSelectionne}
                        onChange={() => toggleLigne(template.id)}
                        aria-label={`Sélectionner ${template.nom}`}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/30 dark:border-slate-600"
                      />
                    </td>

                    {/* Nom + description */}
                    <td className="px-4 py-4 align-middle">
                      <p className="font-bold text-slate-900 dark:text-white">{template.nom}</p>
                      <p className="max-w-[260px] truncate text-[11px] text-slate-400 dark:text-slate-500">
                        {template.description}
                      </p>
                    </td>

                    {/* Audiences */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {template.audiences.map((audience) => (
                          <span
                            key={audience}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${AUDIENCE_CLASSES[audience]}`}
                          >
                            {AUDIENCE_LABELS[audience]}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Type / Usage */}
                    <td className="px-4 py-4 align-middle">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${classeUsage(template.usage)}`}
                      >
                        {template.usage_label ?? template.usage ?? "—"}
                      </span>
                    </td>

                    {/* Langue */}
                    <td className="px-4 py-4 align-middle">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                        <span aria-hidden="true">{LANGUE_FLAGS[template.langue]}</span>
                        {LANGUE_LABELS[template.langue]}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-4 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUT_CLASSES[template.statut]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUT_DOT_CLASSES[template.statut]}`}
                        />
                        {STATUT_LABELS[template.statut]}
                      </span>
                    </td>

                    {/* Dernière modification */}
                    <td className="px-4 py-4 align-middle">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatDateTemplate(template.updated_at)}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Par {template.updated_by}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6 align-middle">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => onPreview?.(template)}
                          aria-label={`Aperçu de ${template.nom}`}
                          title="Aperçu"
                          className={iconButtonClass}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit?.(template)}
                          aria-label={`Modifier ${template.nom}`}
                          title="Modifier"
                          className={iconButtonClass}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicate?.(template)}
                          aria-label={`Dupliquer ${template.nom}`}
                          title="Dupliquer"
                          className={iconButtonClass}
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        <RowActionsMenu
                          ariaLabel={`Autres actions pour ${template.nom}`}
                          actions={[
                            {
                              label: "Supprimer",
                              icon: <Trash2 className="h-4 w-4" />,
                              onClick: () => onDelete?.(template),
                              hoverClass: "hover:text-rose-600 dark:hover:text-rose-400",
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800/60 sm:flex-row">
        <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
          {isLoading
            ? "Chargement en cours..."
            : total === 0
            ? "Aucun template trouvé"
            : `Affichage de ${from} à ${to} sur ${total} templates`}
        </span>

        <Pagination
          totalPages={Math.max(1, lastPage)}
          currentPage={Math.max(1, currentPage)}
          onPageChange={onPageChange}
          alwaysShowNav
        />
      </div>
    </div>
  );
}
