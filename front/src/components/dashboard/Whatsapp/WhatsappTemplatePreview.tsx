import { Info } from "lucide-react";
import RightModal from "../../modals/RightModal";
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

interface WhatsappTemplatePreviewProps {
  isOpen: boolean;
  /**
   * Template affiché. Conservé par la page pendant l'animation de fermeture,
   * d'où un `isOpen` distinct : sans lui le contenu disparaîtrait d'un coup.
   */
  template: WhatsappTemplate | null;
  onClose: () => void;
  /** Bascule vers le formulaire de modification. */
  onEdit: (template: WhatsappTemplate) => void;
}

const ligneClass = "flex items-start justify-between gap-4 py-2.5";
const dtClass = "shrink-0 text-xs text-slate-500 dark:text-slate-400";

export default function WhatsappTemplatePreview({
  isOpen,
  template,
  onClose,
  onEdit,
}: WhatsappTemplatePreviewProps) {
  const lignes = (template?.message ?? "").trim()
    ? (template?.message ?? "").split("\n")
    : ["Aucun message enregistré pour ce template."];

  return (
    <RightModal
      isOpen={isOpen && Boolean(template)}
      onClose={onClose}
      title="Aperçu du template"
      labelAction="Modifier"
      labelCancel="Fermer"
      type="update"
      onSave={() => template && onEdit(template)}
    >
      {!template ? null : (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{template.nom}</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {template.description || "Aucun titre interne."}
          </p>
        </div>

        {/* Rendu WhatsApp */}
        <div className="rounded-2xl bg-[#ECE5DD] p-4 dark:bg-[#0b141a]">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">
              W
            </span>

            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-[#DCF8C6] px-3.5 py-2.5 shadow-sm dark:bg-[#005c4b]">
              <div className="space-y-1 break-words text-sm text-slate-800 dark:text-slate-100">
                {lignes.map((ligne, index) => (
                  <p key={index}>{ligne || " "}</p>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-slate-300">
                15:24
                <span className="text-[#34B7F1]">✓✓</span>
              </div>
            </div>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
          Les variables comme {"{{nom}}"} sont remplacées au moment de l'envoi.
        </p>

        {/* Métadonnées */}
        <dl className="divide-y divide-slate-100 border-t border-slate-100 text-sm dark:divide-slate-800 dark:border-slate-800">
          <div className={ligneClass}>
            <dt className={dtClass}>Audience</dt>
            <dd className="flex flex-wrap justify-end gap-1.5">
              {template.audiences.map((audience) => (
                <span
                  key={audience}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${AUDIENCE_CLASSES[audience]}`}
                >
                  {AUDIENCE_LABELS[audience]}
                </span>
              ))}
            </dd>
          </div>

          <div className={ligneClass}>
            <dt className={dtClass}>Type / Usage</dt>
            <dd>
              <span
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${classeUsage(template.usage)}`}
              >
                {template.usage_label ?? template.usage ?? "—"}
              </span>
            </dd>
          </div>

          <div className={ligneClass}>
            <dt className={dtClass}>Langue</dt>
            <dd className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <span aria-hidden="true">{LANGUE_FLAGS[template.langue]}</span>
              {LANGUE_LABELS[template.langue]}
            </dd>
          </div>

          <div className={ligneClass}>
            <dt className={dtClass}>Statut</dt>
            <dd>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUT_CLASSES[template.statut]}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${STATUT_DOT_CLASSES[template.statut]}`}
                />
                {STATUT_LABELS[template.statut]}
              </span>
            </dd>
          </div>

          <div className={ligneClass}>
            <dt className={dtClass}>Dernière modification</dt>
            <dd className="text-right">
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                {formatDateTemplate(template.updated_at)}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Par {template.updated_by}
              </p>
            </dd>
          </div>
        </dl>
      </div>
      )}
    </RightModal>
  );
}
