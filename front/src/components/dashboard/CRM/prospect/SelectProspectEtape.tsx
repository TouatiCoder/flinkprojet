import { useGetPipelineEtapesQuery, PipelineEtapeItem } from "../../../../services/ProspectApi";
import { CheckCircle2, Loader2, Layers } from "lucide-react";

interface SelectProspectEtapeProps {
  selectedEtapeId?: number | null;
  onSelectEtape: (etapeId: number) => void;
  disabled?: boolean;
}

export default function SelectProspectEtape({
  selectedEtapeId,
  onSelectEtape,
  disabled = false,
}: SelectProspectEtapeProps) {
  const { data: etapesResponse, isLoading, isError } = useGetPipelineEtapesQuery();
  const etapesList: PipelineEtapeItem[] = etapesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="w-full py-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Chargement des étapes...</span>
      </div>
    );
  }

  if (isError || etapesList.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Étape du pipeline (Optionnelle)</span>
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Changer l'étape</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {etapesList.map((etape) => {
          const isSelected = Number(selectedEtapeId) === Number(etape.id);

          return (
            <button
              key={etape.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectEtape(etape.id)}
              className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-50 ${
                isSelected
                  ? "border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-bold shadow-xs"
                  : "border-slate-200/90 dark:border-gray-800 bg-white dark:bg-[#0c1527] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-gray-700 font-medium"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    etape.color ? etape.color : "bg-slate-400"
                  }`}
                />
                <span className="text-xs truncate">{etape.name}</span>
              </div>

              {isSelected && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}