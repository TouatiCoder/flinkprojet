import { X, Phone, Calendar, XCircle, Loader2 } from "lucide-react";

interface PerduChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanifier: () => void;
  onMarquerPerdu: () => void;
  subText?: string;
  isLoading?: boolean;
}

export default function PerduChoiceModal({
  isOpen,
  onClose,
  onPlanifier,
  onMarquerPerdu,
  subText = "Aucune réponse du client.",
  isLoading = false,
}: PerduChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[340px] bg-white dark:bg-[#0c1527] rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800 p-6 flex flex-col items-center text-center z-10 animate-in zoom-in-95 duration-200">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
          <Phone className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Que souhaitez-vous faire ?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 font-medium">
          {subText}
        </p>

        <div className="w-full space-y-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onPlanifier}
            className="w-full py-3 px-4 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Planifier une nouvelle activité</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onMarquerPerdu}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-100 dark:border-rose-900/40"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <div className="w-5 h-5 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              </div>
            )}
            <span>Marquer comme Perdu</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full pt-2 pb-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}