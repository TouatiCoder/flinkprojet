import { Search, ChevronDown, RotateCcw } from "lucide-react";
import {
  AUDIENCE_LABELS,
  LANGUE_LABELS,
  STATUT_LABELS,
  type WhatsappFilterValues,
} from "./whatsappTypes";

interface WhatsappFilterProps {
  values: WhatsappFilterValues;
  /** Types issus de l'API : la liste est administrable en base. */
  types: { slug: string; name: string }[];
  onChange: (key: keyof WhatsappFilterValues, value: string) => void;
  onReset: () => void;
}

const selectClass =
  "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-semibold text-slate-700 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700/80 dark:bg-[#0f172a] dark:text-slate-200";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400";

export default function WhatsappFilter({ values, types, onChange, onReset }: WhatsappFilterProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-[#091122]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_auto] xl:items-end">
        {/* Recherche */}
        <div>
          <label className={labelClass} htmlFor="wa-search">
            Recherche
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="wa-search"
              type="text"
              value={values.search}
              onChange={(e) => onChange("search", e.target.value)}
              placeholder="Rechercher un template..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700/80 dark:bg-[#0f172a] dark:text-white"
            />
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className={labelClass} htmlFor="wa-audience">
            Audience
          </label>
          <div className="relative">
            <select
              id="wa-audience"
              value={values.audience}
              onChange={(e) => onChange("audience", e.target.value)}
              className={selectClass}
            >
              <option value="tous">Tous</option>
              {Object.entries(AUDIENCE_LABELS).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Type / Usage */}
        <div>
          <label className={labelClass} htmlFor="wa-usage">
            Type / Usage
          </label>
          <div className="relative">
            <select
              id="wa-usage"
              value={values.usage}
              onChange={(e) => onChange("usage", e.target.value)}
              className={selectClass}
            >
              <option value="tous">Tous</option>
              {types.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Langue */}
        <div>
          <label className={labelClass} htmlFor="wa-langue">
            Langue
          </label>
          <div className="relative">
            <select
              id="wa-langue"
              value={values.langue}
              onChange={(e) => onChange("langue", e.target.value)}
              className={selectClass}
            >
              <option value="toutes">Toutes</option>
              {Object.entries(LANGUE_LABELS).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Statut */}
        <div>
          <label className={labelClass} htmlFor="wa-statut">
            Statut
          </label>
          <div className="relative">
            <select
              id="wa-statut"
              value={values.statut}
              onChange={(e) => onChange("statut", e.target.value)}
              className={selectClass}
            >
              <option value="tous">Tous</option>
              {Object.entries(STATUT_LABELS).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Réinitialiser */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
