import { useState } from "react";
import { Info, Check, Phone, AlertCircle, Clock, XCircle, Award } from "lucide-react";
import { ActiviteNote } from "../../../services/activiteHistoriqueApi";

interface TerminerActivityGridProps {
  notes?: ActiviteNote[];
  selectedId?: number | null;
  onAction?: (noteId: number) => void;
}

const NOTE_STYLES = [
  {
    icon: <Phone className="w-4 h-4" />,
    colorClass: "text-emerald-700 dark:text-emerald-300",
    hoverClass: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100/60",
    selectedClass: "bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm",
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    colorClass: "text-sky-700 dark:text-sky-300",
    hoverClass: "bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-900/40 hover:bg-sky-100/60",
    selectedClass: "bg-sky-100/80 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/20 shadow-sm",
  },
  {
    icon: <Clock className="w-4 h-4" />,
    colorClass: "text-orange-700 dark:text-orange-300",
    hoverClass: "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/40 hover:bg-orange-100/60",
    selectedClass: "bg-orange-100/80 dark:bg-orange-950/60 border-orange-500 ring-2 ring-orange-500/20 shadow-sm",
  },
  {
    icon: <AlertCircle className="w-4 h-4" />,
    colorClass: "text-slate-600 dark:text-slate-400",
    hoverClass: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-gray-700 hover:bg-slate-100/80",
    selectedClass: "bg-slate-200/80 dark:bg-slate-800 border-slate-500 ring-2 ring-slate-500/20 shadow-sm",
  },
  {
    icon: <Award className="w-4 h-4" />,
    colorClass: "text-purple-700 dark:text-purple-300",
    hoverClass: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-900/40 hover:bg-purple-100/60",
    selectedClass: "bg-purple-100/80 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/20 shadow-sm",
  },
];

export default function TerminerActivityGrid({
  notes = [],
  selectedId: controlledSelectedId,
  onAction,
}: TerminerActivityGridProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(null);

  const activeSelectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  const handleSelect = (id: number) => {
    const nextId = activeSelectedId === id ? null : id;
    setInternalSelectedId(nextId);
    if (nextId !== null) {
      onAction?.(nextId);
    }
  };

  return (
    <div>
      <p className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
        Résultat de l'activité
      </p>

      <div className="grid grid-cols-2 gap-2">
        {notes.map((noteItem, idx) => {
          const isSelected = activeSelectedId === noteItem.id;
          const style = NOTE_STYLES[idx % NOTE_STYLES.length];

          return (
            <button
              key={noteItem.id}
              type="button"
              onClick={() => handleSelect(noteItem.id)}
              className={`relative flex items-center gap-2 p-2.5 rounded-xl border transition-all active:scale-[0.98] cursor-pointer text-left ${isSelected ? style.selectedClass : style.hoverClass
                }`}
            >
              <span className={`shrink-0 ${style.colorClass}`}>{style.icon}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-[11.5px] font-bold leading-tight truncate ${style.colorClass}`}>
                  {noteItem.note}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight truncate">
                  {noteItem.subname || "Option résultat"}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Une nouvelle activité ne pourra être planifiée qu'après avoir terminé l'activité actuelle.
        </p>
      </div>
    </div>
  );
}