import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  UserPlus,
  Building2,
  Megaphone,
  RotateCw,
  Check,
  Info,
  Lock,
} from "lucide-react";
import {
  useGetObjectifsQuery,
  useToggleObjectifMutation,
} from "../../../../services/opportuniteApi";
import { useAuthUser } from "../../../../hooks/useAuthUser";

const SHOW_FOR_ETABLISSEMENT = true;
const SHOW_FOR_USER = true;

export type ObjectifType = "user" | "pro" | "ads" | "renouvellement";

export interface ObjectifCardItem {
  id: ObjectifType;
  stepNumber: number;
  title: string;
  description: string;
  iconType: ObjectifType;
  montant?: number | string | null;
  isSelected: boolean;
  disabled?: boolean;
  isMontantEditable?: boolean;
  isLockedByPayment?: boolean;
}

const BASE_OBJECTIFS: ObjectifCardItem[] = [
  {
    id: "user",
    stepNumber: 1,
    title: "devenir user",
    description: "Convertir le prospect en user flink.",
    iconType: "user",
    montant: null,
    isSelected: false,
    isMontantEditable: false,
  },
  {
    id: "pro",
    stepNumber: 2,
    title: "compte pro",
    description: "Activer ou vendre un compte pro.",
    iconType: "pro",
    montant: null,
    isSelected: false,
    isMontantEditable: false,
  },
  {
    id: "ads",
    stepNumber: 3,
    title: "solde ads",
    description: "Achat de solde ads pour flink ads.",
    iconType: "ads",
    montant: 2000,
    isSelected: false,
    isMontantEditable: true,
  },
  {
    id: "renouvellement",
    stepNumber: 4,
    title: "renouvellement pro",
    description: "Renouveler le compte pro à l'échéance.",
    iconType: "renouvellement",
    montant: null,
    isSelected: false,
    disabled: false,
    isMontantEditable: false,
  },
];

interface OpportuniteSectionProps {
  type?: "user" | "prospect" | "etablissement";
  entityId?: number;
}

