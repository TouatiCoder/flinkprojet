import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookies";
import { ApiBaseUrl } from "../constants/publicConstants";
import { MembreItem } from "../components/dashboard/membre/MembresTable";

export interface MembreVille {
  id: number;
  name: string;
}

export interface MembreEquipe {
  id: number;
  nom: string;
  color: string;
  responsable_id: number | null;
  responsable_name: string | null;
}

export interface MembreRole {
  id: number;
  name: string;
}

export interface MembreActivite {
  id: number;
  name: string;
}

export interface FormDependenciesResponse {
  status: string;
  data: {
    villes: MembreVille[];
    equipes: MembreEquipe[];
    roles: MembreRole[];
    activites: MembreActivite[];
  };
}

export interface MembresListResponse {
  status: string;
  data: MembreItem[];
}

// -----------------------------------------------------------------------------
// GET /membres/{id} — détail complet d'un membre (MembreController@show).
// Les informations absentes en base sont renvoyées à `null` par l'API : les
// composants affichent alors « — » plutôt qu'une valeur inventée.
// -----------------------------------------------------------------------------
export interface MembreDetailRole {
  id: number | null;
  // MembreController@show renvoie toujours l'objet `role`, mais `name` vaut
  // null quand aucun rôle n'est rattaché au membre.
  name: string | null;
}

export interface MembreDetailVille {
  id: number;
  name: string;
}

export interface MembreDetailEquipe {
  id: number;
  nom: string;
  color?: string | null;
}

export interface MembreDetailResponsable {
  id: number;
  nom: string;
  avatar?: string | null;
}

export interface MembreObjectifs {
  users_convertis: number;
  comptes_pro: number;
  solde_ads: number;
}

// KPI calculés côté API à partir du pipeline et des activités. Chaque valeur
// peut être null quand la donnée n'est pas calculable.
export interface MembreDetailKpis {
  relances_en_retard: number | null;
  opportunites_gagnees: number | null;
  opportunites_gagnees_evolution_pct: number | null;
  opportunites_perdues: number | null;
  opportunites_perdues_evolution_pct: number | null;
}

// Activité renvoyée dans `activites_recentes`.
// `type` et `resultat` sont normalisés par l'API ; lorsque la valeur
// enregistrée en base n'entre dans aucune catégorie connue, ils valent null et
// c'est le `*_label` correspondant qui porte le libellé brut à afficher.
export interface MembreActiviteRecente {
  id: number | string;
  date: string | null;
  heure: string | null;
  type: "appel" | "whatsapp" | "demo" | "email" | null;
  type_label?: string | null;
  prospect: string | null;
  opportunite_ref: string | null;
  resultat:
    | "interesse"
    | "a_relancer"
    | "pas_interesse"
    | "reponse_recue"
    | null;
  resultat_label?: string | null;
  // Format "2026-09-18 10:00:00".
  prochaine_action?: string | null;
}

export interface MembreDetail {
  id: number;
  nom_complet: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  telephone: string | null;
  avatar: string | null;
  ville_id: number | null;
  equipe_id: number | null;
  role_id: number | null;
  is_active: "actif" | "inactif";

  // Objets liés résolus par l'API (le "show" renvoie l'objet complet en plus
  // de l'id, contrairement au formulaire qui n'utilise que les *_id).
  role: MembreDetailRole | null;
  ville: MembreDetailVille | null;
  equipe: MembreDetailEquipe | null;
  responsable: MembreDetailResponsable | null;

  // ⚠️ Le endpoint "show" renvoie les secteurs sous forme d'IDs (pas de
  // noms) contrairement à l'endpoint "index" qui renvoie des noms.
  // `secteurs_noms` fournit les libellés correspondants pour l'affichage.
  secteurs: number[];
  secteurs_noms: string[];

  capacite_max_leads: number;
  leads_actifs: number;

  // Colonne `manager_users.nb_prospect_par_jour`.
  limite_prospection: number;
  // Colonne `manager_users.methode_affectation` (nullable) — elle existe bien
  // en base, MembreController y écrit.
  methode_affectation: string | null;
  is_managing: boolean;

  created_at: string | null;
  // Pas de colonne dédiée en base : l'API renvoie null.
  notes_internes: string | null;

  kpis: MembreDetailKpis | null;

  // `objectifs` = cible définie sur le membre, `objectifs_realises` = réalisé
  // mesuré en base.
  objectifs: MembreObjectifs;
  objectifs_realises: MembreObjectifs;

  activites_recentes: MembreActiviteRecente[];
}

export interface SingleMembreResponse {
  status: string;
  data: MembreDetail;
}

