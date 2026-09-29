import { useState, useEffect, useMemo } from "react";
import { useGetPipelineEtapesQuery } from "../../../../services/ProspectApi";
import { Layers, CheckCircle2, Loader2, ArrowRight, Lock } from "lucide-react";

interface ChangerEtapeProspectProps {
  prospectId?: number | string;
  userId?: number | string;
  etabId?: number | string;
  cardId?: number | string;
  currentEtapeId?: number | null;
  isLoading?: boolean;
  onSubmit: (etapeId: number) => void;
}

export default function ChangerEtapeProspect({
  prospectId,
  userId,
  etabId,
  cardId,
  currentEtapeId: propEtapeId,
  isLoading = false,
  onSubmit,
}: ChangerEtapeProspectProps) {
  const queryArg = useMemo(() => ({
    prospect_id: prospectId ? Number(prospectId) : undefined,
    user_id: userId ? Number(userId) : undefined,
    etab_id: etabId ? Number(etabId) : undefined,
    card_id: cardId ? Number(cardId) : undefined,
  }), [prospectId, userId, etabId, cardId]);

  const { data: etapesResponse, isLoading: isLoadingEtapes } = useGetPipelineEtapesQuery(queryArg);
  const etapesList = etapesResponse?.data || [];
  const hasPendingPayment = Boolean((etapesResponse as any)?.has_pending_payment);

  const actualCurrentId = etapesResponse?.current_etape_id ?? (propEtapeId ? Number(propEtapeId) : undefined);

  const filteredEtapes = useMemo(() => {
    return etapesList.filter((etape) => {
      const name = (etape.name || "").toLowerCase().trim();
      const id = Number(etape.id);

      if (id === 5 || id === 6 || name.includes("gagné") || name.includes("gagne") || name.includes("perdu")) {
        return false;
      }

      const isAttentePaiement = id === 4 || name.includes("attente") || name.includes("paiement");
      if (isAttentePaiement && !hasPendingPayment) {
        return false;
      }

      return true;
    });
  }, [etapesList, hasPendingPayment]);

  const attentePaiementEtape = useMemo(() => {
    return etapesList.find((e) => {
      const n = (e.name || "").toLowerCase();
      return Number(e.id) === 4 || n.includes("attente") || n.includes("paiement");
    });
  }, [etapesList]);

  const [selectedEtapeId, setSelectedEtapeId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (hasPendingPayment && attentePaiementEtape) {
      setSelectedEtapeId(Number(attentePaiementEtape.id));
    } else if (actualCurrentId) {
      setSelectedEtapeId(actualCurrentId);
    }
  }, [actualCurrentId, hasPendingPayment, attentePaiementEtape]);

  const currentEtapeObj = etapesList.find((e) => Number(e.id) === Number(actualCurrentId));
  const selectedEtapeObj = etapesList.find((e) => Number(e.id) === Number(selectedEtapeId));
  const hasChanged = selectedEtapeId !== undefined && selectedEtapeId !== actualCurrentId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEtapeId || selectedEtapeId === actualCurrentId) return;
    onSubmit(selectedEtapeId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 border-t border-slate-200/80 dark:border-gray-800 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Étape du pipeline
            </h4>
            <p className="text-[10.5px] text-slate-400 font-medium">
              Actuelle : <span className="font-bold text-slate-700 dark:text-slate-300">{currentEtapeObj?.name || "Non définie"}</span>
            </p>
          </div>
        </div>

        {hasChanged && selectedEtapeObj && (
          <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border animate-in fade-in text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-900/40">
            <span>{currentEtapeObj?.name}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{selectedEtapeObj?.name}</span>
          </div>
        )}
      </div>

      {isLoadingEtapes ? (
        <div className="flex items-center justify-center py-5 text-xs text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Chargement des étapes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
          {filteredEtapes.map((etape) => {
            const etapeIdNum = Number(etape.id);
            const isSelected = etapeIdNum === Number(selectedEtapeId);

            const isPreviousStep = etapeIdNum < (attentePaiementEtape ? Number(attentePaiementEtape.id) : 4);
            const isDisabled = hasPendingPayment && isPreviousStep;

            return (
              <button
                key={etape.id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && setSelectedEtapeId(etapeIdNum)}
                className={`relative flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 text-slate-400"
                    : isSelected
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs cursor-pointer"
                    : "border-slate-200/90 dark:border-gray-800 bg-white dark:bg-[#0c1527] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-gray-700 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${etape.color || "bg-slate-400"}`} />
                    <span className={`text-xs truncate ${isSelected ? "font-bold" : "font-medium"}`}>
                      {etape.name}
                    </span>
                  </div>

                  {isDisabled ? (
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : (
                    isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Score: {etape.score ?? 0} pts</span>
                  {isDisabled && <span className="text-[9px] text-amber-500 font-semibold">Verrouillé</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isLoading || !hasChanged}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Mettre à jour l'étape</span>
        </button>
      </div>
    </form>
  );
}