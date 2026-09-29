import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  UserPlus,
  Building2,
  Megaphone,
  RotateCw,
  Check,
  CheckCircle2,
  XCircle,
  Archive,
  Sparkles,
} from "lucide-react";
import {
  useGetObjectifsQuery,
  useCreateNewOpportuniteMutation,
} from "../../../../services/opportuniteApi";
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { ObjectifCardItem, ObjectifType } from "./OpportuniteSection";

const NOUVEAUX_OBJECTIFS_INIT: ObjectifCardItem[] = [
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

interface NouvelleOpportuniteSectionProps {
  type?: "user" | "prospect" | "etablissement";
  entityId?: number;
}

export default function NouvelleOpportuniteSection({
  type = "prospect",
  entityId,
}: NouvelleOpportuniteSectionProps) {
  const location = useLocation();
  const { canUpdate, isSuperAdmin } = useAuthUser();

  const currentSlug = location.pathname.split("/").filter(Boolean)[0] || "prospect";
  const canEdit = isSuperAdmin || canUpdate(currentSlug);

  const normalizedType = (String(type).toLowerCase().trim() as
    | "user"
    | "prospect"
    | "etablissement") || "prospect";

  const validEntityId = Number(entityId) || 0;

  const { data: opDataRes, isLoading } = useGetObjectifsQuery(
    { type_user: normalizedType, entity_id: validEntityId },
    { skip: validEntityId <= 0 }
  );

  const [createNewOpportuniteApi, { isLoading: isUpdating }] = useCreateNewOpportuniteMutation();
  const [cardsState, setCardsState] = useState<ObjectifCardItem[]>(NOUVEAUX_OBJECTIFS_INIT);

  useEffect(() => {
    if (opDataRes?.data) {
      const defaultProMontant = opDataRes.data.default_pro_montant ?? 5000;
      setCardsState((prev) =>
        prev.map((c) =>
          c.id === "pro" ? { ...c, montant: defaultProMontant } : c
        )
      );
    }
  }, [opDataRes]);

  const rawEtapeId = opDataRes?.data?.etape_id;
  const etapeId = rawEtapeId !== undefined && rawEtapeId !== null ? Number(rawEtapeId) : null;
  const etapeName = (opDataRes?.data?.etape_name || opDataRes?.data?.status || "").toLowerCase().trim();

  const isGagne = etapeId === 5 || etapeName.includes("gagn");
  const isPerdu = etapeId === 6 || etapeName.includes("perd");
  const isClosed = isGagne || isPerdu;

  if (isLoading || !isClosed) {
    return null;
  }

  const previousOppId = opDataRes?.data?.opportunite_id ?? `OP-${validEntityId}`;
  const previousStatus = opDataRes?.data?.etape_name ?? (isGagne ? "Gagné" : "Perdu");

  const executeCreateOrUpdate = async (
    targetType: ObjectifType,
    isSelected: boolean,
    montantVal?: number | null
  ) => {
    if (validEntityId <= 0 || !canEdit) return;
    try {
      await createNewOpportuniteApi({
        type_user: normalizedType,
        entity_id: validEntityId,
        objectif_type: targetType,
        is_selected: isSelected,
        montant: montantVal !== undefined ? montantVal : null,
      }).unwrap();
    } catch (err) {
      console.error("Erreur lors de la création de la nouvelle opportunité:", err);
    }
  };

  const handleToggle = (item: ObjectifCardItem) => {
    if (!canEdit || item.disabled || isUpdating) return;
    const nextSelected = !item.isSelected;

    setCardsState((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, isSelected: nextSelected } : c))
    );

    const montantToSend =
      item.montant !== null && item.montant !== undefined
        ? Number(item.montant)
        : null;

    executeCreateOrUpdate(item.iconType, nextSelected, montantToSend);
  };

  const handleMontantChange = (id: ObjectifType, newMontant: string) => {
    if (!canEdit) return;
    const val = newMontant === "" ? null : Number(newMontant);

    setCardsState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, montant: val } : c))
    );

    const targetCard = cardsState.find((c) => c.id === id);
    if (targetCard && targetCard.isSelected) {
      executeCreateOrUpdate(targetCard.iconType, true, val);
    }
  };

  return (
    <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xs space-y-5">
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          isGagne
            ? "bg-emerald-50/60 border-emerald-200/70 dark:bg-emerald-950/20 dark:border-emerald-900/40"
            : "bg-rose-50/60 border-rose-200/70 dark:bg-rose-950/20 dark:border-rose-900/40"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isGagne ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Dernière opportunité #{previousOppId} clôturée en tant que{" "}
            <strong className={isGagne ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
              {previousStatus}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <Archive className="w-3.5 h-3.5" />
          <span>Archivée</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#5C24E8]" />
          <span>Nouvelle opportunité</span>
        </h4>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          Sélectionnez les objectifs pour le prochain cycle de ce prospect (statut: En cours).
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cardsState.map((item) => {
          const isSelected = item.isSelected;

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
              className={`rounded-2xl p-4 border bg-white dark:bg-gray-900/50 flex flex-col justify-between items-center text-center gap-3 transition-all ${cardBorder} ${
                canEdit ? "hover:shadow-xs" : "cursor-not-allowed opacity-90"
              }`}
            >
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
                    {item.isMontantEditable && canEdit ? (
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
                disabled={!canEdit || item.disabled || isUpdating}
                onClick={() => handleToggle(item)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isUpdating ? "opacity-50 cursor-wait" : ""
                } ${
                  isSelected
                    ? "bg-[#5C24E8] text-white shadow-2xs"
                    : "border-2 border-slate-200 dark:border-gray-700 bg-transparent hover:border-purple-400"
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}