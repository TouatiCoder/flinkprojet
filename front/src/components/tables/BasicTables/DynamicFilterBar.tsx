import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import PaymentDateRangeFilter, { DateRangeValue } from "../../dashboard/payments/PaymentDateRangeFilter";

export interface SelectOption {
  label: string;
  value: string;
  status?: number;
}

export type FilterField =
  | {
      id: string;
      label: string;
      type: "text";
      placeholder: string;
    }
  | {
      id: string;
      label: string;
      type: "select";
      options: SelectOption[];
      isSearchable?: boolean;
    };

interface DynamicFilterBarProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  onFilter?: () => void;
  startDate?: string;
  endDate?: string;
  periode?: string;
  onDateChange?: (dates: { startDate?: string; endDate?: string; periode?: string }) => void;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-w-[155px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className="w-full h-[52px] px-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center justify-between shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <span className="truncate flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white pr-2">
          {selectedOption && selectedOption.status !== undefined && (
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                Number(selectedOption.status) === 1 ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden min-w-[200px] animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/50">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-slate-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200 outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 dark:divide-gray-800/60">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3.5 py-2.5 text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/80 transition-colors flex items-center justify-between ${
                    String(opt.value) === String(value)
                      ? "bg-blue-50/70 dark:bg-blue-950/40 font-bold text-blue-600 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.status !== undefined && (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          Number(opt.status) === 1 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center italic">
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DynamicFilterBar({
  fields,
  values,
  onChange,
  startDate,
  endDate,
  periode,
  onDateChange,
}: DynamicFilterBarProps) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const textFields = fields.filter((f) => f.type === "text");
  const selectFields = fields.filter((f) => f.type === "select");

  const searchField = textFields[0];

  const handleDateRangeChange = ({ dateFrom, dateTo, preset }: DateRangeValue) => {
    if (onDateChange) {
      onDateChange({
        startDate: dateFrom,
        endDate: dateTo,
        periode: preset || (dateFrom || dateTo ? "custom" : "all"),
      });
    } else {
      onChange("startDate", dateFrom);
      onChange("endDate", dateTo);
      onChange("periode", preset || (dateFrom || dateTo ? "custom" : "all"));
    }
  };

  const currentDateFrom = startDate ?? values["startDate"] ?? "";
  const currentDateTo = endDate ?? values["endDate"] ?? "";
  const currentPeriode = periode ?? values["periode"] ?? "all";

  return (
    <div className="w-full relative z-30 mb-6">
      <div className="flex flex-wrap items-center gap-2.5 w-full">
        <PaymentDateRangeFilter
          value={{
            dateFrom: currentDateFrom,
            dateTo: currentDateTo,
            preset: currentPeriode,
          }}
          isOpen={isDateRangeOpen}
          onToggle={() => setIsDateRangeOpen((prev) => !prev)}
          onClose={() => setIsDateRangeOpen(false)}
          onChange={handleDateRangeChange}
          placeholder="Toutes les dates"
          align="left"
          buttonClassName="min-w-[155px] h-[52px] px-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center justify-between shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        />

        {selectFields.map((field) => {
          if (field.isSearchable) {
            return (
              <SearchableSelect
                key={field.id}
                options={field.options}
                value={values[field.id] ?? ""}
                onChange={(val) => onChange(field.id, val)}
                placeholder={field.label}
              />
            );
          }

          const currentOption = field.options.find(
            (opt) => String(opt.value) === String(values[field.id] ?? "")
          );

          return (
            <div
              key={field.id}
              className="relative min-w-[155px] h-[52px] px-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center justify-between shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate pr-4">
                {currentOption ? currentOption.label : field.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 pointer-events-none" />

              <select
                id={field.id}
                value={values[field.id] ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {field.options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="text-slate-800 dark:text-slate-200 dark:bg-gray-900 font-medium"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {searchField && (
          <div className="relative flex-1 min-w-[200px] h-[52px] px-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070e1b] flex items-center gap-3 shadow-xs transition-colors focus-within:border-[#5C24E8] dark:focus-within:border-[#5C24E8]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              id={searchField.id}
              value={values[searchField.id] ?? ""}
              onChange={(e) => onChange(searchField.id, e.target.value)}
              placeholder={searchField.placeholder || "Rechercher..."}
              className="w-full text-xs font-semibold text-slate-900 dark:text-white bg-transparent outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {Boolean(values[searchField.id]) && (
              <button
                type="button"
                onClick={() => onChange(searchField.id, "")}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}