export default function OpportuniteSection({
  type = "prospect",
  entityId,
}: OpportuniteSectionProps) {
  const location = useLocation();
  const { canUpdate, isSuperAdmin } = useAuthUser();

  const currentSlug = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments[0] || "prospect";
  }, [location.pathname]);

  const canEdit = isSuperAdmin || canUpdate(currentSlug);

  const normalizedType = (String(type).toLowerCase().trim() as
    | "user"
    | "prospect"
    | "etablissement") || "prospect";

  if (
    (normalizedType === "etablissement" || (normalizedType as string) === "etab") &&
    !SHOW_FOR_ETABLISSEMENT
  ) {
    return null;
  }

  if (
    (normalizedType === "user" || (normalizedType as string) === "utilisateur") &&
    !SHOW_FOR_USER
  ) {
    return null;
  }

  const validEntityId = Number(entityId) || 0;

  const { data: opDataRes, isLoading } = useGetObjectifsQuery(
    { type_user: normalizedType, entity_id: validEntityId },
    { skip: validEntityId <= 0 }
  );

  const [toggleObjectifApi, { isLoading: isUpdating }] = useToggleObjectifMutation();
  const [cardsState, setCardsState] = useState<ObjectifCardItem[]>(BASE_OBJECTIFS);

  const rawEtapeId = opDataRes?.data?.etape_id;
  const etapeId = rawEtapeId !== undefined && rawEtapeId !== null ? Number(rawEtapeId) : null;
  const etapeName = (opDataRes?.data?.etape_name || opDataRes?.data?.status || "").toLowerCase().trim();

  const isGagne = etapeId === 5 || etapeName.includes("gagn");
  const isPerdu = etapeId === 6 || etapeName.includes("perd");
  const isClosed = isGagne || isPerdu;

  const statutOpportunite = (opDataRes?.data?.statut_opportunite || "ouverte").toLowerCase();
  const isOuverte = statutOpportunite === "ouverte" || (opDataRes?.data?.status || "").toLowerCase().includes("ouvert");
  const closedSoldes = opDataRes?.data?.soldes || [];

  useEffect(() => {
    const backendSoldes = opDataRes?.data?.soldes || [];
    const defaultProMontant = opDataRes?.data?.default_pro_montant ?? 5000;
    
    const isPendingAds = Boolean((opDataRes?.data as any)?.pending_ads);
    const isPendingPro = Boolean((opDataRes?.data as any)?.pending_pro);

    setCardsState(
      BASE_OBJECTIFS.map((baseCard) => {
        const matchingSolde = backendSoldes.find((s) => s.type === baseCard.id);
        let isSelected = !!matchingSolde;
        let isLocked = false;

        if (normalizedType === "prospect" && baseCard.id === "user") {
          isSelected = true;
        }

        if (baseCard.id === "ads" && isPendingAds) {
          isSelected = true;
          isLocked = true;
        }

        if (baseCard.id === "pro" && isPendingPro) {
          isSelected = true;
          isLocked = true;
        }

        let finalMontant = baseCard.montant;
        if (baseCard.id === "pro") {
          finalMontant = matchingSolde?.montant ?? defaultProMontant;
        } else if (matchingSolde && matchingSolde.montant !== undefined && matchingSolde.montant !== null) {
          finalMontant = matchingSolde.montant;
        }

        return {
          ...baseCard,
          isSelected,
          disabled: isLocked,
          isLockedByPayment: isLocked,
          isMontantEditable: baseCard.isMontantEditable && !isLocked,
          montant: finalMontant,
        };
      })
    );
  }, [opDataRes]);

  if (isClosed) {
    return null;
  }

  const cardId = opDataRes?.data?.card_id ?? null;
  const opportuniteId = opDataRes?.data?.opportunite_id ?? `OP-${validEntityId}`;

  const executeApiUpdate = async (
    targetType: ObjectifType,
    isSelected: boolean,
    montantVal?: number | null
  ) => {
    if (validEntityId <= 0 || !canEdit) return;
    try {
      await toggleObjectifApi({
        card_id: cardId,
        type_user: normalizedType,
        entity_id: validEntityId,
        objectif_type: targetType,
        is_selected: isSelected,
        montant: montantVal !== undefined ? montantVal : null,
      }).unwrap();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'objectif:", err);
    }
  };

  const handleToggle = (item: ObjectifCardItem) => {

    if (normalizedType === "prospect" && item.id === "user" && item.isSelected) {
      return;
    }

    if (!canEdit || item.disabled || item.isLockedByPayment || isUpdating) return;
    const nextSelected = !item.isSelected;

    setCardsState((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, isSelected: nextSelected } : c))
    );

    const montantToSend =
      item.montant !== null && item.montant !== undefined
        ? Number(item.montant)
        : null;

    executeApiUpdate(item.iconType, nextSelected, montantToSend);
  };

  const handleMontantChange = (id: ObjectifType, newMontant: string) => {
    if (!canEdit) return;
    const targetCard = cardsState.find((c) => c.id === id);
    if (targetCard?.isLockedByPayment) return;

    const val = newMontant === "" ? null : Number(newMontant);

    setCardsState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, montant: val } : c))
    );

    if (targetCard && targetCard.isSelected) {
      executeApiUpdate(targetCard.iconType, true, val);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Chargement de l'opportunité...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-gray-800/80">
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5C24E8] dark:text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Opportunité #X{opportuniteId}
              </h3>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                isOuverte
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
              }`}
            >
              {isOuverte ? "Ouverte" : "Fermée"}
            </span>
          </div>

          {!isOuverte && closedSoldes.length > 0 && (
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Derniers objectifs :</span>
              {closedSoldes.slice(0, 3).map((solde: any, idx: number) => {
                const isPerduSolde = (solde.status || "").toLowerCase().includes("perd");
                const isGagneSolde = (solde.status || "").toLowerCase().includes("gagn");

                return (
                  <div
                    key={solde.id || idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700 font-semibold"
                  >
                    <span className="text-slate-700 dark:text-slate-200">
                      {solde.label || solde.type}
                    </span>
                    {solde.montant && (
                      <span className="text-slate-500 dark:text-slate-400 font-bold">
                        ({Number(solde.montant).toLocaleString("fr-FR")} Dh)
                      </span>
                    )}
                    <span
                      className={`text-[10.5px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                        isGagneSolde
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : isPerduSolde
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {solde.status || "Fermé"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
          Objectifs de cette opportunité
        </h4>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cardsState.map((item) => {
          const isSelected = item.isSelected;
          const isLocked = item.isLockedByPayment;

          let iconBg = "bg-purple-50 dark:bg-purple-950/40 text-[#5C24E8]";
          let cardBorder = isSelected
            ? "border-[#5C24E8] ring-2 ring-[#5C24E8]/10"
            : "border-slate-200 dark:border-gray-800";

          if (item.iconType === "pro") {
            iconBg = "bg-blue-50 dark:bg-blue-950/40 text-blue-600";
            cardBorder = isSelected
              ? "border-blue-500 ring-2 ring-blue-500/10"
              : "border-slate-200 dark:border-gray-800";
          } else if (item.iconType === "ads") {
            iconBg = "bg-rose-50 dark:bg-rose-950/40 text-rose-500";
            cardBorder = isSelected
              ? "border-rose-400 ring-2 ring-rose-400/10"
              : "border-slate-200 dark:border-gray-800";
          } else if (item.iconType === "renouvellement") {
            iconBg = "bg-slate-100 dark:bg-gray-800 text-slate-500";
            cardBorder = isSelected
              ? "border-purple-500 ring-2 ring-purple-500/10"
              : "border-slate-200 dark:border-gray-800";
          }

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 border bg-white dark:bg-gray-900/50 flex flex-col justify-between items-center text-center gap-3 transition-all relative ${cardBorder} ${
                isLocked
                  ? "bg-slate-50/70 dark:bg-gray-800/30"
                  : canEdit
                  ? "hover:shadow-xs"
                  : "cursor-not-allowed opacity-90"
              }`}
            >
              {isLocked && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-1.5 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5" />
                  <span>En attente</span>
                </div>
              )}

              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                {item.iconType === "user" && <UserPlus className="w-5 h-5 stroke-[2.2]" />}
                {item.iconType === "pro" && <Building2 className="w-5 h-5 stroke-[2.2]" />}
                {item.iconType === "ads" && <Megaphone className="w-5 h-5 stroke-[2.2]" />}
                {item.iconType === "renouvellement" && <RotateCw className="w-5 h-5 stroke-[2.2]" />}
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {item.stepNumber}. {item.title}
                </h5>
              </div>

              <div className="w-full min-h-[38px] flex items-center justify-center">
                {item.montant !== null && item.montant !== undefined ? (
                  <div className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/40 flex items-center justify-between text-xs font-bold">
                    {item.isMontantEditable && canEdit && !isLocked ? (
                      <input
                        type="number"
                        value={item.montant}
                        onChange={(e) => handleMontantChange(item.id, e.target.value)}
                        className="w-20 bg-transparent font-bold text-slate-900 dark:text-white outline-none"
                      />
                    ) : (
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Number(item.montant).toLocaleString("fr-FR")}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400">
                      Dh
                    </span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>

              <button
                type="button"
                disabled={!canEdit || item.disabled || isLocked || isUpdating}
                onClick={() => handleToggle(item)}
                title={
                  isLocked
                    ? "Cet objectif est lié à un paiement en attente de validation (paid = 2)"
                    : !canEdit
                    ? "Vous n'avez pas la permission de modifier cet objectif"
                    : ""
                }
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  isLocked
                    ? "cursor-not-allowed bg-emerald-600 text-white shadow-2xs opacity-90 ring-2 ring-emerald-500/20"
                    : !canEdit
                    ? "cursor-not-allowed opacity-60"
                    : isUpdating
                    ? "opacity-50 cursor-wait"
                    : "cursor-pointer"
                } ${
                  isSelected && !isLocked
                    ? "bg-[#5C24E8] text-white shadow-2xs"
                    : !isLocked
                    ? "border-2 border-slate-200 dark:border-gray-700 bg-transparent hover:border-purple-400"
                    : ""
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5" />
        </div>
        <span>
          Les objectifs sélectionnés sont automatiquement synchronisés avec l'opportunité (ID : {opportuniteId}). Les objectifs ayant un paiement en attente (paid = 2) sont verrouillés automatiquement.
        </span>
      </div>
    </div>
  );
}