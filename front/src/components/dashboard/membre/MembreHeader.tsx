import { Plus } from "lucide-react";

interface MembreHeaderProps {
  onAddMembre?: () => void;
}

export default function MembreHeader({ onAddMembre }: MembreHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Membres
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Gérez les commerciaux, leurs affectations et leurs objectifs.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddMembre}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 transition-all shadow-sm shadow-violet-500/20 hover:shadow-violet-500/30 cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Ajouter un membre</span>
      </button>
    </div>
  );
}