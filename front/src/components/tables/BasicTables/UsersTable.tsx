import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import { User } from "../../../services/usersApi";
import {
  ArrowUp,
  ArrowDown,
  Phone,
  MessageCircle,
  Video,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  Mail,
} from "lucide-react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import UserConvertToOpportunite from "../../dashboard/three-points/UserConvertToOpportunite";

interface UsersTableProps {
  users: User[];
  onRowClick?: (user: User) => void;
  onEditClick?: (user: User) => void;
}

type SortField = keyof User | null;
type SortDirection = "asc" | "desc";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
  "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
  "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300",
];

export default function UsersTable({ users, onRowClick }: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedUserForConversion, setSelectedUserForConversion] = useState<User | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map((u) => Number(u.id)));
    }
  };

const toggleSelectRow = (id: number) => {
  if (selectedRows.includes(id)) {
    setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
  } else {
    setSelectedRows([...selectedRows, id]);
  }
};

  const sortedUsers = [...users].sort((a, b) => {
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

  const renderSortIcon = (field: keyof User) => {
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

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 border-none shadow-none">
      <Table className="min-w-[1400px] w-full whitespace-nowrap">
        <TableHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
          <TableRow>
            <TableCell isHeader className="w-10 px-4 py-3.5 text-center">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={selectedRows.length === users.length && users.length > 0}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              <div className="flex items-center cursor-pointer hover:text-slate-900" onClick={() => handleSort("first_name")}>
                User {renderSortIcon("first_name")}
              </div>
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Contact
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Secteur
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Source
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-center text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Vérification
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-center text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Compte Pro
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Solde Ads
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Activité en cours
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Dernière activité
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-start text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Commercial
            </TableCell>

            <TableCell isHeader className="px-4 py-3.5 font-bold text-[#475467] text-center text-[11.5px] uppercase tracking-wide dark:text-gray-400">
              Action
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-slate-100 dark:divide-gray-800">
          {sortedUsers.map((user, index) => {
            const raw = user as any;
            const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.slug || "Utilisateur";
            const initials = `${(user.first_name || "U")[0]}${(user.last_name || "")[0] || ""}`.toUpperCase();
            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

            const isVerified = Boolean(user.is_active ?? raw.is_email_verified ?? true);
            const isComptePro = Boolean(raw.compte_pro);
            const soldeAdsVal = Number(raw.solde_ads) || 0;
            const activiteEnCours = raw.activite_en_cours || "Aucune";
            const derniereActivite = raw.derniere_activite || "-";
            const commercial = raw.commercial || "Non assigné";
            const secteur = raw.secteur || "Automobile";
            const source = raw.source || "Facebook";

            return (
              <TableRow
                key={user.id}
                onClick={() => onRowClick?.(user)}
                className={onRowClick ? "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors" : ""}
              >
                <TableCell className="w-10 px-4 py-4 text-center">
                  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(Number(user.id))}
                      onChange={() => toggleSelectRow(Number(user.id))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 text-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                      {user.avatar ? (
                        <img
                          src={mediaBaseUrl + user.avatar}
                          alt={fullName}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="font-bold text-slate-800 text-[13px] dark:text-slate-100">
                      {fullName}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 text-start">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[12.5px] font-medium text-[#475467] dark:text-slate-300">
                      {user.email || "---"}
                    </span>
                    <span className="text-[12px] text-slate-400 dark:text-slate-500">
                      {user.tele || "---"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 text-[13px] font-medium text-[#475467] dark:text-slate-300">
                  {secteur}
                </TableCell>

                <TableCell className="px-4 py-4 text-[13px] font-medium text-[#475467] dark:text-slate-300">
                  {source}
                </TableCell>

                <TableCell className="px-4 py-4 text-center">
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

                <TableCell className="px-4 py-4 text-center">
                  {isComptePro ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-bold bg-[#ECFDF3] text-[#027A48] dark:bg-emerald-950/40 dark:text-emerald-400">
                      Oui
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-bold bg-[#FEF3F2] text-[#B42318] dark:bg-rose-950/40 dark:text-rose-400">
                      Non
                    </span>
                  )}
                </TableCell>

                <TableCell className="px-4 py-4 text-start text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                  {soldeAdsVal > 0 ? `${soldeAdsVal.toLocaleString("fr-FR")} DH` : "0 DH"}
                </TableCell>

                <TableCell className="px-4 py-4 text-start">
                  {renderActiviteBadge(activiteEnCours)}
                </TableCell>

                <TableCell className="px-4 py-4 text-[13px] font-medium text-[#475467] dark:text-slate-400">
                  {derniereActivite}
                </TableCell>

                <TableCell className="px-4 py-4 text-[13px] font-bold text-slate-800 dark:text-slate-300">
                  {commercial}
                </TableCell>

                <TableCell className="px-4 py-4 text-center">
                  <div
                    className="flex items-center justify-center gap-2"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onRowClick?.(user)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#344054] bg-white border border-[#D0D5DD] hover:bg-gray-50 dark:text-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 shadow-sm transition-colors cursor-pointer"
                    >
                      Voir
                    </button>

                    <div className="relative">
                      {/* <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button> */}

                      <Dropdown
                        isOpen={openDropdownId === user.id}
                        onClose={() => setOpenDropdownId(null)}
                        className="w-48 right-0 bottom-full mb-1 sm:bottom-auto sm:mb-0 sm:mt-1 z-50"
                      >
                        <DropdownItem
                          onClick={() => {
                            setSelectedUserForConversion(user);
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

      <UserConvertToOpportunite
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setSelectedUserForConversion(null);
        }}
        user={selectedUserForConversion}
      />
    </div>
  );
}