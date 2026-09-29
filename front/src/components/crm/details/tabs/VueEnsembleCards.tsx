import {
  // ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  Coins,
} from "lucide-react";

export interface VueEnsembleCardData {
  scoreOpportunite: {
    score: number;
    max?: number;
    evolution?: number | string;
    evolutionText?: string;
  };
  etapeActuelle: {
    nom: string;
    depuisDate?: string;
    dureeTexte?: string;
  };
  montantPotentiel: {
    valeur: number | string;
    devise?: string;
    sousTexte?: string;
  };
  derniereInteraction: {
    delai: string;
    typeAction: string;
    heure?: string;
  };
}

interface VueEnsembleCardsProps {
  type?: "user" | "prospect" | "etablissement";
  customData?: Partial<VueEnsembleCardData>;
  onVoirDetailsOpportunite?: () => void;
}

function getScoreConfig(scoreVal: number) {
  if (scoreVal >= 100) {
    return {
      niveau: "Gagné",
      ringColor: "#10b981",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
      badgeText: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (scoreVal >= 80) {
    return {
      niveau: "Prioritaire",
      ringColor: "#8b5cf6",
      badgeBg: "bg-purple-50 dark:bg-purple-950/40",
      badgeText: "text-purple-700 dark:text-purple-300",
    };
  }
  if (scoreVal >= 60) {
    return {
      niveau: "Chaud",
      ringColor: "#3b82f6",
      badgeBg: "bg-blue-50 dark:bg-blue-950/40",
      badgeText: "text-blue-700 dark:text-blue-300",
    };
  }
  if (scoreVal >= 40) {
    return {
      niveau: "Moyen",
      ringColor: "#f97316",
      badgeBg: "bg-amber-100/70 dark:bg-amber-950/40",
      badgeText: "text-amber-800 dark:text-amber-300",
    };
  }
  return {
    niveau: "Faible",
    ringColor: "#ef4444",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
  };
}

export const PROSPECT_CARDS_DEFAULT: VueEnsembleCardData = {
  scoreOpportunite: {
    score: 10,
    max: 100,
    evolution: "+ 10 pts",
    evolutionText: "",
  },
  etapeActuelle: {
    nom: "En qualification",
    depuisDate: "Depuis le 07 sept. 2026",
    dureeTexte: "(2 jours)",
  },
  montantPotentiel: {
    valeur: 6000,
    devise: "DH",
    sousTexte: "Basé sur les objectifs sélectionnés",
  },
  derniereInteraction: {
    delai: "Aujourd'hui",
    typeAction: "Appel",
    heure: "10:33",
  },
};

export const USER_CARDS_DEFAULT: VueEnsembleCardData = {
  scoreOpportunite: {
    score: 85,
    max: 100,
    evolution: "+ 15 pts",
    evolutionText: "vs. dernière semaine",
  },
  etapeActuelle: {
    nom: "Proposition",
    depuisDate: "Depuis le 01 sept. 2026",
    dureeTexte: "(6 jours)",
  },
  montantPotentiel: {
    valeur: 12000,
    devise: "DH",
    sousTexte: "Abonnement annuel Pro",
  },
  derniereInteraction: {
    delai: "Hier",
    typeAction: "Réunion",
    heure: "14:00",
  },
};

export default function VueEnsembleCards({
  type = "prospect",
  customData,
  // onVoirDetailsOpportunite,
}: VueEnsembleCardsProps) {
  // if (type === "etablissement") {
  //   return null;
  // }

  // else if (type === "user") {
  //   return null;
  // }

  const baseData = type === "user" ? USER_CARDS_DEFAULT : PROSPECT_CARDS_DEFAULT;
  const data: VueEnsembleCardData = {
    ...baseData,
    ...customData,
  };

  const scoreNum = Number(data.scoreOpportunite.score) || 0;
  const scoreMax = Number(data.scoreOpportunite.max) || 100;
  const scoreRatio = Math.min(Math.max(scoreNum / scoreMax, 0), 1);
  const strokeDashoffset = 175.9 - 175.9 * scoreRatio;
  const scoreStyle = getScoreConfig(scoreNum);

  return (
    <div className="grid grid-cols-4 gap-2 xl:gap-2.5 w-full">
      {/* 1. Score Opportunité */}
      <div className="p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] shadow-xs flex items-center gap-2.5 min-w-0">
        <div className="relative w-[48px] h-[48px] xl:w-[52px] xl:h-[52px] shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4.5"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="transparent"
              stroke={scoreStyle.ringColor}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="175.9"
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[14px] xl:text-[15px] font-black text-slate-900 dark:text-white leading-none">
              {scoreNum}
            </span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
              /{scoreMax}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] xl:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            Score opportunité
          </p>

          <div className="mt-0.5 flex items-center gap-1">
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] xl:text-[10px] font-bold ${scoreStyle.badgeBg} ${scoreStyle.badgeText}`}
            >
              {scoreStyle.niveau}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 truncate">
            {data.scoreOpportunite.evolution && (
              <span className="text-emerald-500 font-bold flex items-center gap-0.5 shrink-0">
                <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{data.scoreOpportunite.evolution}</span>
              </span>
            )}
            <span className="truncate">{data.scoreOpportunite.evolutionText}</span>
          </div>
        </div>
      </div>

      {/* 2. Étape actuelle */}
      <div className="p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] shadow-xs flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] xl:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            Étape actuelle
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-slate-900 dark:text-white">
            <h4 className="text-[12.5px] xl:text-[13.5px] font-bold truncate leading-tight">
              {data.etapeActuelle.nom}
            </h4>
          </div>
          <p className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {data.etapeActuelle.depuisDate}{" "}
            {data.etapeActuelle.dureeTexte && (
              <span>{data.etapeActuelle.dureeTexte}</span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Montant potentiel */}
      <div className="p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] shadow-xs flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Coins className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] xl:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            Montant potentiel
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-slate-900 dark:text-white">
            <h4 className="text-[12.5px] xl:text-[13.5px] font-bold truncate leading-tight">
              {Number(data.montantPotentiel.valeur).toLocaleString("fr-FR")}{" "}
              {data.montantPotentiel.devise || "DH"}
            </h4>
          </div>
          <p className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {data.montantPotentiel.sousTexte || "Basé sur objectifs"}
          </p>
        </div>
      </div>

      {/* 4. Dernière interaction */}
      <div className="p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] shadow-xs flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] xl:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            Dernière interaction
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-slate-900 dark:text-white">
            <h4 className="text-[12.5px] xl:text-[13.5px] font-bold truncate leading-tight">
              {data.derniereInteraction.delai}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-[9.5px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
            <span>{data.derniereInteraction.typeAction}</span>
            {data.derniereInteraction.heure && (
              <>
                <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-400">à {data.derniereInteraction.heure}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}