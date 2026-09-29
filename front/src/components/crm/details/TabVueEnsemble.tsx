import TabInformations from "./tabs/TabInformations";
import VueEnsembleCards, { USER_CARDS_DEFAULT } from "../../crm/details/tabs/VueEnsembleCards";
import OpportuniteSection from "../../crm/details/tabs/OpportuniteSection";
import NouvelleOpportuniteSection from "./tabs/NouvelleOpportuniteSection";
import { useGetProspectVueEnsembleCardsQuery } from "../../../services/ProspectApi";
import SectionNotes from "./tabs/SectionNotes";

interface TabVueEnsembleProps {
  entity: any;
  type?: "user" | "prospect" | "etablissement";
}

export default function TabVueEnsemble({ entity, type = "user" }: TabVueEnsembleProps) {
  const isProspect = type === "prospect";

  const { data: cardsResponse } = useGetProspectVueEnsembleCardsQuery(entity?.id, {
    skip: !entity?.id || type !== 'prospect',
  });

  if (isProspect) {
    return (
      <div className="space-y-6">
        <VueEnsembleCards
          type={type}
          customData={cardsResponse?.data}
          onVoirDetailsOpportunite={() => console.log("Details opportunite clicked")}
        />
        <OpportuniteSection type={type} entityId={entity?.id} />
        <NouvelleOpportuniteSection type={type} entityId={entity?.id} />
        <TabInformations entity={entity} type={type} isVueEnsemble={true} />
        <SectionNotes entity={entity} type={type} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VueEnsembleCards
        type={type}
        customData={type === "user" ? USER_CARDS_DEFAULT : undefined}
        onVoirDetailsOpportunite={() => console.log("Details opportunite clicked")}
      />

      <OpportuniteSection type={type} entityId={entity?.id} />
      <NouvelleOpportuniteSection type={type} entityId={entity?.id} />
      <SectionNotes entity={entity} type={type} />
    </div>
  );
}