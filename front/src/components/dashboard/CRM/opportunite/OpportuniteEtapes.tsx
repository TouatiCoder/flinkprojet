import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  User,
  Building2,
  Megaphone,
  Trophy,
  Calendar,
  X,
  Tag,
  Lock,
  Globe,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { ApiOpportunityCard, ApiOpportunityStage } from "../../../../services/opportuniteApi";
import { getActivityIconMeta } from "../../../crm/details/tabs/activity/ActivityIconResolver";
import { formatNumberWithSpaces } from "../../../../utils/formatters";

interface CardWithExtras extends ApiOpportunityCard {
  score?: number;
  manager_avatar?: string | null;
  heure?: string | null;
  source_name?: string | null;
  en_retard?: boolean;
  sans_objectif?: boolean;
  need_planning?: boolean;
}

interface OpportuniteEtapesProps {
  stages: ApiOpportunityStage[];
  cards: CardWithExtras[];
  onCardMove: (cardId: string, targetStageId: string) => void;
  onAddOpportunityToStage?: (stageId: string) => void;
  onCardClick?: (card: ApiOpportunityCard) => void;
}

function CommercialAvatar({ avatar, name }: { avatar?: string | null; name?: string | null }) {
  const [imgError, setImgError] = useState(false);

  const resolveUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    const envBase = (import.meta as any).env?.VITE_BACKEND_URL 
      || (import.meta as any).env?.VITE_API_URL?.replace(/\/api\/?$/, "") || "";
    return envBase ? `${envBase.replace(/\/+$/, "")}/${clean}` : `/${clean}`;
  };

  const finalSrc = resolveUrl(avatar);
  const initials = name && name !== "Non assigné" ? name.trim().slice(0, 2).toUpperCase() : null;

  return (
    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-[10px]">
      {finalSrc && !imgError ? (
        <img src={finalSrc} alt={name || "Commercial"} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      ) : (
        initials || <User className="w-3 h-3 text-slate-400" />
      )}
    </div>
  );
}

const isWaitingStage = (stageId?: string | number | null, stageName?: string) => {
  if (stageId === null || stageId === undefined) return false;
  const id = Number(stageId);
  const n = (stageName || "").toLowerCase().trim();
  return id === 4 || n.includes("attente");
};

function getScoreConfig(scoreVal: number) {
  if (scoreVal >= 100) {
    return {
      niveau: "Gagné",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      badgeBorder: "border-emerald-200/60 dark:border-emerald-800/40",
      icon: <CheckCircle2 className="w-2.5 h-2.5" />,
    };
  }
  if (scoreVal >= 80) {
    return {
      niveau: "Prioritaire",
      badgeBg: "bg-purple-50 dark:bg-purple-950/40",
      badgeText: "text-purple-700 dark:text-purple-300",
      badgeBorder: "border-purple-200/60 dark:border-purple-800/40",
      icon: null,
    };
  }
  if (scoreVal >= 60) {
    return {
      niveau: "Chaud",
      badgeBg: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
      badgeText: "text-orange-600 dark:text-orange-400",
      badgeBorder: "border-orange-300 dark:border-orange-800/60 shadow-xs shadow-orange-500/10",
      icon: <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500 animate-pulse" />,
    };
  }
  if (scoreVal >= 40) {
    return {
      niveau: "Moyen",
      badgeBg: "bg-amber-50 dark:bg-amber-950/40",
      badgeText: "text-amber-800 dark:text-amber-300",
      badgeBorder: "border-amber-200/60 dark:border-amber-800/40",
      icon: null,
    };
  }
  return {
    niveau: "Faible",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200/60 dark:border-rose-900/40",
    icon: null,
  };
}

