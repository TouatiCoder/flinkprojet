import type React from "react";
import { useState } from "react";
import Button from "../../ui/button/Button";

interface DateRangeCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date | null, end: Date | null) => void;
  onApply: () => void;
  onClear: () => void;
}

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// "19 août 2026"
const formatFrenchDate = (d: Date | null): string => {
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
};

// Grille du mois : lundi = première colonne (norme FR)
const buildMonthGrid = (year: number, month: number): Date[] => {
  const firstOfMonth = new Date(year, month, 1);
  const jsWeekday = firstOfMonth.getDay(); // 0 = dimanche
  const leadingOffset = jsWeekday === 0 ? 6 : jsWeekday - 1;

  const gridStart = new Date(year, month, 1 - leadingOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
};

const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  startDate,
  endDate,
  onSelect,
  onApply,
  onClear,
}) => {
  const [viewDate, setViewDate] = useState(() => startDate ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = buildMonthGrid(year, month);
  const today = startOfDay(new Date());

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: Date) => {
    const clicked = startOfDay(day);

    // Aucune sélection en cours, ou range déjà complet -> on recommence
    if (!startDate || (startDate && endDate)) {
      onSelect(clicked, null);
      return;
    }

    // Un start existe déjà sans end -> on complète le range
    if (clicked < startDate) {
      onSelect(clicked, startDate);
    } else {
      onSelect(startDate, clicked);
    }
  };

  const isInRange = (day: Date) => {
    if (!startDate || !endDate) return false;
    return day >= startDate && day <= endDate;
  };

  const isRangeEdge = (day: Date) =>
    (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate));

  return (
    <div className="w-72">
      {/* Header : Date de début / Date de fin */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
          <span className="block text-xs text-gray-400 dark:text-gray-500">
            Date de début
          </span>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {startDate ? formatFrenchDate(startDate) : "—"}
          </span>
        </div>

        <span className="mt-4 text-gray-300 dark:text-gray-600">–</span>

        <div className="flex-1 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
          <span className="block text-xs text-gray-400 dark:text-gray-500">
            Date de fin
          </span>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {endDate ? formatFrenchDate(endDate) : "—"}
          </span>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="text-xs font-medium text-gray-400 dark:text-gray-500">
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
                "mx-auto flex size-8 items-center justify-center rounded-full text-sm transition-colors",
                outsideMonth ? "text-gray-300 dark:text-gray-600" : "text-gray-700 dark:text-gray-200",
                inRange && !isEdge ? "bg-brand-50 dark:bg-brand-500/10" : "",
                isEdge ? "bg-brand-500 text-white hover:bg-brand-600" : "hover:bg-gray-100 dark:hover:bg-white/[0.05]",
                isToday && !isEdge ? "ring-1 ring-inset ring-brand-300" : "",
              ].join(" ")}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Effacer
        </button>
        <Button variant="primary" size="sm" onClick={onApply}>
          Appliquer
        </Button>
      </div>
    </div>
  );
};

export default DateRangeCalendar;