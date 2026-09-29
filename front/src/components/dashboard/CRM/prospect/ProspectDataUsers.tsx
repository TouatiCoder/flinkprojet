import { useState } from "react";
import {
  Car,
  Building2,
  ShoppingCart,
  Megaphone,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Wrench,
  Factory,
  Layers,
  RotateCw,
  UserPlus,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { ProspectItem } from "../../../../services/ProspectApi";

interface ProspectDataUsersProps {
  prospects: ProspectItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onActionClick?: (prospect: ProspectItem) => void;
}

function CommercialAvatar({
  avatar,
  name,
}: {
  avatar?: string | null;
  name?: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  const resolveUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    const clean = path.startsWith("/") ? path.slice(1) : path;
    const base = (import.meta as any).env?.VITE_BACKEND_URL || "https://v3.app24.ma";
    return `${base}/${clean}`;
  };

  const finalSrc = resolveUrl(avatar);
  const initials = name && name !== "Non assigné"
    ? name.trim().slice(0, 2).toUpperCase()
    : null;

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
      {finalSrc && !imgError ? (
        <img
          src={finalSrc}
          alt={name || "Commercial"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initials || <User className="w-3.5 h-3.5 text-slate-400" />
      )}
    </div>
  );
}

export default function ProspectDataUsers({
  prospects,
  currentPage,
  totalPages,
  totalItems,
  perPage,
  from,
  to,
  onPageChange,
  onPerPageChange,
  onActionClick,
}: ProspectDataUsersProps) {
  const getAvatarConfig = (nom: string, prenom: string, index: number) => {
    const pInitial = (prenom || "").trim().charAt(0);
    const nInitial = (nom || "").trim().charAt(0);
    const initials = (pInitial + nInitial).toUpperCase() || "PR";

    const colors = [
      "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
      "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    ];

    return {
      initials,
      colorClass: colors[index % colors.length],
    };
  };

  const getSecteurIcon = (secteurName?: string | null) => {
    const s = (secteurName || "").toLowerCase();
    if (s.includes("auto")) return <Car className="w-4 h-4 text-blue-500 shrink-0" />;
    if (s.includes("immo")) return <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />;
    if (s.includes("commerce")) return <ShoppingCart className="w-4 h-4 text-amber-500 shrink-0" />;
    if (s.includes("service")) return <Wrench className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (s.includes("industrie")) return <Factory className="w-4 h-4 text-slate-500 shrink-0" />;
    return <Layers className="w-4 h-4 text-purple-500 shrink-0" />;
  };

  const renderInteretBadge = (interet: { id: number; name: string; short_name?: string }) => {
    const label = interet.short_name || interet.name;
    const nameLower = (interet.short_name || interet.name).toLowerCase();

    if (nameLower.includes("user")) {
      return (
        <span
          key={interet.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-[#5C24E8] border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50 whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-3 h-3 stroke-[2.5]" />
          <span>{label}</span>
        </span>
      );
    }

    if (nameLower.includes("pro")) {
      return (
        <span
          key={interet.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50 whitespace-nowrap shrink-0"
        >
          <Building2 className="w-3 h-3 stroke-[2.5]" />
          <span>{label}</span>
        </span>
      );
    }

    if (nameLower.includes("ads")) {
      return (
        <span
          key={interet.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-500 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50 whitespace-nowrap shrink-0"
        >
          <Megaphone className="w-3 h-3 stroke-[2.5]" />
          <span>{label}</span>
        </span>
      );
    }

    if (nameLower.includes("renouv")) {
      return (
        <span
          key={interet.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 whitespace-nowrap shrink-0"
        >
          <RotateCw className="w-3 h-3 stroke-[2.5]" />
          <span>{label}</span>
        </span>
      );
    }

    return (
      <span
        key={interet.id}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-slate-300 whitespace-nowrap shrink-0"
      >
        <span>{label}</span>
      </span>
    );
  };

  const getEtapeBadge = (etapeName?: string | null) => {
    if (!etapeName) return <span className="text-slate-400">---</span>;

    const e = etapeName.toLowerCase().trim();
    let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";

    if (e.includes("gagné") || e.includes("gagne")) {
      badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
    } else if (e.includes("qualif")) {
      badgeColor = "bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60";
    } else if (e.includes("propos")) {
      badgeColor = "bg-purple-50 text-[#5C24E8] border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60";
    } else if (e.includes("perdu")) {
      badgeColor = "bg-rose-50 text-rose-500 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60";
    } else if (e.includes("nouveau")) {
      badgeColor = "bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor} whitespace-nowrap`}>
        {etapeName}
      </span>
    );
  };

  const getActiviteIcon = (iconName?: string | null) => {
    const i = (iconName || "").toLowerCase();
    if (i.includes("phone") || i.includes("appel")) return <Phone className="w-3.5 h-3.5 text-blue-500" />;
    if (i.includes("message") || i.includes("whatsapp")) return <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (i.includes("mail") || i.includes("email")) return <Mail className="w-3.5 h-3.5 text-purple-500" />;
    if (i.includes("calendar") || i.includes("reunion")) return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
    if (i.includes("note") || i.includes("file")) return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  const renderActiviteCell = (activite: any) => {
    if (!activite) {
      return <span className="text-slate-400 font-medium whitespace-nowrap">---</span>;
    }

    if (typeof activite === "string") {
      return (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            {getActiviteIcon(activite)}
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[140px]">
            {activite}
          </p>
        </div>
      );
    }

    const typeName = activite.type_name || activite.name || activite.title || "Activité";
    const dateStr = activite.date || activite.date_echeance || activite.created_at || activite.scheduledAt;

    let formattedDate = "";
    if (dateStr) {
      try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          formattedDate = parsed.toLocaleDateString("fr-FR");
        } else {
          formattedDate = String(dateStr);
        }
      } catch {
        formattedDate = String(dateStr);
      }
    }

    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
          {getActiviteIcon(activite.type_icone || activite.icone || activite.type_name || activite.name)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[140px]">
            {typeName}
          </p>
          {formattedDate && (
            <p className="text-[10px] text-slate-400">
              {formattedDate}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="min-w-[1250px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-gray-800 text-[11.5px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap bg-slate-50/40 dark:bg-gray-800/20">
              <th className="py-3.5 px-5">Prospect</th>
              <th className="py-3.5 px-4">Secteur</th>
              <th className="py-3.5 px-4">Objectifs</th>
              <th className="py-3.5 px-4">Montant total</th>
              <th className="py-3.5 px-4">Commercial</th>
              <th className="py-3.5 px-4">Statut / Étape</th>
              <th className="py-3.5 px-4">Dernière activité</th>
              <th className="py-3.5 px-4">Activité actuelle</th>
              <th className="py-3.5 px-4 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 text-[13px]">
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  Aucun prospect trouvé
                </td>
              </tr>
            ) : (
              prospects.map((prospect, idx) => {
                const { initials, colorClass } = getAvatarConfig(prospect.nom, prospect.prenom, idx);
                const interetsList = prospect.interets || [];
                const totalMontant = prospect.montants?.total ?? 0;
                const commercial = prospect.commercial;

                return (
                  <tr
                    key={prospect.id}
                    onClick={() => onActionClick?.(prospect)}
                    className="hover:bg-slate-50/70 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {prospect.nom} {prospect.prenom}
                          </p>
                          {prospect.name_entreprise && (
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {prospect.name_entreprise}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {prospect.telephone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs capitalize">
                        {getSecteurIcon(prospect.activite_name)}
                        <span>{prospect.activite_name || "---"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center flex-nowrap gap-1.5 whitespace-nowrap">
                        {interetsList.length > 0 ? (
                          interetsList.map((interet) => renderInteretBadge(interet))
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {Number(totalMontant).toLocaleString("fr-FR")} Dh
                        </span>
                        {totalMontant > 0 && (
                          <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400 mt-0.5">
                            {prospect.montants?.solde_ads ? (
                              <span>Ads: {prospect.montants.solde_ads} Dh</span>
                            ) : null}
                            {prospect.montants?.solde_ads && prospect.montants?.compte_pro ? (
                              <span>•</span>
                            ) : null}
                            {prospect.montants?.compte_pro ? (
                              <span>Pro: {prospect.montants.compte_pro} Dh</span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 flex-nowrap">
                        <CommercialAvatar
                          avatar={commercial?.avatar}
                          name={commercial?.name || prospect.manager_name}
                        />

                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {commercial?.name || prospect.manager_name || "Non assigné"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getEtapeBadge(prospect.etape_name)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderActiviteCell(prospect.derniere_activite)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderActiviteCell(prospect.activite_actuelle)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <div>
          Affichage {from || 0} à {to || 0} sur {totalItems} prospects
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#5C24E8] text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span>Lignes par page</span>
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => onPerPageChange?.(Number(e.target.value))}
              className="pl-2.5 pr-6 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-200 outline-none appearance-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}