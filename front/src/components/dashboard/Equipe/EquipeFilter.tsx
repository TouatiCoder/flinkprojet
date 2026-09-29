import { Search, ChevronDown, Calendar } from "lucide-react";

export interface EquipeFilterValues {
  search: string;
  statut: string;
  secteur: string;
}

interface EquipeFilterProps {
  values: EquipeFilterValues;
  /** Secteurs réellement présents dans les équipes chargées. */
  secteurs: string[];
  onChange: (key: keyof EquipeFilterValues, value: string) => void;
}

const selectClass =
  "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-semibold text-slate-700 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 dark:border-slate-700/80 dark:bg-[#0f172a] dark:text-slate-200";

export default function EquipeFilter({ values, secteurs, onChange }: EquipeFilterProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        {/* Recherche */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={values.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Rechercher une équipe..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 dark:border-slate-700/80 dark:bg-[#0f172a] dark:text-white"
          />
        </div>

        {/* Statut */}
        <div className="relative">
          <select
            value={values.statut}
            onChange={(e) => onChange("statut", e.target.value)}
            className={selectClass}
          >
            <option value="tous">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Secteur */}
        <div className="relative">
          <select
            value={values.secteur}
            onChange={(e) => onChange("secteur", e.target.value)}
            className={selectClass}
          >
            <option value="tous">Tous les secteurs</option>
            {secteurs.map((secteur) => (
              <option key={secteur} value={secteur}>
                {secteur}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {/*
          Période : présente dans la maquette, mais l'API n'expose aucune donnée
          datée au niveau équipe (ni GET /equipes ni les indicateurs agrégés
          depuis /membres). Le contrôle est donc désactivé plutôt que de laisser
          croire à un filtre qui ne filtre rien.
        */}
        <div className="relative" title="Filtre par période : en attente du support côté API">
          <div className="pointer-events-none flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-9 text-sm font-semibold text-slate-400 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-500">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">Toutes périodes</span>
          </div>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
    </div>
  );
}
