import { useState } from "react";
import { Loader2, Copy, Check, ExternalLink, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useGetTemplatesPourCarteQuery } from "../../../services/whatsappApi";
import { AUDIENCE_LABELS, USAGE_CLASSES, type WhatsappUsage } from "./whatsappTypes";

interface WhatsappTemplatePickerProps {
  cardId: number;
}

/**
 * Met un numéro marocain au format attendu par wa.me : chiffres uniquement,
 * indicatif pays inclus, sans « + » ni espaces.
 *
 * « 06 68 33 02 06 » -> « 212668330206 »
 */
function pourWaMe(telephone?: string | null): string | null {
  if (!telephone) {
    return null;
  }

  let chiffres = telephone.replace(/\D/g, "");

  if (chiffres.startsWith("00")) {
    chiffres = chiffres.slice(2);
  }

  // Numéro national marocain : on remplace le 0 initial par l'indicatif.
  if (chiffres.startsWith("0")) {
    chiffres = `212${chiffres.slice(1)}`;
  }

  return chiffres.length >= 9 ? chiffres : null;
}

export default function WhatsappTemplatePicker({ cardId }: WhatsappTemplatePickerProps) {
  const { data, isLoading, isError } = useGetTemplatesPourCarteQuery(cardId, {
    skip: !cardId,
  });

  const [copieId, setCopieId] = useState<number | null>(null);

  const contenu = data?.data;
  const templates = contenu?.templates ?? [];
  const telephone = pourWaMe(contenu?.destinataire?.telephone);

  const copier = async (id: number, message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopieId(id);
      // Retour visuel court : la coche revient à l'icône copie.
      setTimeout(() => setCopieId(null), 1800);
    } catch {
      toast.error("Impossible de copier le message.");
    }
  };

  const ouvrirWhatsapp = (message: string) => {
    if (!telephone) {
      toast.error("Aucun numéro de téléphone pour ce contact.");
      return;
    }

    window.open(
      `https://wa.me/${telephone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white py-6 text-xs font-semibold text-slate-500 dark:border-gray-800 dark:bg-[#0c1527]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des templates...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-xs font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
        Impossible de charger les templates WhatsApp.
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-6 text-center dark:border-gray-800 dark:bg-[#0c1527]">
        <FileText className="h-6 w-6 text-slate-300" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Aucun template actif pour cette audience
          {contenu?.audience ? ` (${AUDIENCE_LABELS[contenu.audience]})` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Templates WhatsApp
        </p>
        {contenu?.destinataire?.nom && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Pour {contenu.destinataire.nom}
            {contenu.destinataire.telephone ? ` · ${contenu.destinataire.telephone}` : ""}
          </p>
        )}
      </div>

      <div className="max-h-72 space-y-2.5 overflow-y-auto pr-0.5">
        {templates.map((template) => {
          const message = template.message_rendu ?? template.message;

          return (
            <div
              key={template.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-colors hover:border-emerald-300 dark:border-gray-800 dark:bg-[#0c1527] dark:hover:border-emerald-800/60"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {template.nom}
                </span>
                {template.usage && (
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                      USAGE_CLASSES[template.usage as WhatsappUsage] ??
                      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {template.usage_label ?? template.usage}
                  </span>
                )}
              </div>

              {template.description && (
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  {template.description}
                </p>
              )}

              {/* Message déjà personnalisé par le backend */}
              <div className="mt-2 whitespace-pre-line rounded-xl bg-[#DCF8C6] px-3 py-2 text-[11.5px] leading-relaxed text-slate-800 dark:bg-[#005c4b] dark:text-slate-100">
                {message}
              </div>

              <div className="mt-2.5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => copier(template.id, message)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800"
                >
                  {copieId === template.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copier
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => ouvrirWhatsapp(message)}
                  disabled={!telephone}
                  title={telephone ? undefined : "Aucun numéro de téléphone pour ce contact"}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors ${
                    telephone
                      ? "cursor-pointer bg-[#25D366] hover:bg-[#1DA851]"
                      : "cursor-not-allowed bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvrir WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
