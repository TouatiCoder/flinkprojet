import { useState } from "react";
import { ChevronDown, X, Search, RotateCcw } from "lucide-react";
import PaymentDateRangeFilter, { DateRangeValue } from "../payments/PaymentDateRangeFilter";

export interface FilterOption {
  id: string | number;
  name: string;
  avatar?: string | null;
  role?: string;
}

export interface UsersFilterState {
  search: string;
  commercial: string;
  secteur: string;
  source: string;
  verification: string;
  compte_pro: string;
  periode: string;
  startDate?: string;
  endDate?: string;
}

export interface UsersFilterOptionsData {
  commerciaux?: FilterOption[];
  secteurs?: FilterOption[];
  sources?: FilterOption[];
}

interface UsersFilterProps {
  filters: UsersFilterState;
  onFilterChange: (key: keyof UsersFilterState, value: string) => void;
  onReset?: () => void;
  options?: UsersFilterOptionsData;
}

export default function UsersFilter({
  filters,
  onFilterChange,
  onReset,
  options,
}: UsersFilterProps) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const sanitizeList = (list: FilterOption[] = [], defaultAllText: string = "Tous") => {
    const withoutAll = list.filter((item) => String(item.id).toLowerCase() !== "all");
    return [{ id: "all", name: defaultAllText }, ...withoutAll];
  };

  const commerciauxList = sanitizeList(options?.commerciaux, "Tous");
  const secteursList = sanitizeList(options?.secteurs, "Tous");
  const sourcesList = sanitizeList(options?.sources, "Toutes");

  const verificationList: FilterOption[] = [
    { id: "all", name: "Tous" },
    { id: "verified", name: "Totalement vérifié" },
    { id: "email_only", name: "Email vérifié seul" },
    { id: "phone_only", name: "Téléphone vérifié seul" },
    { id: "unverified", name: "Non vérifié" },
  ];

  const compteProList: FilterOption[] = [
    { id: "all", name: "Tous" },
    { id: "with_pro", name: "Avec Compte Pro" },
    { id: "without_pro", name: "Sans Compte Pro" },
  ];

  const currentCommercial = commerciauxList.find((r) => String(r.id) === String(filters.commercial));
  const isCommercialSelected = currentCommercial && currentCommercial.id !== "all";

  const currentSecteur = secteursList.find((s) => String(s.id) === String(filters.secteur));
  const isSecteurSelected = currentSecteur && currentSecteur.id !== "all";

  const currentSource = sourcesList.find((src) => String(src.id) === String(filters.source));
  const isSourceSelected = currentSource && currentSource.id !== "all";

  const currentVerification = verificationList.find((v) => String(v.id) === String(filters.verification));
  const isVerificationSelected = currentVerification && currentVerification.id !== "all";

  const currentComptePro = compteProList.find((c) => String(c.id) === String(filters.compte_pro));
  const isCompteProSelected = currentComptePro && currentComptePro.id !== "all";

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
    <div className="w-full relative z-40 mb-6 overflow-visible">
      <div className="flex items-center gap-2 w-full flex-wrap xl:flex-nowrap overflow-visible">
        
        <div className="relative z-50 shrink-0">
          <PaymentDateRangeFilter
            value={{
              dateFrom: filters.startDate || "",
              dateTo: filters.endDate || "",
              preset: filters.periode || "this_week",
            }}
            isOpen={isDateRangeOpen}
            onToggle={() => setIsDateRangeOpen((prev) => !prev)}
            onClose={() => setIsDateRangeOpen(false)}
            onChange={handleDateRangeChange}
            placeholder="Période"
            align="left"
            buttonClassName="h-[50px] min-w-[135px] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
          />
        </div>

        <div className="relative h-[50px] min-w-[125px] shrink-0 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Secteur
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isSecteurSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-700 dark:text-slate-200"}`}>
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
              <option key={item.id} value={item.id} className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5">
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[125px] shrink-0 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Source
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isSourceSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-700 dark:text-slate-200"}`}>
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
              <option key={item.id} value={item.id} className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5">
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[130px] shrink-0 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Vérification
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isVerificationSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-700 dark:text-slate-200"}`}>
              {currentVerification?.name || "Tous"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.verification}
            onChange={(e) => onFilterChange("verification", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {verificationList.map((item) => (
              <option key={item.id} value={item.id} className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5">
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[130px] shrink-0 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Compte Pro
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[11.5px] font-semibold truncate ${isCompteProSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-700 dark:text-slate-200"}`}>
              {currentComptePro?.name || "Tous"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
          </div>

          <select
            value={filters.compte_pro}
            onChange={(e) => onFilterChange("compte_pro", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {compteProList.map((item) => (
              <option key={item.id} value={item.id} className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5">
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-[50px] min-w-[135px] shrink-0 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex flex-col justify-center shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            Commercial
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            {isCommercialSelected ? (
              <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-10">
                {currentCommercial.avatar ? (
                  <img src={currentCommercial.avatar} alt={currentCommercial.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8.5px] font-bold flex items-center justify-center">
                    {currentCommercial.name.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[70px]">
                  {currentCommercial.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterChange("commercial", "all");
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
            value={filters.commercial}
            onChange={(e) => onFilterChange("commercial", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11.5px] font-semibold"
          >
            {commerciauxList.map((item) => (
              <option key={item.id} value={item.id} className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c1527] py-1.5">
                {item.name} {item.role ? `(${item.role})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[180px] h-[50px] px-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center gap-2.5 shadow-xs transition-colors focus-within:border-[#5C24E8] dark:focus-within:border-[#5C24E8]">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Nom, email, téléphone ou ID..."
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