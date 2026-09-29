import { Plus } from "lucide-react";

interface EquipeHeaderProps {
  totalEquipes: number;
  totalCommerciaux: number;
  onAddEquipe?: () => void;
}

/** « 1 équipe » / « 5 équipes » — évite le pluriel fautif sur 0 et 1. */
const pluriel = (n: number, singulier: string, pluriel: string) =>
  `${n} ${n > 1 ? pluriel : singulier}`;

export default function EquipeHeader({
  totalEquipes,
  totalCommerciaux,
  onAddEquipe,
}: EquipeHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-start">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Équipes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Organisez vos équipes commerciales et suivez leurs performances.
        </p>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {pluriel(totalEquipes, "équipe", "équipes")}
          <span className="mx-1.5">·</span>
          {pluriel(totalCommerciaux, "commercial", "commerciaux")}
        </p>
      </div>

      {/* Absent sans le droit de création : voir `canCreate` dans Equipe.tsx. */}
      {onAddEquipe && (
        <button
          type="button"
          onClick={onAddEquipe}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-all hover:bg-[#6D28D9] hover:shadow-violet-500/30 active:bg-[#5B21B6]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Créer une équipe</span>
        </button>
      )}
    </div>
  );
}
