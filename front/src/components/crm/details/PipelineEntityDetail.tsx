import { useGetUsersQuery } from "../../../services/usersApi";
import { useGetEtablissementsQuery } from "../../../services/etablissementsApi";
import { useGetProspectsQuery } from "../../../services/ProspectApi";
import EntityDetailView from "./EntityDetailView";
import { Loader2 } from "lucide-react";

interface PipelineEntityDetailProps {
  card: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PipelineEntityDetail({
  card,
  isOpen,
  onClose,
}: PipelineEntityDetailProps) {
  if (!isOpen || !card) return null;

  const typeStr = (card.type_user || "").toLowerCase();
  const isEtab = typeStr === "compte_pro" || typeStr === "etablissement" || !!card.etablissement_id;
  const isProspect = typeStr === "prospect" || (!card.user_id && !card.etablissement_id) || !!card.prospect_id;

  const userId = card.user_id ? String(card.user_id) : undefined;
  const etabId = card.etablissement_id ? String(card.etablissement_id) : undefined;

  const { data: usersData, isLoading: isUserLoading } = useGetUsersQuery(
    { page: 1, search: userId },
    { skip: isEtab || isProspect || !userId }
  );

  const { data: etabsData, isLoading: isEtabLoading } = useGetEtablissementsQuery(
    { page: 1, search: etabId },
    { skip: !isEtab || !etabId }
  );

  const { data: prospectsData, isLoading: isProspectLoading } = useGetProspectsQuery(
    { page: 1, per_page: 100 },
    { skip: !isProspect }
  );

  const isLoading =
    (!isEtab && !isProspect && isUserLoading) ||
    (isEtab && isEtabLoading) ||
    (isProspect && isProspectLoading);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black/30 backdrop-blur-xs flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#E60067]" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Chargement des détails...
          </span>
        </div>
      </div>
    );
  }

  const foundUser = usersData?.data?.data?.find(
    (u) => String(u.id) === String(card.user_id)
  ) || usersData?.data?.data?.[0];

  const foundEtab = etabsData?.data?.data?.find(
    (e) => String(e.id) === String(card.etablissement_id)
  ) || etabsData?.data?.data?.[0];

  const prospectTargetId = card.prospect_id || card.id;
  const foundProspect = prospectsData?.data?.data?.find(
    (p: any) => String(p.id) === String(prospectTargetId)
  );

  const finalType: "user" | "etablissement" | "prospect" = isEtab
    ? "etablissement"
    : isProspect
    ? "prospect"
    : "user";

  return (
    <EntityDetailView
      cardId={card.id}
      user={finalType === "user" ? foundUser : null}
      etablissement={finalType === "etablissement" ? foundEtab : null}
      prospect={finalType === "prospect" ? foundProspect : null}
      type={finalType}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}