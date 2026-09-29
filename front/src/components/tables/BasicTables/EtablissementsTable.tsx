import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import { Etablissement, GestionnaireUser } from "../../../services/etablissementsApi";
import {
  ArrowUp,
  ArrowDown,
  Phone,
  MessageCircle,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  Mail,
} from "lucide-react";
import GestPopUp from "../../dashboard/etablissement-detaille/GestPopUp";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import EtabConvertToOpportunite from "../../dashboard/three-points/EtabConvertToOpportunite";

interface EtablissementsTableProps {
  etablissements: Etablissement[];
  onRowClick?: (etablissement: Etablissement) => void;
  onEditClick?: (etablissement: Etablissement) => void;
}

type SortField = keyof Etablissement | null;
type SortDirection = "asc" | "desc";

const EtablissementsTable: React.FC<EtablissementsTableProps> = ({
  etablissements,
  onRowClick,
  // onEditClick,
}) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedEtabForConversion, setSelectedEtabForConversion] = useState<Etablissement | null>(null);

  const [selectedGestData, setSelectedGestData] = useState<{
    isOpen: boolean;
    managers: GestionnaireUser[];
    etabNom: string;
  }>({
    isOpen: false,
    managers: [],
    etabNom: "",
  });

  const handleSort = (field: keyof Etablissement) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEtablissements = [...etablissements].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const renderSortIcon = (field: keyof Etablissement) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 inline text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 inline text-blue-600" />
    );
  };

  const renderActiviteBadge = (activiteName?: string | null) => {
    const act = (activiteName || "").trim().toLowerCase();

    if (act.includes("email") || act.includes("mail")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </span>
      );
    }
    if (act.includes("appel") || act.includes("phone")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
          <Phone className="w-3.5 h-3.5" />
          <span>Appel</span>
        </span>
      );
    }
    if (act.includes("whatsapp")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </span>
      );
    }
    if (act.includes("démo") || act.includes("demo") || act.includes("visio")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
          <Video className="w-3.5 h-3.5" />
          <span>Démo</span>
        </span>
      );
    }
    if (act.includes("rappeler") || act.includes("relance") || act.includes("rappel")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>À rappeler</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
        <Circle className="w-3.5 h-3.5 fill-slate-300 text-slate-300 dark:fill-slate-600 dark:text-slate-600" />
        <span>{activiteName || "Aucune"}</span>
      </span>
    );
  };

  const renderSourceBadge = (source?: string | null) => {
    const src = source || "Facebook";
    const lower = src.toLowerCase();

    let colorClasses = "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40";
    if (lower.includes("auto")) {
      colorClasses = "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40";
    } else if (lower.includes("immo")) {
      colorClasses = "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40";
    } else if (lower.includes("flink") || lower.includes("direct")) {
      colorClasses = "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40";
    } else if (lower.includes("pro")) {
      colorClasses = "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11.5px] font-semibold border ${colorClasses}`}>
        {src}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 border-none shadow-none">
      <Table className="min-w-[1400px] w-full whitespace-nowrap">
        <TableHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
          <TableRow>
            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-slate-900" onClick={() => handleSort("nom")}>
                Compte Pro {renderSortIcon("nom")}
              </div>
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Contact
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Secteur
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Source
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-center text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Vérification
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-center text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Statut Pro
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Solde Ads
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Activité en cours
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Dernière activité
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Commercial
            </TableCell>

            <TableCell isHeader className="px-5 py-3.5 font-bold text-[#475467] text-center text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Action
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-slate-100 dark:divide-gray-800">
          {sortedEtablissements.map((etab) => {
            const raw = etab as any;
            const isVerified = Number(etab.status) === 1 || Boolean(etab.is_verified);
            const isComptePro = Boolean(raw.compte_pro);
            const soldeAdsVal = Number(raw.solde_ads) || 0;
            const activiteEnCours = raw.activite_en_cours || "Appel";
            const derniereActivite = raw.derniere_activite || "---";
            const commercial = raw.commercial || "---";
            const secteur = raw.secteur || "---";
            const source = raw.source || "Facebook";

            const commParts = commercial.trim().split(" ");
            const commInitials = commParts.length > 1
              ? `${commParts[0][0]}${commParts[1][0]}`.toUpperCase()
              : commercial.slice(0, 2).toUpperCase();

            return (
              <TableRow
                key={etab.id}
                onClick={() => onRowClick?.(etab)}
                className={onRowClick ? "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors" : ""}
              >
                <TableCell className="px-5 py-4 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-xl shrink-0 border border-slate-100 dark:border-gray-800 flex items-center justify-center font-bold text-xs bg-slate-900 text-white shadow-xs">
                      {etab.logo ? (
                        <img
                          src={mediaBaseUrl + etab.logo}
                          alt={etab.nom}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        etab.nom?.charAt(0)?.toUpperCase() || "E"
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-800 text-[13px] dark:text-slate-100 truncate">
                        {etab.nom}
                      </span>
                      <span className="text-[12px] text-slate-400 dark:text-slate-500 truncate">
                        {etab.email || "---"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4 text-start text-[12.5px] font-semibold text-slate-800 dark:text-slate-200">
                  {etab.default_phone_number || "---"}
                </TableCell>

                <TableCell className="px-5 py-4 text-[13px] font-medium text-[#475467] dark:text-slate-300">
                  {secteur}
                </TableCell>

                <TableCell className="px-5 py-4 text-[13px] font-medium text-start">
                  {renderSourceBadge(source)}
                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-[#ECFDF3] text-[#027A48] dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" fill="#027A48" stroke="#ECFDF3" />
                      <span>Vérifié</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-[#FEF3F2] text-[#B42318] dark:bg-rose-950/40 dark:text-rose-400">
                      <XCircle className="w-3.5 h-3.5" fill="#B42318" stroke="#FEF3F2" />
                      <span>Non vérifié</span>
                    </span>
                  )}
                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  {isComptePro ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-bold bg-[#ECFDF3] text-[#027A48] dark:bg-emerald-950/40 dark:text-emerald-400">
                      Activé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-bold bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                      Non activé
                    </span>
                  )}
                </TableCell>

                <TableCell className="px-5 py-4 text-start text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                  {soldeAdsVal > 0 ? `${soldeAdsVal.toLocaleString("fr-FR")} DH` : "0 DH"}
                </TableCell>

                <TableCell className="px-5 py-4 text-start">
                  {renderActiviteBadge(activiteEnCours)}
                </TableCell>

                <TableCell className="px-5 py-4 text-[13px] font-medium text-[#475467] dark:text-slate-400">
                  {derniereActivite}
                </TableCell>

                <TableCell className="px-5 py-4 text-start">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-bold text-[10.5px] flex items-center justify-center shrink-0">
                      {commInitials || "NA"}
                    </div>
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {commercial}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  <div
                    className="flex items-center justify-center gap-2"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onRowClick?.(etab)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#344054] bg-white border border-[#D0D5DD] hover:bg-gray-50 dark:text-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 shadow-xs transition-colors cursor-pointer"
                    >
                      Voir
                    </button>

                    {/* <button
                      type="button"
                      title="Modifier"
                      onClick={() => onEditClick?.(etab)}
                      className="p-1.5 rounded-lg text-blue-600 bg-white border border-transparent hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button> */}

                    <div className="relative">
                      {/* <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === etab.id ? null : etab.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button> */}

                      <Dropdown
                        isOpen={openDropdownId === etab.id}
                        onClose={() => setOpenDropdownId(null)}
                        className="w-48 right-0 bottom-full mb-1 sm:bottom-auto sm:mb-0 sm:mt-1 z-50"
                      >
                        <DropdownItem
                          onClick={() => {
                            setSelectedEtabForConversion(etab);
                            setIsConvertModalOpen(true);
                            setOpenDropdownId(null);
                          }}
                        >
                          Convert To Opportunite
                        </DropdownItem>
                      </Dropdown>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <GestPopUp
        isOpen={selectedGestData.isOpen}
        onClose={() => setSelectedGestData((prev) => ({ ...prev, isOpen: false }))}
        gestionnaires={selectedGestData.managers}
        etablissementNom={selectedGestData.etabNom}
      />

      <EtabConvertToOpportunite
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setSelectedEtabForConversion(null);
        }}
        etablissement={selectedEtabForConversion}
      />
    </div>
  );
};

export default EtablissementsTable;