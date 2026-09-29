import type React from "react";
import { useEffect, useState } from "react";
import Button from "../../ui/button/Button";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { CalenderIcon, ChevronDownIcon } from "../../../icons";

export interface DateRangeValue {
  dateFrom: string;
  dateTo: string;
  preset?: string | null;
  label?: string;
}

interface PaymentDateRangeFilterProps {
  value: DateRangeValue;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
}

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toISO = (d: Date | null): string =>
  d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";

const fromISO = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (d: Date | null): string => {
  if (!d) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatFrenchDate = (d: Date | null): string => {
  if (!d) return "";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildMonthGrid = (year: number, month: number): Date[] => {
  const firstOfMonth = new Date(year, month, 1);
  const jsWeekday = firstOfMonth.getDay();
  const leadingOffset = jsWeekday === 0 ? 6 : jsWeekday - 1;

  const gridStart = new Date(year, month, 1 - leadingOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
};

const getPresetRange = (type: string): { start: Date | null; end: Date | null } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (type) {
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { start: y, end: y };
    }
    case "today":
      return { start: today, end: today };
    case "this_week": {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(today.getFullYear(), today.getMonth(), diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    case "this_year": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { start, end };
    }
    case "custom":
      return { start: null, end: null };
    default:
      return { start: today, end: today };
  }
};

const PaymentDateRangeFilter: React.FC<PaymentDateRangeFilterProps> = ({
  value,
  isOpen,
  onToggle,
  onClose,
  onChange,
  placeholder,
  className = "",
  buttonClassName,
  align = "right",
}) => {
  const [draftStart, setDraftStart] = useState<Date | null>(fromISO(value.dateFrom));
  const [draftEnd, setDraftEnd] = useState<Date | null>(fromISO(value.dateTo));
  const [selectedPreset, setSelectedPreset] = useState<string | null>(() => {
    if (value.preset && value.preset !== "all" && value.preset !== "custom") {
      return value.preset;
    }
    return null;
  });

  const [viewDate, setViewDate] = useState(() => fromISO(value.dateFrom) ?? new Date());

  useEffect(() => {
    setDraftStart(fromISO(value.dateFrom));
    setDraftEnd(fromISO(value.dateTo));
    if (value.dateFrom) {
      setViewDate(fromISO(value.dateFrom)!);
    }
    if (value.preset && value.preset !== "all" && value.preset !== "custom") {
      setSelectedPreset(value.preset);
    } else if (!value.dateFrom && !value.dateTo) {
      setSelectedPreset(null);
    }
  }, [value.dateFrom, value.dateTo, value.preset]);

  const start = fromISO(value.dateFrom);
  const end = fromISO(value.dateTo);

  const getButtonLabel = () => {
    const p = selectedPreset || value.preset;
    if (p === "yesterday") return "Hier";
    if (p === "today") return "Aujourd'hui";
    if (p === "this_week") return "Cette semaine";
    if (p === "this_month") return "Ce mois";
    if (p === "this_year") return "Cette année";
    if (start && end) return `Du ${formatDisplayDate(start)} au ${formatDisplayDate(end)}`;
    if (start) return `À partir du ${formatDisplayDate(start)}`;
    return placeholder || "Toutes les dates";
  };

  const label = getButtonLabel();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = buildMonthGrid(year, month);
  const today = startOfDay(new Date());

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: Date) => {
    setSelectedPreset("custom");
    const clicked = startOfDay(day);

    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(clicked);
      setDraftEnd(null);
      return;
    }

    if (clicked < draftStart) {
      setDraftStart(clicked);
      setDraftEnd(draftStart);
    } else {
      setDraftEnd(clicked);
    }
  };

  const handlePresetClick = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const { start: s, end: e } = getPresetRange(presetKey);
    setDraftStart(s);
    setDraftEnd(e);
    if (s) setViewDate(s);
  };

  const isInRange = (day: Date) => {
    if (!draftStart || !draftEnd) return false;
    return day >= draftStart && day <= draftEnd;
  };

  const isRangeEdge = (day: Date) =>
    (draftStart && isSameDay(day, draftStart)) || (draftEnd && isSameDay(day, draftEnd));

  const handleApply = () => {
    onChange({
      dateFrom: draftStart ? toISO(draftStart) : "",
      dateTo: draftEnd ? toISO(draftEnd) : "",
      preset: selectedPreset || "custom",
      label: getButtonLabel(),
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedPreset(null);
    setDraftStart(null);
    setDraftEnd(null);
    onChange({ dateFrom: "", dateTo: "", preset: "all", label: placeholder || "Toutes les dates" });
    onClose();
  };

  const SHORTCUTS = [
    { key: "yesterday", label: "Hier" },
    { key: "today", label: "Aujourd'hui" },
    { key: "this_week", label: "Cette semaine" },
    { key: "this_month", label: "Ce mois" },
    { key: "this_year", label: "Cette année" },
    { key: "custom", label: "Personnalisé" },
  ];

  return (
    <div className={`relative ${className}`}>
      {buttonClassName ? (
        <button
          type="button"
          onClick={onToggle}
          className={`dropdown-toggle ${buttonClassName}`}
        >
          <div className="flex items-center gap-2 truncate pr-4 pointer-events-none">
            <CalenderIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {label}
            </span>
          </div>
          <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500 shrink-0 pointer-events-none" />
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          startIcon={<CalenderIcon className="size-4" />}
          endIcon={<ChevronDownIcon className="size-4" />}
          onClick={onToggle}
          className="dropdown-toggle whitespace-nowrap !justify-between"
        >
          {label}
        </Button>
      )}

      <Dropdown
        isOpen={isOpen}
        onClose={onClose}
        className={`w-[calc(100vw-32px)] max-w-[550px] p-4 sm:w-[530px] !z-50 shadow-2xl rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${
          align === "left" ? "!left-0 !right-auto" : "!right-0 !left-auto"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-3 sm:w-60 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-1.5 w-full">
              <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50/70 dark:bg-gray-800/40 p-1.5 min-w-0">
                <span className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
                  Début
                </span>
                <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                  {draftStart ? formatFrenchDate(draftStart) : "—"}
                </span>
              </div>

              <span className="text-gray-300 dark:text-gray-600 text-xs shrink-0">–</span>

              <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50/70 dark:bg-gray-800/40 p-1.5 min-w-0">
                <span className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
                  Fin
                </span>
                <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                  {draftEnd ? formatFrenchDate(draftEnd) : "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full pt-1">
              {SHORTCUTS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handlePresetClick(preset.key)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold transition-colors cursor-pointer ${
                    selectedPreset === preset.key
                      ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 font-bold"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer font-bold"
                aria-label="Mois précédent"
              >
                ‹
              </button>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer font-bold"
                aria-label="Mois suivant"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAYS.map((wd) => (
                <span key={wd} className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                  {wd}
                </span>
              ))}

              {days.map((day) => {
                const outsideMonth = day.getMonth() !== month;
                const isToday = isSameDay(day, today);
                const inRange = isInRange(day);
                const isEdge = isRangeEdge(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={[
                      "mx-auto flex size-7 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      outsideMonth ? "text-gray-300 dark:text-gray-600" : "text-gray-700 dark:text-gray-200",
                      inRange && !isEdge ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-none" : "",
                      isEdge ? "bg-[#5C24E8] text-white font-bold hover:bg-purple-700 shadow-xs" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isToday && !isEdge ? "border border-purple-400 text-purple-600 dark:text-purple-400 font-bold" : "",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-xl bg-[#5C24E8] hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Appliquer
          </button>
        </div>
      </Dropdown>
    </div>
  );
};

export default PaymentDateRangeFilter;