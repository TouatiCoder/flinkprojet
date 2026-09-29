import { Search, SlidersHorizontal, Plus } from "lucide-react";

interface ProspectHeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onAddClick?: () => void;
}

export default function ProspectHeader({
  searchTerm = "",
  onSearchChange,
  onFilterClick,
  onAddClick,
}: ProspectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
      <div className="relative flex-1 w-full max-w-md mb-2">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Rechercher un prospect..."
          className="w-full pl-10 pr-4 py-2 text-[13.5px] rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-[0px_1px_2px_rgba(0,0,0,0.03)]"
        />
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800/80 transition-colors shadow-[0px_1px_2px_rgba(0,0,0,0.03)]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-gray-300" />
          <span>Filtres</span>
        </button>

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#E60067] hover:bg-[#D0005C] active:bg-[#B80052] rounded-xl transition-all shadow-[0px_2px_6px_rgba(230,0,103,0.25)] hover:shadow-[0px_4px_12px_rgba(230,0,103,0.35)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Ajouter un prospect</span>
        </button>
      </div>
    </div>
  );
}