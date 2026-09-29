import { useEffect, useRef, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import RightModal from "../../modals/RightModal";
import { useGetWhatsappCreateDataQuery } from "../../../services/whatsappApi";
import {
  AUDIENCE_LABELS,
  LANGUE_LABELS,
  MESSAGE_MAX_LENGTH,
  STATUT_LABELS,
  VARIABLES_DISPONIBLES,
  type WhatsappAudience,
  type WhatsappLangue,
  type WhatsappStatut,
  type WhatsappTemplate,
  type WhatsappTemplatePayload,
} from "./whatsappTypes";

interface WhatsappTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: WhatsappTemplatePayload) => void;
  /** Template à modifier. `null` / absent = création. */
  initialData?: WhatsappTemplate | null;
  isSubmitting?: boolean;
}

type FieldErrors = Partial<Record<"nom" | "audiences" | "type_id" | "message", string>>;

const AUDIENCES: WhatsappAudience[] = ["prospect", "user", "compte_pro"];
const LANGUES: WhatsappLangue[] = ["fr", "ar"];
const STATUTS: WhatsappStatut[] = ["brouillon", "actif", "inactif"];

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-[#0f172a] dark:text-white ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
      : "border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20 dark:border-slate-700/80"
  }`;

const sectionTitle = "text-sm font-bold text-slate-900 dark:text-white";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300";
const errorClass = "mt-1 text-[11px] font-semibold text-rose-500";

export default function WhatsappTemplateForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}: WhatsappTemplateFormProps) {
  const isEdition = Boolean(initialData);
  const [nom, setNom] = useState("");
  const [audiences, setAudiences] = useState<WhatsappAudience[]>(["prospect"]);
  // Les types viennent de `ma_whatsapp_template_types` : la liste est
  // administrable en base, on ne la code pas en dur ici.
  const { data: createData } = useGetWhatsappCreateDataQuery(undefined, { skip: !isOpen });
  const types = createData?.data?.types ?? [];

  const [typeId, setTypeId] = useState<number | "">("");
  const [langue, setLangue] = useState<WhatsappLangue>("fr");
  const [titreInterne, setTitreInterne] = useState("");
  const [message, setMessage] = useState("");
  const [statut, setStatut] = useState<WhatsappStatut>("actif");
  const [errors, setErrors] = useState<FieldErrors>({});

  const messageRef = useRef<HTMLTextAreaElement>(null);

  // À l'ouverture : préremplissage en modification, formulaire vierge sinon.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});

    if (initialData) {
      setNom(initialData.nom);
      setAudiences(initialData.audiences);
      setTypeId(initialData.type_id ?? "");
      setLangue(initialData.langue);
      setTitreInterne(initialData.description ?? "");
      setMessage(initialData.message ?? "");
      setStatut(initialData.statut);
      return;
    }

    setNom("");
    setAudiences(["prospect"]);
    setTypeId("");
    setLangue("fr");
    setTitreInterne("");
    setMessage("");
    setStatut("actif");
  }, [isOpen, initialData]);

  const toggleAudience = (valeur: WhatsappAudience) => {
    setAudiences((precedent) =>
      precedent.includes(valeur)
        ? precedent.filter((a) => a !== valeur)
        : [...precedent, valeur],
    );
  };

  /**
   * Insère la variable à la position du curseur plutôt qu'à la fin : on peut
   * ainsi la placer au milieu d'une phrase déjà écrite.
   */
  const insererVariable = (variable: string) => {
    const zone = messageRef.current;

    if (!zone) {
      setMessage((precedent) => `${precedent}${variable}`);
      return;
    }

    const debut = zone.selectionStart ?? message.length;
    const fin = zone.selectionEnd ?? message.length;
    const suivant = `${message.slice(0, debut)}${variable}${message.slice(fin)}`;

    if (suivant.length > MESSAGE_MAX_LENGTH) {
      return;
    }

    setMessage(suivant);

    // Replace le curseur juste après la variable insérée.
    requestAnimationFrame(() => {
      zone.focus();
      const position = debut + variable.length;
      zone.setSelectionRange(position, position);
    });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!nom.trim()) {
      next.nom = "Le nom du template est requis.";
    } else if (!/^[a-z0-9_]+$/.test(nom.trim())) {
      next.nom = "Minuscules, chiffres et tirets bas uniquement (ex : relance_paiement_pro).";
    }

    if (audiences.length === 0) {
      next.audiences = "Sélectionnez au moins une audience.";
    }

    if (!typeId) {
      next.type_id = "Le type d'usage est requis.";
    }

    if (!message.trim()) {
      next.message = "Le message est requis.";
    } else if (message.length > MESSAGE_MAX_LENGTH) {
      next.message = `${MESSAGE_MAX_LENGTH} caractères maximum.`;
    }

    return next;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      nom: nom.trim(),
      description: titreInterne.trim(),
      audiences,
      type_id: Number(typeId),
      langue,
      message: message.trim(),
      statut,
    });
  };

  // Aperçu : texte réel si saisi, sinon exemple neutre comme dans la maquette.
  const lignesApercu = message.trim()
    ? message.split("\n")
    : ["Bonjour {{nom}},", "Votre message apparaîtra ici...", "L'équipe Flink"];

  return (
    <RightModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdition ? "Modifier le template WhatsApp" : "Ajouter un template WhatsApp"}
      labelAction={isEdition ? "Enregistrer" : "Créer le template"}
      labelCancel="Annuler"
      type="update"
      onSave={handleSubmit}
      isLoading={isSubmitting}
      widthClass="w-full sm:w-[85%] lg:w-[65%] xl:w-[50%] max-w-[900px]"
    >
      <div className="space-y-7">
        {/* ===================================================================
            1. Informations générales
        ==================================================================== */}
        <section className="space-y-4">
          <h3 className={sectionTitle}>1. Informations générales</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="wa-nom">
                Nom du template <span className="text-rose-500">*</span>
              </label>
              <input
                id="wa-nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : relance_paiement_pro"
                className={inputClass(Boolean(errors.nom))}
              />
              {errors.nom && <p className={errorClass}>{errors.nom}</p>}
            </div>

            <div>
              <span className={labelClass}>
                Audience <span className="text-rose-500">*</span>
              </span>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {AUDIENCES.map((valeur) => (
                  <label
                    key={valeur}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={audiences.includes(valeur)}
                      onChange={() => toggleAudience(valeur)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/30 dark:border-slate-600"
                    />
                    {AUDIENCE_LABELS[valeur]}
                  </label>
                ))}
              </div>
              {errors.audiences && <p className={errorClass}>{errors.audiences}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="wa-usage">
                Type / Usage <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="wa-usage"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value ? Number(e.target.value) : "")}
                  className={`${inputClass(Boolean(errors.type_id))} cursor-pointer appearance-none pr-9`}
                >
                  <option value="">Sélectionner...</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.type_id && <p className={errorClass}>{errors.type_id}</p>}
            </div>

            <div>
              <span className={labelClass}>
                Langue <span className="text-rose-500">*</span>
              </span>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {LANGUES.map((valeur) => (
                  <label
                    key={valeur}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    <input
                      type="radio"
                      name="wa-langue"
                      checked={langue === valeur}
                      onChange={() => setLangue(valeur)}
                      className="h-4 w-4 cursor-pointer border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/30 dark:border-slate-600"
                    />
                    {valeur === "fr" ? "Français" : "Arabe"} ({LANGUE_LABELS[valeur]})
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            2. Message
        ==================================================================== */}
        <section className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className={sectionTitle}>2. Message</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="wa-titre">
                Titre interne (optionnel)
              </label>
              <input
                id="wa-titre"
                type="text"
                value={titreInterne}
                onChange={(e) => setTitreInterne(e.target.value)}
                placeholder="Ex : Relance paiement Compte Pro"
                className={inputClass(false)}
              />
            </div>

            <div>
              <span className={labelClass}>Variables disponibles</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {VARIABLES_DISPONIBLES.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insererVariable(variable)}
                    title="Insérer à la position du curseur"
                    className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600 transition-colors hover:bg-[#2563EB] hover:text-white dark:bg-slate-800 dark:text-slate-300"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="wa-message">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="wa-message"
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              rows={5}
              placeholder="Écrivez votre message ici..."
              className={`${inputClass(Boolean(errors.message))} resize-y`}
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className={errors.message ? errorClass : "text-[11px] text-transparent"}>
                {errors.message ?? "."}
              </span>
              <span
                className={`shrink-0 text-[11px] font-semibold ${
                  message.length >= MESSAGE_MAX_LENGTH ? "text-rose-500" : "text-slate-400"
                }`}
              >
                {message.length}/{MESSAGE_MAX_LENGTH}
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. Aperçu
        ==================================================================== */}
        <section className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className={sectionTitle}>3. Aperçu du message</h3>

          <div className="rounded-2xl bg-[#ECE5DD] p-4 dark:bg-[#0b141a]">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">
                W
              </span>

              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-[#DCF8C6] px-3.5 py-2.5 shadow-sm dark:bg-[#005c4b]">
                <div className="space-y-1 break-words text-sm text-slate-800 dark:text-slate-100">
                  {lignesApercu.map((ligne, index) => (
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
            Ceci est un aperçu. Le rendu peut légèrement varier selon l'appareil du destinataire.
          </p>
        </section>

        {/* ===================================================================
            4. Statut
        ==================================================================== */}
        <section className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className={sectionTitle}>4. Statut</h3>

          <div className="flex flex-wrap items-center gap-5">
            {STATUTS.map((valeur) => (
              <label
                key={valeur}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <input
                  type="radio"
                  name="wa-statut"
                  checked={statut === valeur}
                  onChange={() => setStatut(valeur)}
                  className="h-4 w-4 cursor-pointer border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/30 dark:border-slate-600"
                />
                {STATUT_LABELS[valeur]}
              </label>
            ))}
          </div>
        </section>
      </div>
    </RightModal>
  );
}
