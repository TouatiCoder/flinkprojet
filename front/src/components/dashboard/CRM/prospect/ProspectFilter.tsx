import { useState } from "react";
import { ChevronDown, X, Search, RotateCcw } from "lucide-react";
import PaymentDateRangeFilter, { DateRangeValue } from "../../payments/PaymentDateRangeFilter";

export interface FilterOption {
  id: string | number;
  name: string;
  avatar?: string | null;
  role?: string;
}

export interface ProspectFilterState {
  search: string;
  responsable: string;
  etape: string;
  objectif: string;
  secteur: string;
  source: string;
  periode: string;
  startDate?: string;
  endDate?: string;
}

export interface ProspectFilterOptionsData {
  responsables?: FilterOption[];
  etapes?: FilterOption[];
  objectifs?: FilterOption[];
  secteurs?: FilterOption[];
  sources?: FilterOption[];
  periodes?: FilterOption[];
}

interface ProspectFilterProps {
  filters: ProspectFilterState;
  onFilterChange: (key: keyof ProspectFilterState, value: string) => void;
  onReset?: () => void;
  onMoreFiltersClick?: () => void;
  options?: ProspectFilterOptionsData;
}

export default function ProspectFilter({
  filters,
  onFilterChange,
  onReset,
  options,
}: ProspectFilterProps) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const defaultResponsables: FilterOption[] = [
    { id: "all", name: "Tous" },
  ];

  const defaultEtapes: FilterOption[] = [
    { id: "all", name: "Toutes" },
    { id: "1", name: "Nouveau" },
    { id: "2", name: "À rappeler" },
    { id: "3", name: "Qualifié" },
    { id: "4", name: "En attente" },
    { id: "5", name: "Gagné" },
    { id: "6", name: "Perdu" },
  ];

  const defaultObjectifs: FilterOption[] = [
    { id: "all", name: "Tous" },
    { id: "1", name: "Devenir User" },
    { id: "2", name: "Compte Pro" },
    { id: "3", name: "Solde Ads" },
    { id: "4", name: "Renouvellement Pro" },
  ];

  const defaultSecteurs: FilterOption[] = [
    { id: "all", name: "Tous" },
  ];

  const defaultSources: FilterOption[] = [
    { id: "all", name: "Toutes" },
  ];

  const formatList = (list: FilterOption[], defaultAllText: string) => {
    return list.map((item) => {
      if (String(item.id) === "all") {
        return { ...item, name: defaultAllText };
      }
      return item;
    });
  };

  const responsablesList = formatList(options?.responsables || defaultResponsables, "Tous");
  const etapesList = formatList(options?.etapes || defaultEtapes, "Toutes");
  const objectifsList = formatList(options?.objectifs || defaultObjectifs, "Tous");
  const secteursList = formatList(options?.secteurs || defaultSecteurs, "Tous");
  const sourcesList = formatList(options?.sources || defaultSources, "Toutes");

  const currentResponsable = responsablesList.find((r) => String(r.id) === String(filters.responsable));
  const isResponsableSelected = currentResponsable && currentResponsable.id !== "all";

  const currentEtape = etapesList.find((e) => String(e.id) === String(filters.etape));
  const isEtapeSelected = currentEtape && currentEtape.id !== "all";

  const currentObjectif = objectifsList.find((o) => String(o.id) === String(filters.objectif));
  const isObjectifSelected = currentObjectif && currentObjectif.id !== "all";

  const currentSecteur = secteursList.find((s) => String(s.id) === String(filters.secteur));
  const isSecteurSelected = currentSecteur && currentSecteur.id !== "all";

  const currentSource = sourcesList.find((src) => String(src.id) === String(filters.source));
  const isSourceSelected = currentSource && currentSource.id !== "all";

  const handleDateRangeChange = ({ dateFrom, dateTo, preset }: DateRangeValue) => {
    onFilterChange("startDate", dateFrom);
    onFilterChange("endDate", dateTo);
    if (preset) {
      onFilterChange("periode", preset);
    } else if (dateFrom || dateTo) {
      onFilterChange("periode", "custom");
    } else {
      onFilterChange("periode", "all");
    }
  };

  return (
    <div className="space-y-3 w-full relative z-30">
      <div className="flex items-center gap-2 w-full flex-wrap xl:flex-nowrap">

        <div className="relative h-[50px] min-w-[130px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Commercial
          </span>

          <div className="flex items-center justify-between gap-1 mt-1">
            {isResponsableSelected ? (
              <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-10">
                {currentResponsable.avatar ? (
                  <img
                    src={currentResponsable.avatar}
                    alt={currentResponsable.name}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8.5px] font-bold flex items-center justify-center">
                    {currentResponsable.name.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[75px]">
                  {currentResponsable.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterChange("responsable", "all");
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                Tous
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.responsable}
            onChange={(e) => onFilterChange("responsable", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {responsablesList.map((item) => (
              <option
                key={item.id}
                value={item.id}
                className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5"
              >
                {item.name} {item.role ? `(${item.role})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[125px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Étape
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isEtapeSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-700 dark:text-slate-200"}`}>
              {currentEtape?.name || "Toutes"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.etape}
            onChange={(e) => onFilterChange("etape", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {etapesList.map((item) => (
              <option
                key={item.id}
                value={item.id}
                className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5"
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[130px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Objectif
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isObjectifSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"}`}>
              {currentObjectif?.name || "Tous"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.objectif}
            onChange={(e) => onFilterChange("objectif", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {objectifsList.map((item) => (
              <option
                key={item.id}
                value={item.id}
                className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5"
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[125px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Secteur
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isSecteurSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
              {currentSecteur?.name || "Tous"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.secteur}
            onChange={(e) => onFilterChange("secteur", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {secteursList.map((item) => (
              <option
                key={item.id}
                value={item.id}
                className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5"
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[125px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Source
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isSourceSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200"}`}>
              {currentSource?.name || "Toutes"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.source}
            onChange={(e) => onFilterChange("source", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {sourcesList.map((item) => (
              <option
                key={item.id}
                value={item.id}
                className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5"
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <PaymentDateRangeFilter
          value={{
            dateFrom: filters.startDate || "",
            dateTo: filters.endDate || "",
            preset: filters.periode || "this_month",
          }}
          isOpen={isDateRangeOpen}
          onToggle={() => setIsDateRangeOpen((prev) => !prev)}
          onClose={() => setIsDateRangeOpen(false)}
          onChange={handleDateRangeChange}
          placeholder="Période"
          align="right"
          buttonClassName="h-[50px] min-w-[130px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
        />

        <div className="relative flex-1 min-w-[170px] h-[50px] px-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center gap-2.5 shadow-xs transition-colors focus-within:border-[#5C24E8] dark:focus-within:border-[#5C24E8]">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Rechercher..."
            className="w-full text-xs font-medium text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange("search", "")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Réinitialiser les filtres"
            className="w-[50px] h-[50px] shrink-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center justify-center text-slate-500 hover:text-[#5C24E8] dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-800 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

      </div>
    </div>
  );
}