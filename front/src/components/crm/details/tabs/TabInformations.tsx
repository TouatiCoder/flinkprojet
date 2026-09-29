import { User as UserIcon, Building2, Briefcase, Globe } from "lucide-react";

interface TabInformationsProps {
  entity: any;
  type?: "user" | "prospect" | "etablissement";
  isVueEnsemble?: boolean;
}

export default function TabInformations({
  entity,
  type = "user",
  isVueEnsemble = false,
}: TabInformationsProps) {
  const isEtab = type === "etablissement";
  const isProspect = type === "prospect";

  const hideInformationsTables = isProspect && isVueEnsemble;

  const fullName = isEtab
    ? (typeof entity.nom === "string" ? entity.nom : entity.nom?.name || "Sans nom")
    : isProspect
    ? (
        entity.name_entreprise ||
        `${entity.prenom || entity.first_name || ""} ${entity.nom || entity.last_name || ""}`.trim() ||
        entity.title ||
        "Prospect sans nom"
      )
    : `${entity.first_name || entity.prenom || ""} ${entity.last_name || entity.nom || ""}`.trim() ||
      entity.nom ||
      "Sans nom";

  const telephone =
    entity.telephone ||
    entity.default_phone_number ||
    entity.phone ||
    entity.tele ||
    "Non renseigné";

  const email = entity.email || entity.prospect_email || "Non renseigné";

  const ville =
    (typeof entity.ville === "string" ? entity.ville : entity.ville?.name) ||
    (typeof entity.ville_name === "string" ? entity.ville_name : null) ||
    "Non renseignée";

  const nomEntreprise =
    entity.name_entreprise ||
    (typeof entity.nom === "string" ? entity.nom : null) ||
    "Non renseignée";

  const statut = isEtab
    ? entity.statut || "Actif"
    : isProspect
    ? entity.statut || entity.status || "Nouveau"
    : entity.status || "Actif";

  const adresse = entity.adresse || entity.address || "Non renseignée";
  const secteur = entity.secteur_activite || entity.secteur || "Non renseigné";
  const ca = entity.chiffre_affaires || entity.ca || 0;
  const siteweb = entity.siteweb || entity.website || "";

  return (
    <div className="space-y-6">
      {!hideInformationsTables && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-gray-800/80">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Coordonnées
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Nom complet</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{fullName}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{email}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Téléphone</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{telephone}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Ville</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{ville}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Adresse</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{adresse}</span>
              </div>

              <div className="flex justify-between items-center py-1 pt-1.5 border-t border-slate-100 dark:border-gray-800">
                <span className="text-slate-400 font-medium">Statut</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                  {statut}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-gray-800/80">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                {isEtab ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <Briefcase className="w-4 h-4" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Informations professionnelles
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Nom de l'entreprise</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {nomEntreprise}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Secteur / Activité</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{secteur}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Chiffre d'affaires</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {ca > 0 ? `${Number(ca).toLocaleString("fr-FR")} DH` : "---"}
                </span>
              </div>

              {siteweb && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">Site Web</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    <a
                      href={siteweb.startsWith("http") ? siteweb : `https://${siteweb}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      {siteweb}
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}