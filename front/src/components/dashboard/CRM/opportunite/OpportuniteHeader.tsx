import { Search, Filter, Plus, Bell, ChevronDown } from "lucide-react";

interface OpportuniteHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  onAddClick: () => void;
  notificationsCount?: number;
}

export default function OpportuniteHeader({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onAddClick,
  notificationsCount = 12,
}: OpportuniteHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">
          Opportunités
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          <span>CRM</span>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Opportunités
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une opportunité..."
            className="w-full pl-9 pr-3.5 py-2 text-[13px] bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          />
        </div>

        <button
          type="button"
          onClick={onFilterClick}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filtres</span>
        </button>

        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#E60067] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
              {notificationsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#E60067] hover:bg-[#d0005d] text-white rounded-xl text-[13px] font-semibold transition-all shadow-[0px_2px_8px_rgba(230,0,103,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle opportunité</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    </div>
  );
}