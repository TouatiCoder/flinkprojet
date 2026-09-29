/**
 * -----------------------------------------------------------------------------
 * Templates WhatsApp
 * -----------------------------------------------------------------------------
 *
 * Contrat partagé entre la page Templates, le formulaire et le sélecteur du
 * CRM. Il reflète ce que renvoie WhatsappTemplateController.
 *
 * Les libellés et couleurs restent centralisés ici pour que le filtre, les
 * cartes et le tableau restent cohérents ; ils servent de repli lorsque l'API
 * ne fournit pas `usage_label` / `usage_color`.
 */

export type WhatsappAudience = "prospect" | "user" | "compte_pro";

export type WhatsappUsage =
  | "bienvenue"
  | "paiement"
  | "qualification"
  | "confirmation"
  | "engagement"
  | "conversion"
  | "relance"
  | "satisfaction";

export type WhatsappLangue = "fr" | "ar";

export type WhatsappStatut = "brouillon" | "actif" | "inactif";

/** Variables interpolées par le backend au moment de l'envoi. */
export const VARIABLES_DISPONIBLES = [
  "{{nom}}",
  "{{produit}}",
  "{{montant}}",
  "{{date}}",
  "{{commercial}}",
  "{{lien}}",
] as const;

/** Longueur maximale d'un message WhatsApp côté formulaire. */
export const MESSAGE_MAX_LENGTH = 1024;

export interface WhatsappTemplate {
  id: number;
  nom: string;
  description: string;
  /** Un template peut viser plusieurs audiences à la fois. */
  audiences: WhatsappAudience[];
  /** Id du type, utilisé pour préremplir le formulaire de modification. */
  type_id: number | null;
  /**
   * Slug du type renvoyé par l'API. Volontairement `string` et non l'union
   * `WhatsappUsage` : les types vivent dans `ma_whatsapp_template_types` et
   * peuvent être enrichis sans toucher au front.
   */
  usage: string | null;
  usage_label?: string | null;
  usage_color?: string | null;
  langue: WhatsappLangue;
  statut: WhatsappStatut;
  /**
   * Corps du message, variables comprises. Optionnel : une liste peut
   * n'exposer que les métadonnées et charger le corps à l'ouverture.
   */
  message?: string;
  /** Date ISO de dernière modification. */
  updated_at: string | null;
  /** Nom affiché sous la date (« Par … »). */
  updated_by: string;
}

/**
 * Ce que le formulaire envoie à la création / modification.
 * Correspond au contrat de WhatsappTemplateController : le type est transmis
 * par son id, pas par son slug.
 */
export interface WhatsappTemplatePayload {
  nom: string;
  /** « Titre interne » du formulaire, affiché sous le nom dans le tableau. */
  description: string;
  audiences: WhatsappAudience[];
  type_id: number;
  langue: WhatsappLangue;
  message: string;
  statut: WhatsappStatut;
}

/** Classe de badge d'un type, avec repli si le slug est inconnu du front. */
export function classeUsage(slug?: string | null): string {
  if (slug && slug in USAGE_CLASSES) {
    return USAGE_CLASSES[slug as WhatsappUsage];
  }
  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

// -----------------------------------------------------------------------------
// Libellés et couleurs
// -----------------------------------------------------------------------------

export const AUDIENCE_LABELS: Record<WhatsappAudience, string> = {
  prospect: "Prospect",
  user: "User",
  compte_pro: "Compte Pro",
};

export const AUDIENCE_CLASSES: Record<WhatsappAudience, string> = {
  prospect: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  user: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  compte_pro: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

export const USAGE_LABELS: Record<WhatsappUsage, string> = {
  bienvenue: "Bienvenue",
  paiement: "Paiement",
  qualification: "Qualification",
  confirmation: "Confirmation",
  engagement: "Engagement",
  conversion: "Conversion",
  relance: "Relance",
  satisfaction: "Satisfaction",
};

export const USAGE_CLASSES: Record<WhatsappUsage, string> = {
  bienvenue: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
  paiement: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
  qualification: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  confirmation: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  engagement: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  conversion: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
  relance: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  satisfaction: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300",
};

export const LANGUE_LABELS: Record<WhatsappLangue, string> = {
  fr: "FR",
  ar: "AR",
};

/** Drapeau en emoji : évite d'embarquer des images pour deux langues. */
export const LANGUE_FLAGS: Record<WhatsappLangue, string> = {
  fr: "🇫🇷",
  ar: "🇲🇦",
};

export const STATUT_LABELS: Record<WhatsappStatut, string> = {
  brouillon: "Brouillon",
  actif: "Actif",
  inactif: "Inactif",
};

export const STATUT_CLASSES: Record<WhatsappStatut, string> = {
  brouillon: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  actif: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  inactif: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

/** Couleur de la pastille précédant le libellé de statut. */
export const STATUT_DOT_CLASSES: Record<WhatsappStatut, string> = {
  brouillon: "bg-amber-500",
  actif: "bg-emerald-500",
  inactif: "bg-slate-400",
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** « 2026-09-20 » -> « 20 sept. 2026 ». */
export function formatDateTemplate(valeur?: string | null): string {
  if (!valeur) {
    return "—";
  }

  const date = new Date(valeur);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// -----------------------------------------------------------------------------
// Filtres
// -----------------------------------------------------------------------------

export interface WhatsappFilterValues {
  search: string;
  audience: string;
  usage: string;
  langue: string;
  statut: string;
}

export const FILTRES_PAR_DEFAUT: WhatsappFilterValues = {
  search: "",
  audience: "tous",
  usage: "tous",
  langue: "toutes",
  statut: "tous",
};

export interface WhatsappCounts {
  actifs: number;
  prospect: number;
  user: number;
  comptePro: number;
}

/**
 * Compteurs des cartes, calculés sur la liste complète (avant filtrage) :
 * ce sont des totaux, pas le reflet du filtre courant.
 */
export function compterTemplates(templates: WhatsappTemplate[]): WhatsappCounts {
  const counts: WhatsappCounts = { actifs: 0, prospect: 0, user: 0, comptePro: 0 };

  for (const template of templates) {
    if (template.statut === "actif") {
      counts.actifs += 1;
    }

    if (template.audiences.includes("prospect")) counts.prospect += 1;
    if (template.audiences.includes("user")) counts.user += 1;
    if (template.audiences.includes("compte_pro")) counts.comptePro += 1;
  }

  return counts;
}