const getStageHeaderTheme = (stageColor?: string, stageName?: string, stageId?: string | number) => {
  const c = (stageColor || "").trim().toLowerCase();
  const n = (stageName || "").trim().toLowerCase();
  const id = Number(stageId);

  if (id === 1 || n.includes("nouveau") || c.includes("2563eb") || c.includes("blue")) {
    return {
      headerBg: "bg-[#EFF6FF] dark:bg-blue-950/40 border-b border-blue-200/60 dark:border-blue-900/40",
      titleColor: "text-[#1E40AF] dark:text-blue-200",
      totalColor: "text-[#1E40AF] dark:text-blue-200",
      badgeBg: "bg-[#DBEAFE] dark:bg-blue-900/80 text-[#1E40AF] dark:text-blue-200",
      borderLeft: "border-l-[#2563EB]",
    };
  }
  if (id === 2 || n.includes("rappeler") || n.includes("rappel") || c.includes("f59e0b") || c.includes("orange") || c.includes("amber")) {
    return {
      headerBg: "bg-[#FFFBEB] dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40",
      titleColor: "text-[#B45309] dark:text-amber-200",
      totalColor: "text-[#B45309] dark:text-amber-200",
      badgeBg: "bg-[#FEF3C7] dark:bg-amber-900/80 text-[#B45309] dark:text-amber-200",
      borderLeft: "border-l-[#F59E0B]",
    };
  }
  if (id === 3 || n.includes("qualif") || c.includes("10b981") || c.includes("green") || c.includes("emerald")) {
    return {
      headerBg: "bg-[#ECFDF5] dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-900/40",
      titleColor: "text-[#065F46] dark:text-emerald-200",
      totalColor: "text-[#065F46] dark:text-emerald-200",
      badgeBg: "bg-[#D1FAE5] dark:bg-emerald-900/80 text-[#065F46] dark:text-emerald-200",
      borderLeft: "border-l-[#10B981]",
    };
  }
  if (id === 4 || n.includes("attente") || c.includes("7c3aed") || c.includes("purple") || c.includes("violet")) {
    return {
      headerBg: "bg-[#F5F3FF] dark:bg-purple-950/40 border-b border-purple-200/60 dark:border-purple-900/40",
      titleColor: "text-[#5B21B6] dark:text-purple-200",
      totalColor: "text-[#5B21B6] dark:text-purple-200",
      badgeBg: "bg-[#EDE9FE] dark:bg-purple-900/80 text-[#5B21B6] dark:text-purple-200",
      borderLeft: "border-l-[#7C3AED]",
    };
  }
  return {
    headerBg: "bg-slate-100 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700",
    titleColor: "text-slate-800 dark:text-slate-200",
    totalColor: "text-slate-800 dark:text-slate-200",
    badgeBg: "bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300",
    borderLeft: "border-l-slate-400",
  };
};

const calculateStageTotal = (stageCards: ApiOpportunityCard[]): number => {
  return stageCards.reduce((total, card) => {
    if (card.soldes && Array.isArray(card.soldes) && card.soldes.length > 0) {
      const cardTotal = card.soldes.reduce((sum, s) => sum + (Number(s.montant) || 0), 0);
      return total + cardTotal;
    }
    if (card.solde !== undefined && card.solde !== null) {
      return total + (Number(card.solde) || 0);
    }
    return total;
  }, 0);
};

