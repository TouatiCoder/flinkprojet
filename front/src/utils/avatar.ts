import { ApiBaseUrl } from "../constants/publicConstants";

/**
 * Transforme le chemin d'avatar stocké en base en URL affichable.
 *
 * L'API renvoie un chemin relatif (« /uploads/avatars/xxx.png ») : il faut le
 * préfixer par l'origine du backend, qui change entre le local et la
 * production. Les URL absolues et les images base64 (prévisualisation avant
 * envoi) sont laissées telles quelles.
 */
export function resolveAvatarUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const clean = path.startsWith("/") ? path.slice(1) : path;

  let backendOrigin = "";

  try {
    backendOrigin = new URL(ApiBaseUrl).origin;
  } catch {
    // ApiBaseUrl mal formée : on retombe sur un découpage textuel.
    backendOrigin = ApiBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }

  return `${backendOrigin}/${clean}`;
}

/** Initiales affichées quand aucun avatar n'est disponible. */
export function initialesDe(nom?: string | null, repli = "U"): string {
  const parts = (nom ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase());

  return parts.length > 0 ? parts.join("") : repli;
}
