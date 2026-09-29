import { useState, useMemo } from "react";
import { Etablissement } from "../../../services/etablissementsApi";
import { mediaBaseUrl } from "../../../constants/publicConstants";
import { Eye, Users } from "lucide-react";
import GestPopUp from "./GestPopUp";
import UserPopUpTelephones from "../user-detaille/UserPopUpTelephones";

interface EtablissementInfoProps {
  etablissement: Etablissement;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function EtablissementInfo({ etablissement }: EtablissementInfoProps) {
  const [isGestPopUpOpen, setIsGestPopUpOpen] = useState(false);
  const [isPhonePopUpOpen, setIsPhonePopUpOpen] = useState(false);

  const logoSrc = etablissement.logo ? mediaBaseUrl + etablissement.logo : null;
  const isActive = etablissement.is_verified; 
  
  const activiteText = etablissement.activites || etablissement.activite || etablissement.secteur || "Non renseignée";
  const phone = etablissement.default_phone_number || etablissement.phone || etablissement.tele || etablissement.telephone || "Non renseigné";
  const managers = etablissement.gestionnaires || [];
  const commercialName = "Youssef Flink";

  const relationTelephones = useMemo(() => {
    if (etablissement.relation_telephones && etablissement.relation_telephones.length > 0) {
      return etablissement.relation_telephones;
    }
    const defaultPhone = etablissement.default_phone_number || etablissement.phone || etablissement.tele || etablissement.telephone;
    if (defaultPhone) {
      return [
        {
          telephone_id: 1,
          telephone_number: defaultPhone,
          usage_count: managers.length || 1,
          users: managers.map((g) => ({
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
  }, [etablissement, managers]);

  return (
    <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center bg-gradient-to-br from-[#0f285c] to-[#1a3a7a]">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={etablissement.nom}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-center text-xs leading-tight tracking-wide px-1 uppercase">
                {etablissement.nom.split(' ').slice(0, 2).join('\n')}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                {etablissement.nom}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isActive ? "Actif" : "Inactif"}
              </span>
            </div>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
              ID : CP{etablissement.id}
            </p>
          </div>
        </div>

        <button className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      <div className="mt-6 flex justify-between items-start">
        <div className="space-y-3 min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span className="truncate">{activiteText}</span>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{etablissement.ville || "Non renseignée"}</span>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>{phone}</span>
            <button
              type="button"
              className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800 transition-colors ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhonePopUpOpen(true);
              }}
              title="Voir les téléphones et comptes associés"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>Ges {managers.length}</span>
            </div>
            {managers.length > 0 ? (
              <div
                onClick={() => setIsGestPopUpOpen(true)}
                className="inline-flex items-center cursor-pointer p-1 -m-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
                title="Voir les gestionnaires"
              >
                <div className="flex items-center pointer-events-none">
                  {managers.slice(0, 3).map((m, i) => {
                    const avatarSrc = m.avatar
                      ? mediaBaseUrl + m.avatar
                      : "/images/user/default-avatar-user.jpg";
                    return (
                      <div
                        key={m.id || i}
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden -ml-1.5 first:ml-0 shrink-0 shadow-sm"
                        style={{ zIndex: managers.length - i }}
                      >
                        <img
                          src={avatarSrc}
                          alt={m.first_name}
                          className="object-cover w-full h-full"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    );
                  })}
                  {managers.length > 3 && (
                    <div
                      className="-ml-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-sm"
                      style={{ zIndex: 0 }}
                    >
                      <span className="text-gray-600 dark:text-gray-300 text-[10px] font-semibold">
                        +{managers.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800 transition-colors ml-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGestPopUpOpen(true);
                  }}
                  title="Voir les gestionnaires"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Aucun</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span className="truncate">{etablissement.email || "Non renseigné"}</span>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            {etablissement.siteweb ? (
              <a
                href={etablissement.siteweb.startsWith("http") ? etablissement.siteweb : `https://${etablissement.siteweb}`}
                target="_blank"
                rel="noreferrer"
                className="truncate text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {etablissement.siteweb}
              </a>
            ) : (
              <span className="truncate text-gray-400">Non renseigné</span>
            )}
          </div>
        </div>

        <div className="w-[1px] bg-gray-100 dark:bg-gray-800 self-stretch mx-2"></div>

        <div className="space-y-4 shrink-0 w-36 pl-4">
          <div>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mb-1">Créé le</p>
            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
              {formatDate(etablissement.created_at)}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium mb-1">Commercial</p>
            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
              {commercialName}
            </p>
          </div>
        </div>
      </div>

      <GestPopUp
        isOpen={isGestPopUpOpen}
        onClose={() => setIsGestPopUpOpen(false)}
        gestionnaires={managers}
        etablissementNom={etablissement.nom}
      />

      <UserPopUpTelephones
        isOpen={isPhonePopUpOpen}
        onClose={() => setIsPhonePopUpOpen(false)}
        relationTelephones={relationTelephones}
        userPhone={phone !== "Non renseigné" ? phone : undefined}
      />
    </div>
  );
}