export default function OpportuniteEtapes({
  stages,
  cards,
  onCardMove,
  onAddOpportunityToStage,
  onCardClick,
}: OpportuniteEtapesProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedFromStageId, setDraggedFromStageId] = useState<string | null>(null);
  const [activeDropStageId, setActiveDropStageId] = useState<string | null>(null);

  const [openInteretsCardId, setOpenInteretsCardId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenInteretsCardId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDragStart = (card: ApiOpportunityCard) => {
    if (isWaitingStage(card.stage_id)) return;
    setDraggedCardId(card.id);
    setDraggedFromStageId(String(card.stage_id));
  };

  const handleDragOver = (e: React.DragEvent, stage: ApiOpportunityStage) => {
    e.preventDefault();
    if (isWaitingStage(stage.id, stage.name)) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    setActiveDropStageId(stage.id);
  };

  const handleDragLeave = () => {
    setActiveDropStageId(null);
  };

  const handleDrop = (targetStage: ApiOpportunityStage) => {
    if (isWaitingStage(targetStage.id, targetStage.name) || isWaitingStage(draggedFromStageId)) {
      setDraggedCardId(null);
      setDraggedFromStageId(null);
      setActiveDropStageId(null);
      return;
    }

    if (draggedCardId) {
      onCardMove(draggedCardId, targetStage.id);
      setDraggedCardId(null);
      setDraggedFromStageId(null);
      setActiveDropStageId(null);
    }
  };

  const renderTypeBadgeIcon = (label: string) => {
    const lower = (label || "").toLowerCase();
    if (lower.includes("ads")) {
      return (
        <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shrink-0">
          <Megaphone className="w-3 h-3" />
        </div>
      );
    }
    if (lower.includes("renouvellement")) {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
          <Trophy className="w-3 h-3" />
        </div>
      );
    }
    if (lower.includes("compte pro") || lower.includes("pro")) {
      return (
        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 shrink-0">
          <Building2 className="w-3 h-3" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
        <User className="w-3 h-3" />
      </div>
    );
  };

  const getBadgeTextColor = (label: string) => {
    const lower = (label || "").toLowerCase();
    if (lower.includes("ads")) return "text-rose-600 dark:text-rose-400";
    if (lower.includes("renouvellement")) return "text-emerald-700 dark:text-emerald-300";
    if (lower.includes("compte pro") || lower.includes("pro")) return "text-blue-700 dark:text-blue-300";
    return "text-purple-700 dark:text-purple-300";
  };

  const renderSoldesSection = (card: ApiOpportunityCard) => {
    if (card.soldes && card.soldes.length > 0) {
      return (
        <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap overflow-hidden">
          {card.soldes.map((item, index) => {
            const isAds = item.type === "ads" || (item.label && item.label.toLowerCase().includes("ads"));
            const isRenouv = item.type === "renouvellement" || (item.label && item.label.toLowerCase().includes("renouvellement"));

            return (
              <React.Fragment key={index}>
                {index > 0 && <span className="h-3 w-[1.5px] bg-slate-300 dark:bg-gray-700 inline-block shrink-0" />}
                <div className="flex items-center gap-1 shrink-0">
                  {isAds ? (
                    <div className="w-4 h-4 rounded bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                      <Megaphone className="w-2.5 h-2.5" />
                    </div>
                  ) : isRenouv ? (
                    <div className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Trophy className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Building2 className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                    {item.montant ? `${item.montant.toLocaleString()} DH` : "—"}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
        <span className="font-bold text-slate-800 dark:text-slate-100 text-[11.5px]">
          {card.solde !== null ? `${card.solde.toLocaleString()} DH` : "—"}
        </span>
      </div>
    );
  };

  const displayStages = stages.filter((stage) => {
    const lower = (stage.name || "").toLowerCase().trim();
    const id = Number(stage.id);
    return id !== 5 && id !== 6 && !lower.includes("gagné") && !lower.includes("gagne") && !lower.includes("perdu");
  });

  return (
    <div className="w-full overflow-x-auto pb-6 pt-2">
      <div className="flex items-start gap-4 min-w-[1100px]">
        {displayStages.map((stage) => {
          const isCurrentStageWaiting = isWaitingStage(stage.id, stage.name);
          const stageCards = cards
            .filter((c) => String(c.stage_id) === String(stage.id))
            .sort((a, b) => (a.position || 0) - (b.position || 0));

          const stageTotalSolde = calculateStageTotal(stageCards);
          const isOver = activeDropStageId === stage.id && !isCurrentStageWaiting;
          const theme = getStageHeaderTheme(stage.color, stage.name, stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage)}
              className={`flex-1 min-w-[245px] max-w-[265px] rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-sm dark:shadow-none transition-all flex flex-col overflow-hidden ${
                isOver ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              <div className={`px-4 pt-3.5 pb-3 rounded-t-2xl ${theme.headerBg} shrink-0`}>
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 className={`text-[15px] font-extrabold tracking-tight truncate ${theme.titleColor}`}>
                      {stage.name}
                    </h3>
                    {isCurrentStageWaiting && (
                      <span title="Étape verrouillée (déplacement automatique)">
                        <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold flex items-center justify-center ${theme.badgeBg}`}>
                      {stage.count ?? stageCards.length}
                    </span>
                    {!isCurrentStageWaiting && (
                      <button
                        type="button"
                        onClick={() => onAddOpportunityToStage?.(stage.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className={`text-[13px] font-extrabold mt-1 tracking-tight ${theme.totalColor}`}>
                  {/* {stageTotalSolde.toLocaleString("fr-FR")} DH */}
                  {formatNumberWithSpaces(stageTotalSolde)} DH
                </div>
              </div>

              <div className="space-y-3 px-3 py-3 bg-white dark:bg-gray-900 min-h-[300px]">
                {stageCards.map((card) => {
                  let allInterets: { id: number | string; name: string }[] = [];
                  if (card.interets && card.interets.length > 0) {
                    allInterets = card.interets;
                  } else if (card.soldes && card.soldes.length > 0) {
                    allInterets = card.soldes.map((s, idx) => ({
                      id: idx + 1,
                      name: s.label || (s.type === "ads" ? "Solde Ads" : s.type === "renouvellement" ? "Renouvellement Pro" : "Compte Pro"),
                    }));
                  } else if (card.interet_name) {
                    allInterets = [{ id: card.interet_id || 1, name: card.interet_name }];
                  }

                  const hasMoreInterets = allInterets.length > 1;
                  const isPopOpen = openInteretsCardId === card.id;
                  const label = allInterets.length > 0
                    ? allInterets[0].name
                    : card.type_user === "compte_pro"
                    ? "Compte Pro"
                    : card.type_user_label || "Opportunité";

                  const canDragCard = !isCurrentStageWaiting;
                  const cardScore = card.score ?? 0;
                  const scoreConfig = getScoreConfig(cardScore);
                  const actMeta = getActivityIconMeta(card.activite_type_id || card.activite_icone || card.activite_name);

                  return (
                    <div
                      key={card.id}
                      draggable={canDragCard}
                      onDragStart={() => canDragCard && handleDragStart(card)}
                      onClick={() => onCardClick?.(card)}
                      className={`relative p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 border-l-4 ${theme.borderLeft} shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700 transition-all duration-200 space-y-2.5 ${
                        canDragCard ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 relative">
                        <div className="flex items-center gap-1.5 truncate">
                          <div className={`flex items-center gap-1 text-[11px] font-semibold truncate ${getBadgeTextColor(label)}`}>
                            {renderTypeBadgeIcon(label)}
                            <span className="truncate">{label}</span>
                          </div>

                          {card.source_name && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-medium bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-gray-700 shrink-0"
                              title={`Source : ${card.source_name}`}
                            >
                              <Globe className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate max-w-[70px]">{card.source_name}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold border flex items-center gap-1 ${scoreConfig.badgeBg} ${scoreConfig.badgeText} ${scoreConfig.badgeBorder}`}
                            title={`Score opportunité : ${cardScore}/100`}
                          >
                            {scoreConfig.icon}
                            <span>{scoreConfig.niveau}</span>
                          </span>

                          {hasMoreInterets && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenInteretsCardId(isPopOpen ? null : card.id);
                              }}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-0.5 transition-colors cursor-pointer shrink-0"
                              title="Voir tous les intérêts"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>{allInterets.length - 1}</span>
                            </button>
                          )}
                        </div>

                        {isPopOpen && (
                          <div
                            ref={popoverRef}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-7 right-0 z-50 w-52 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 space-y-2 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700/60 pb-1.5">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                <Tag className="w-3 h-3 text-[#E60067]" />
                                <span>Tous les intérêts ({allInterets.length})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setOpenInteretsCardId(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                              {allInterets.map((item) => (
                                <span
                                  key={item.id}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-700 text-[10.5px] font-medium text-slate-700 dark:text-slate-200"
                                >
                                  {item.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{card.type_user_label}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <CommercialAvatar avatar={card.manager_avatar} name={card.manager_name} />
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {card.manager_name}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-xs gap-1">
                        <div className="min-w-0 flex-1">
                          {renderSoldesSection(card)}

                          <div className="flex items-center flex-wrap gap-1.5 text-[10.5px] mt-1">
                            {card.sans_objectif ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 uppercase tracking-tight shrink-0"
                                title="L'activité précédente est terminée. Aucune prochaine activité n'est planifiée."
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Sans Objectif
                              </span>
                            ) : (
                              <>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  <span
                                    className={
                                      card.en_retard
                                        ? "text-rose-600 dark:text-rose-400 font-semibold"
                                        : card.is_date_highlight
                                        ? "text-amber-600 dark:text-amber-400 font-semibold"
                                        : ""
                                    }
                                  >
                                    {card.date_text}
                                  </span>
                                  {card.heure && (
                                    <span className="text-slate-400 font-medium">à {card.heure}</span>
                                  )}
                                </div>

                                {card.en_retard && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50 uppercase tracking-tight shrink-0"
                                    title="Le délai prévu pour cette activité est dépassé."
                                  >
                                    En retard
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className={`p-1 rounded-lg shrink-0 ${actMeta.colorClass}`}>
                          {actMeta.icon}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}