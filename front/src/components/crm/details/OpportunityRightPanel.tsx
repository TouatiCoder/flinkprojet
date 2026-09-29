import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";
import CurrentActivityCard, { TerminerActivityButton } from "./CurrentActivityCard";
import TerminerActivityGrid from "./TerminerActivityGrid";
import ActivityHistoryList from "./ActivityHistoryList";
import PlanifierProchaineActivite from "./PlanifierProchaineActivite";
import PerduChoiceModal from "./tabs/activity/PerduChoiceModal";
import {
  useGetCurrentActiviteQuery,
  useStoreActiviteMutation,
  usePlanifierProchaineActiviteMutation,
  useMarquerCommePerduMutation,
} from "../../../services/activiteHistoriqueApi";
import { useUpdateProspectEtapeMutation } from "../../../services/ProspectApi";
import { useAuthUser } from "../../../hooks/useAuthUser";
import ChangerEtapeProspect from "../../dashboard/CRM/prospect/ChangerEtapeProspect";

interface OpportunityRightPanelProps {
  userId?: string | number;
  cardId?: string | number;
  etabId?: string | number;
  prospectId?: string | number;
  prospectName: string;
  onClose?: () => void;
}

export default function OpportunityRightPanel({
  userId,
  cardId,
  etabId,
  prospectId,
  onClose,
}: OpportunityRightPanelProps) {
  const location = useLocation();
  const { canUpdate, isSuperAdmin } = useAuthUser();

  const currentSlug = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments[0] || "prospect";
  }, [location.pathname]);

  const canEdit = isSuperAdmin || canUpdate(currentSlug);

  const numericUserId = userId ? Number(userId) : undefined;
  const numericEtabId = etabId ? Number(etabId) : undefined;
  const numericProspectId = prospectId ? Number(prospectId) : undefined;
  const numericCardId = cardId ? Number(cardId) : undefined;

  const { data: currentActiviteRes, isLoading } = useGetCurrentActiviteQuery(
    {
      card_id: numericCardId,
      user_id: numericUserId,
      etab_id: numericEtabId,
      prospect_id: numericProspectId,
    } as any,
    {
      skip: !numericCardId && !numericUserId && !numericEtabId && !numericProspectId,
    }
  );

  const [storeActivite, { isLoading: isStoring }] = useStoreActiviteMutation();
  const [planifierActivite, { isLoading: isPlanning }] = usePlanifierProchaineActiviteMutation();
  const [updateEtape, { isLoading: isUpdatingEtape }] = useUpdateProspectEtapeMutation();
  const [marquerPerdu, { isLoading: isMarkingPerdu }] = useMarquerCommePerduMutation();

  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isPerduModalOpen, setIsPerduModalOpen] = useState(false);
  const [perduModalSubText, setPerduModalSubText] = useState("Aucune réponse du client.");

  const activiteData = currentActiviteRes?.data;
  const isNeedPlanning = !!activiteData?.need_planning;
  const currentEtapeId = (activiteData as any)?.ma_pipline_etape_id ?? null;

  const handleTerminer = async () => {
    if (!canEdit || !selectedNoteId || !activiteData?.activite_actuelle) return;

    const chosenNote = activiteData?.notes?.find((n: any) => n.id === selectedNoteId);
    const noteText = (chosenNote?.note || "").toLowerCase().trim();
    const isPasReponseOrInteresse =
      noteText.includes("réponse") ||
      noteText.includes("reponse") ||
      noteText.includes("intéressé") ||
      noteText.includes("interesse");

    const typeIdToSend = Number(activiteData.activite_actuelle.id || 1);

    try {
      await storeActivite({
        card_id: activiteData.card_id || numericCardId,
        user_id: numericUserId,
        etab_id: numericEtabId,
        prospect_id: numericProspectId,
        ma_pipline_activites_types_id: typeIdToSend,
        ma_pipline_activites_notes_id: selectedNoteId,
      } as any).unwrap();

      setSelectedNoteId(null);

      if (isPasReponseOrInteresse) {
        setPerduModalSubText(
          noteText.includes("intéressé") || noteText.includes("interesse")
            ? "Le prospect a indiqué ne pas être intéressé."
            : "Aucune réponse du client."
        );
        setIsPerduModalOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors de la clôture de l'activité :", error);
    }
  };

  const handleConfirmMarquerPerdu = async () => {
    const targetCardId = activiteData?.card_id || numericCardId;
    try {
      await marquerPerdu({
        card_id: targetCardId ? Number(targetCardId) : undefined,
        user_id: numericUserId,
        etab_id: numericEtabId,
        prospect_id: numericProspectId,
      }).unwrap();

      setIsPerduModalOpen(false);
      onClose?.();
    } catch (err) {
      console.error("Erreur marquer comme perdu:", err);
    }
  };

  const handlePlanifierSubmit = async (formData: {
    typeId: number;
    date: string;
    heure: string;
    note: string;
  }) => {
    if (!canEdit) return;
    const targetCardId = activiteData?.card_id || numericCardId;
    if (!targetCardId) return;

    try {
      await planifierActivite({
        card_id: Number(targetCardId),
        user_id: numericUserId,
        etab_id: numericEtabId,
        prospect_id: numericProspectId,
        ma_pipline_activites_types_id: formData.typeId,
        date: formData.date,
        heure: formData.heure,
        note: formData.note,
      } as any).unwrap();
    } catch (error) {
      console.error("Erreur lors de la planification :", error);
    }
  };

  const handleUpdateEtape = async (newEtapeId: number) => {
    if (!canEdit) return;
    try {
      await updateEtape({
        cardId: numericCardId || (activiteData?.card_id ? Number(activiteData.card_id) : undefined),
        prospectId: numericProspectId,
        userId: numericUserId,
        etabId: numericEtabId,
        ma_pipline_etape_id: newEtapeId,
      }).unwrap();
    } catch (error) {
      console.error("Erreur lors du changement d'étape :", error);
    }
  };

  const currentActivityObj = activiteData?.activite_actuelle
    ? {
        id: activiteData.activite_actuelle.id,
        icone: activiteData.activite_actuelle.icone,
        title: activiteData.activite_actuelle.name,
        scheduledAt: activiteData.date_echeance,
        heure: activiteData.heure,
        description: activiteData.note_planification,
        status: activiteData.is_retard ? "en_retard" : "en_cours",
        retard: activiteData.retard_text,
      }
    : null;

  const hasEntityId = Boolean(numericProspectId || numericUserId || numericEtabId || numericCardId);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-950 border-l border-slate-200 dark:border-gray-800 relative">
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
              Gérer l'opportunité
            </h2>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-600 border-t-transparent" />
          </div>
        ) : isNeedPlanning && activiteData ? (
          canEdit && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <PlanifierProchaineActivite
                cardId={Number(activiteData.card_id || numericCardId)}
                activityTypes={activiteData.all_activity_types}
                initialServerTime={activiteData?.server_time}
                initialServerHour={activiteData?.server_hour}
                initialServerDate={activiteData?.server_date}
                isLoading={isPlanning}
                onSubmit={handlePlanifierSubmit}
              />

              {hasEntityId && (
                <ChangerEtapeProspect
                  prospectId={numericProspectId}
                  userId={numericUserId}
                  etabId={numericEtabId}
                  cardId={numericCardId}
                  currentEtapeId={currentEtapeId}
                  isLoading={isUpdatingEtape}
                  onSubmit={(newEtapeId) => handleUpdateEtape(newEtapeId)}
                />
              )}
            </div>
          )
        ) : (
          <>
            {currentActivityObj && (
              <div>
                <p className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Activité en cours
                </p>
                <CurrentActivityCard activity={currentActivityObj} />
              </div>
            )}

            {canEdit && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
                  <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1">
                    Résultat de l'activité
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
                </div>

                <TerminerActivityGrid
                  notes={activiteData?.notes || []}
                  selectedId={selectedNoteId}
                  onAction={(noteId) => setSelectedNoteId(noteId)}
                />

                <TerminerActivityButton
                  canTerminer={canEdit && !!selectedNoteId}
                  isLoading={isStoring}
                  onTerminer={handleTerminer}
                />
              </>
            )}

            {canEdit && hasEntityId && (
              <ChangerEtapeProspect
                prospectId={numericProspectId}
                userId={numericUserId}
                etabId={numericEtabId}
                cardId={numericCardId}
                currentEtapeId={currentEtapeId}
                isLoading={isUpdatingEtape}
                onSubmit={(newEtapeId) => handleUpdateEtape(newEtapeId)}
              />
            )}
          </>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
          <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1">
            Historique des activités terminées
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
        </div>

        <ActivityHistoryList
          userId={numericUserId}
          etabId={numericEtabId}
          prospectId={numericProspectId}
        />
      </div>

      <div className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition-colors">
          <span>Plus d'actions</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <PerduChoiceModal
        isOpen={isPerduModalOpen}
        isLoading={isMarkingPerdu}
        subText={perduModalSubText}
        onClose={() => setIsPerduModalOpen(false)}
        onPlanifier={() => setIsPerduModalOpen(false)}
        onMarquerPerdu={handleConfirmMarquerPerdu}
      />
    </div>
  );
}