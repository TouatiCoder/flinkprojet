import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Pencil,
  MoreVertical,
  Copy,
  Check,
  Eye,
  Users,
  Globe,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import UserPopUpTelephones from "../../dashboard/user-detaille/UserPopUpTelephones";
import GestPopUp from "../../dashboard/etablissement-detaille/GestPopUp";
import ProspectEditModal from "../../dashboard/CRM/prospect/ProspectEditModal";
import UserUpdate from "../../dashboard/user-detaille/UserUpdate";
import EtablissementUpdate from "../../dashboard/user-detaille/EtablissementUpdate";
import { useAuthUser } from "../../../hooks/useAuthUser";

interface EntityHeaderProps {
  entity: any;
  type?: "user" | "prospect" | "etablissement";
  onBack: () => void;
  onEdit?: () => void;
}

function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Jamais";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

function formatDate(dateStr?: string | null): string {
  // if (!dateStr) return "—";
  // return new Date(dateStr).toLocaleDateString("fr-FR", {
  //   day: "2-digit",
  //   month: "long",
  //   year: "numeric",
  // });

  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";

  const dateFormatted = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const timeFormatted = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateFormatted} à ${timeFormatted}`;
}

export default function EntityHeader({
  entity,
  type = "user",
  onBack,
  onEdit,
}: EntityHeaderProps) {
  const location = useLocation();
  const { canUpdate, isSuperAdmin } = useAuthUser();

  const currentSlug = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments[0] || (type === "etablissement" ? "etablissement" : type === "user" ? "user" : "prospect");
  }, [location.pathname, type]);

  const canEdit = isSuperAdmin || canUpdate(currentSlug);

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPhonePopUpOpen, setIsPhonePopUpOpen] = useState(false);
  const [isGestPopUpOpen, setIsGestPopUpOpen] = useState(false);
  const [isProspectEditOpen, setIsProspectEditOpen] = useState(false);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isEtabEditOpen, setIsEtabEditOpen] = useState(false);

  const isEtab = type === "etablissement";
  const isUser = type === "user";
  const isProspect = type === "prospect";

  const title = isEtab
    ? entity.nom
    : `${entity.first_name || entity.prenom || ""} ${entity.last_name || entity.nom || ""}`.trim() ||
      entity.name_entreprise ||
      "Sans nom";

  const formattedId = isEtab ? `CP${entity.id}` : `#${entity.id}`;

  const isActive = isEtab
    ? Number(entity.status) === 1 || entity.is_verified === 1
    : entity.is_active !== undefined
    ? !!entity.is_active
    : !!entity.is_verified || !!entity.isActif;

  const isAccountVerified = isEtab
    ? entity.is_verified !== null && entity.is_verified !== undefined && entity.is_verified !== 0
    : entity.is_verified !== null && entity.is_verified !== undefined && entity.is_verified !== 0;

  const email = entity.email || null;
  const telephone =
    entity.default_phone_number || entity.phone || entity.tele || entity.telephone || null;
  const ville = entity.ville?.name || entity.ville_name || entity.ville || null;
  const siteweb = entity.siteweb || null;
  const activite =
    (typeof entity.activite === "string" ? entity.activite : null) ||
    (typeof entity.secteur === "string" ? entity.secteur : null) ||
    (typeof entity.activite_name === "string" ? entity.activite_name : null) ||
    null;
  const managers = entity.gestionnaires || [];

  const commercialName = useMemo(() => {
    if (typeof entity.commercial === "string" && entity.commercial.trim() !== "") {
      return entity.commercial;
    }

    if (entity.commercial && typeof entity.commercial === "object" && entity.commercial.name) {
      return entity.commercial.name;
    }

    if (entity.manager_name && String(entity.manager_name).trim() !== "") {
      return entity.manager_name;
    }

    if (entity.manager) {
      const fn = entity.manager.first_name || "";
      const ln = entity.manager.last_name || "";
      const full = `${fn} ${ln}`.trim();
      if (full) return full;
    }

    return "Non assigné";
  }, [entity]);

  const sourceName =
    entity.source_name ||
    entity.prospect_source?.name ||
    entity.source?.name ||
    entity.prospect_source_name ||
    null;

  const isEmailVerified = !!(entity.is_email_verified || entity.email_verified_at);
  const isTeleVerified = !!(entity.is_telephone_verified || entity.tele_verified_at);

  const logoSrc = isEtab
    ? entity.logo
      ? mediaBaseUrl + entity.logo
      : null
    : entity.avatar
    ? entity.avatar.startsWith("http")
      ? entity.avatar
      : mediaBaseUrl + entity.avatar
    : null;

  const relationTelephones = useMemo(() => {
    if (entity.relation_telephones && entity.relation_telephones.length > 0) {
      return entity.relation_telephones;
    }
    if (isEtab && telephone) {
      return [
        {
          telephone_id: 1,
          telephone_number: telephone,
          usage_count: managers.length || 1,
          users: managers.map((g: any) => ({
            id: g.id,
            first_name: g.first_name,
            last_name: g.last_name,
            email: g.email,
            avatar: g.avatar,
          })),
        },
      ];
    }
    return [];
  }, [entity, isEtab, telephone, managers]);

  const handleCopyPhone = () => {
    if (!telephone) return;
    navigator.clipboard.writeText(String(telephone));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };
  const handleCopyId = () => {
    navigator.clipboard.writeText(String(entity.id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleModifierClick = () => {
    if (onEdit) {
      onEdit();
    } else if (isProspect) {
      setIsProspectEditOpen(true);
    } else if (isUser) {
      setIsUserEditOpen(true);
    } else if (isEtab) {
      setIsEtabEditOpen(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>
            Retour aux {isEtab ? "établissements" : type === "user" ? "utilisateurs" : "prospects"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={handleModifierClick}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#5C24E8] hover:bg-[#4a1dc2] text-white transition-all shadow-xs cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-48 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 shadow-xl py-1 text-xs">
                  {["Créer une opportunité", "Ajouter une note", "Archiver", "Supprimer"].map(
                    (item, i) => (
                      <button
                        key={item}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors ${
                          i === 3
                            ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={title}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 dark:border-gray-800 shadow-xs"
              />
            ) : isEtab ? (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f285c] to-[#1a3a7a] flex items-center justify-center text-white font-bold text-xs p-1 text-center shadow-md leading-tight uppercase">
                {title.split(" ").slice(0, 2).join("\n")}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5C24E8] to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-500/20">
                {title.slice(0, 2).toUpperCase()}
              </div>
            )}

            {isAccountVerified && (
              <div
                className="absolute -top-1.5 -right-1.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-xs"
                title={`Vérifié ${typeof entity.is_verified === "string" ? formatDate(entity.is_verified) : ""}`}
              >
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 dark:fill-blue-600 text-white" />
              </div>
            )}
            
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                isActive ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>

              <span className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold tracking-wide bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/50 uppercase">
                {isEtab ? "COMPTE PRO" : type === "user" ? "USER" : "PROSPECT"}
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold tracking-wide border flex items-center gap-1 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/50"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                {isActive ? "Actif" : "Inactif"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11.5px] text-slate-400 dark:text-slate-500">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                title="Copier l'ID"
              >
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                ID {formattedId}
              </button>
              <span>•</span>
              <span>Créé le {formatDate(entity.created_at)}</span>

              {sourceName && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Source : {sourceName}</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1.5 text-xs text-slate-600 dark:text-slate-300">
              {activite && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {activite}
                  </span>
                </div>
              )}

              {telephone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold tracking-wide">{telephone}</span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded transition-colors cursor-pointer"
                    title="Copier le numéro"
                  >
                    {copiedPhone ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  {!isEtab && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isTeleVerified ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      title={isTeleVerified ? "Téléphone vérifié" : "Téléphone non vérifié"}
                    />
                  )}
                  {relationTelephones.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsPhonePopUpOpen(true)}
                      className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                      title="Voir les téléphones et comptes associés"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {(isEtab || isUser) && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ges {managers.length}</span>
                  </div>
                  {managers.length > 0 && (
                    <div className="inline-flex items-center gap-1">
                      <div className="flex items-center">
                        {managers.slice(0, 3).map((m: any, i: number) => {
                          const mAvatar = m.logo
                            ? (m.logo.startsWith("http") ? m.logo : mediaBaseUrl + m.logo)
                            : m.avatar
                            ? (m.avatar.startsWith("http") ? m.avatar : mediaBaseUrl + m.avatar)
                            : "/images/user/default-avatar-user.jpg";
                          return (
                            <div
                              key={m.id || i}
                              className="w-5 h-5 rounded-full border border-white dark:border-gray-800 overflow-hidden -ml-1 first:ml-0 shrink-0 bg-slate-100 dark:bg-gray-800"
                            >
                              <img
                                src={mAvatar}
                                alt={m.nom || m.first_name || "Manager"}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          );
                        })}
                        {managers.length > 3 && (
                          <div className="-ml-1 w-5 h-5 rounded-full border border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-[9px] font-bold text-gray-600 dark:text-gray-300">
                            +{managers.length - 3}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGestPopUpOpen(true)}
                        className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                        title={isEtab ? "Voir les gestionnaires" : "Voir les comptes associés"}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{email}</span>
                  {!isEtab && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isEmailVerified ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      title={isEmailVerified ? "Email vérifié" : "Email non vérifié"}
                    />
                  )}
                </div>
              )}

              {siteweb && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href={siteweb.startsWith("http") ? siteweb : `https://${siteweb}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {siteweb}
                  </a>
                </div>
              )}

              {ville && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ville}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-right space-y-2 shrink-0 hidden md:block">
          <div>
            <p className="text-[10.5px] text-slate-400 leading-none mb-0.5">Commercial</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {commercialName}
            </p>
          </div>
          {entity.latest_connexion?.date_connexion && (
            <div>
              <p className="text-[10.5px] text-slate-400 leading-none mb-0.5">Dernière connexion</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {getRelativeTime(entity.latest_connexion.date_connexion)}
              </p>
            </div>
          )}
        </div>
      </div>

      {isProspect && (
        <ProspectEditModal
          isOpen={isProspectEditOpen}
          onClose={() => setIsProspectEditOpen(false)}
          prospect={entity}
        />
      )}

      {isUser && (
        <UserUpdate
          isOpen={isUserEditOpen}
          onClose={() => setIsUserEditOpen(false)}
          user={entity}
        />
      )}

      {isEtab && (
        <EtablissementUpdate
          isOpen={isEtabEditOpen}
          onClose={() => setIsEtabEditOpen(false)}
          etablissement={entity}
        />
      )}

      {(isEtab || isUser) && (
        <GestPopUp
          isOpen={isGestPopUpOpen}
          onClose={() => setIsGestPopUpOpen(false)}
          gestionnaires={managers}
          etablissementNom={title}
        />
      )}

      <UserPopUpTelephones
        isOpen={isPhonePopUpOpen}
        onClose={() => setIsPhonePopUpOpen(false)}
        relationTelephones={relationTelephones}
        userPhone={telephone}
      />
    </div>
  );
}