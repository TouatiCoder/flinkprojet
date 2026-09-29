import type { MembreItem } from "../membre/MembresTable";

/**
 * -----------------------------------------------------------------------------
 * Agrégation des indicateurs d'équipe
 * -----------------------------------------------------------------------------
 *
 * GET /manager/equipes ne calcule aucun indicateur : `total_leads` et
 * `taux_atteinte` y sont renvoyés en dur à 0, et ni les objectifs ni les
 * relances en retard n'y figurent (voir EquipeController@getEquipes).
 *
 * En revanche GET /manager/membres renvoie déjà, pour CHAQUE commercial :
 *   - `equipe_principale` : l'équipe de rattachement
 *   - `leads_actifs`      : opportunités actives réelles (pipeline)
 *   - `retards`           : relances en retard réelles
 *   - `devenir_user` / `compte_pro` / `solde_ads` : { actuel, objectif, pourcentage }
 *
 * Les chiffres affichés sur la page Équipes sont donc la somme des membres de
 * chaque équipe. Aucune valeur n'est inventée : une équipe sans membre affiche
 * des zéros, et un objectif à 0 donne un taux de 0 % (jamais une division par
 * zéro).
 */

export interface ObjectifAgrege {
  actuel: number;
  objectif: number;
  /** Entier 0-100, plafonné, comme le `pourcentage` calculé côté backend. */
  pourcentage: number;
}

export interface EquipeStats {
  membres: number;
  leadsActifs: number;
  capacite: number;
  retards: number;
  devenirUser: ObjectifAgrege;
  comptePro: ObjectifAgrege;
  soldeAds: ObjectifAgrege;
}

/** Indicateurs cumulés sur l'ensemble des commerciaux (cartes du haut). */
export interface EquipeGlobalStats extends EquipeStats {
  commerciaux: number;
}

const emptyObjectif = (): ObjectifAgrege => ({
  actuel: 0,
  objectif: 0,
  pourcentage: 0,
});

export const emptyStats = (): EquipeStats => ({
  membres: 0,
  leadsActifs: 0,
  capacite: 0,
  retards: 0,
  devenirUser: emptyObjectif(),
  comptePro: emptyObjectif(),
  soldeAds: emptyObjectif(),
});

/**
 * Même formule que `MembreController::buildMetric()` : plafonné à 100 %, et 0 %
 * quand aucun objectif n'est fixé (plutôt que NaN ou Infinity).
 */
export function tauxAtteinte(actuel: number, objectif: number): number {
  if (objectif <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((actuel / objectif) * 100));
}

function addMetric(cible: ObjectifAgrege, metric?: { actuel?: number; objectif?: number }): void {
  cible.actuel += Number(metric?.actuel ?? 0);
  cible.objectif += Number(metric?.objectif ?? 0);
  cible.pourcentage = tauxAtteinte(cible.actuel, cible.objectif);
}

function addMembre(cible: EquipeStats, membre: MembreItem): void {
  cible.membres += 1;
  cible.leadsActifs += Number(membre.leads_actifs ?? 0);
  cible.capacite += Number(membre.capacite_max_leads ?? 0);
  cible.retards += Number(membre.retards ?? 0);

  addMetric(cible.devenirUser, membre.devenir_user);
  addMetric(cible.comptePro, membre.compte_pro);
  addMetric(cible.soldeAds, membre.solde_ads);
}

/**
 * Regroupe les commerciaux par `equipe_principale.id`.
 * Les membres sans équipe sont ignorés : ils n'appartiennent à aucune ligne du
 * tableau.
 */
export function statsParEquipe(membres: MembreItem[]): Map<number, EquipeStats> {
  const parEquipe = new Map<number, EquipeStats>();

  for (const membre of membres) {
    const equipeId = membre.equipe_principale?.id;

    if (!equipeId) {
      continue;
    }

    if (!parEquipe.has(equipeId)) {
      parEquipe.set(equipeId, emptyStats());
    }

    addMembre(parEquipe.get(equipeId)!, membre);
  }

  return parEquipe;
}

/**
 * Cumul sur TOUS les commerciaux renvoyés par l'API, équipe ou non : ce sont
 * les chiffres des cartes du haut de page.
 */
export function statsGlobales(membres: MembreItem[]): EquipeGlobalStats {
  const total = emptyStats() as EquipeGlobalStats;
  total.commerciaux = 0;

  for (const membre of membres) {
    addMembre(total, membre);
  }

  total.commerciaux = total.membres;

  return total;
}

/** « 320000 » -> « 320 000 » (espaces insécables fines, format fr-FR). */
export function formatNombre(valeur: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(valeur));
}