// Réponse commune aux mutations (POST /membres, PUT /membres/{id},
// DELETE /membres/{id}/avatar).
//
// ⚠️ `data` n'a PAS la forme de `MembreDetail` : le contrôleur renvoie le
// modèle Eloquent brut (`$user->load('activites')`), donc les colonnes de la
// table `manager_users` (first_name, last_name, nb_prospect_par_jour, ...) et
// non les champs formatés de `show()`. Aucun écran ne l'exploite aujourd'hui
// (les callbacks `onSubmitSuccess` se contentent d'un console.log) : à typer
// précisément le jour où ce sera le cas.
export interface MembreMutationResponse {
  status: string;
  message: string;
  data: unknown;
}

export interface CreateMembrePayload {
  nom_complet: string;
  email: string;
  password?: string;
  telephone?: string | null;
  avatar?: string | null;
  ville_id?: number | null;
  status: "actif" | "inactif";
  equipe_id?: number | null;
  role_id?: number | null;
  secteurs?: number[];
  capacite_max_leads?: number;
  methode_affectation?: string;
  // Colonne `manager_users.nb_prospect_par_jour`.
  limite_prospection?: number;
  is_managing?: boolean;
  objectifs?: {
    users_convertis?: number;
    comptes_pro?: number;
    solde_ads?: number;
  };
}

export interface UpdateMembrePayload
  extends Partial<CreateMembrePayload> {
  id: number;
}

/**
 * Réponse standard des mutations membre.
 *
 * Le backend peut renvoyer un objet `data`, mais sa structure
 * n'est pas utilisée directement par les composants concernés.
 * On utilise donc `unknown` plutôt que `any`.
 */
export interface MembreMutationResponse {
  status: string;
  message: string;
  data: unknown;
}

/**
 * Structure possible d'une erreur API Laravel / RTK Query.
 */
interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
}

interface FetchBaseQueryErrorLike {
  data?: ApiErrorData;
  error?: string;
  status?: number | string;
}

export const membresApi = createApi({
  reducerPath: "membresApi",

  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    credentials: "include",

    prepareHeaders: (headers) => {
      const token = getCookie("TOKEN");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },

    responseHandler: async (response) => {
      if (
        response.status === 403 &&
        window.location.pathname !== "/403"
      ) {
        window.location.href = "/403";
      }

      return response.json();
    },
  }),

  tagTypes: [
    "Membres",
    "FormDependencies",
    "MembreDetail",
  ],

  endpoints: (builder) => ({
    // GET /membres/form-dependencies
    getFormDependencies:
      builder.query<FormDependenciesResponse, void>({
        query: () => "/membres/form-dependencies",

        providesTags: ["FormDependencies"],
      }),

    // GET /membres
    //
    // Le backend renvoie tous les membres.
    // Recherche / filtres / pagination sont gérés côté front.
    getMembres: builder.query<MembresListResponse, void>({
      query: () => "/membres",

      providesTags: ["Membres"],
    }),

    // GET /membres/{id}
    getMembreById: builder.query<
      SingleMembreResponse,
      number | string
    >({
      query: (id) => `/membres/${id}`,

      providesTags: (_result, _error, id) => [
        {
          type: "MembreDetail",
          id,
        },
      ],
    }),

    // POST /membres
    createMembre: builder.mutation<
      MembreMutationResponse,
      FormData | CreateMembrePayload
    >({
      query: (data) => ({
        url: "/membres",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Membres"],
    }),

    // PUT /membres/{id}
    updateMembre: builder.mutation<
      MembreMutationResponse,
      UpdateMembrePayload
    >({
      query: ({ id, ...data }) => ({
        url: `/membres/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (_result, _error, { id }) => [
        "Membres",
        {
          type: "MembreDetail",
          id,
        },
      ],
    }),

    // DELETE /membres/{id}/avatar
    removeAvatarMembre: builder.mutation<
      MembreMutationResponse,
      number
    >({
      query: (id) => ({
        url: `/membres/${id}/avatar`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, id) => [
        "Membres",
        {
          type: "MembreDetail",
          id,
        },
      ],
    }),
  }),
});

export const {
  useGetFormDependenciesQuery,
  useGetMembresQuery,
  useGetMembreByIdQuery,
  useCreateMembreMutation,
  useUpdateMembreMutation,
  useRemoveAvatarMembreMutation,
} = membresApi;

/**
 * Extrait un message lisible depuis une erreur API.
 */
export function extractApiErrorMessage(
  err: unknown,
  fallback: string
): string {
  if (!err) {
    return fallback;
  }

  const error = err as FetchBaseQueryErrorLike;
  const data = error.data;

  if (!data) {
    return error.error || fallback;
  }

  if (
    data.errors &&
    typeof data.errors === "object"
  ) {
    const firstKey = Object.keys(data.errors)[0];

    const firstValue = firstKey
      ? data.errors[firstKey]
      : undefined;

    const firstMessage = Array.isArray(firstValue)
      ? firstValue[0]
      : firstValue;

    if (firstMessage) {
      return String(firstMessage);
    }
  }

  return data.message || data.error || fallback;
}