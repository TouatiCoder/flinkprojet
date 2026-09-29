import type React from "react";
import { useState } from "react";
import Button from "../../ui/button/Button";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../../../icons";
import { Input } from "../../ui/input/input";
import PaymentDateRangeFilter from "../payments/PaymentDateRangeFilter";

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.167 15.833a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333ZM17.5 17.5l-3.625-3.625"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.25 10a6.25 6.25 0 1 1-2.083-4.66M16.25 2.5v3.75h-3.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface MembreFilterValues {
  search: string;
  equipeId: string;
  secteurId: string;
  statut: string;
  responsableId: string;
  /** Raccourci choisi ("all", "this_month", "custom"…). */
  periode: string;
  /** Bornes de la plage, au format yyyy-mm-dd. Vides = aucune restriction. */
  dateFrom: string;
  dateTo: string;
}

interface FilterOption {
  id: number | string;
  name: string;
}

type DropdownKey =
  | "equipe"
  | "secteur"
  | "statut"
  | "responsable"
  | "periode";

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selectedLabel: string | null;
  /** Valeur affichée quand aucun filtre n'est sélectionné. */
  placeholder?: string;
  /** Icône facultative affichée à gauche de la valeur (ex. « Période »). */
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}

/**
 * Filtre au format de la maquette : libellé discret au-dessus, valeur
 * sélectionnée en gras en dessous, sans encadré.
 */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedLabel,
  placeholder = "Tous",
  icon,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}) => {
  return (
    <div className="relative min-w-[120px]">
      <span className="mb-1 block text-[11px] font-medium text-slate-400 dark:text-slate-500">
        {label}
      </span>

      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="dropdown-toggle flex h-6 w-full cursor-pointer items-center justify-between gap-4 whitespace-nowrap bg-transparent text-sm font-semibold text-indigo-950 transition-colors hover:text-brand-500 dark:text-white dark:hover:text-brand-400"
      >
        <span className="flex items-center gap-2">
          {icon}

          {selectedLabel ?? placeholder}
        </span>

        <ChevronDownIcon
          className={`size-4 shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={onClose}
        className="z-50 max-h-60 w-52 overflow-y-auto p-1.5"
      >
        {options.length > 0 ? (
          options.map((option) => (
            <DropdownItem
              key={option.value}
              onItemClick={() => onSelect(option.value)}
              baseClassName="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-white"
            >
              {option.label}
            </DropdownItem>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-gray-400">
            Aucun résultat
          </div>
        )}
      </Dropdown>
    </div>
  );
};

/**
 * Entrée « Tous » ajoutée en tête de chaque liste : elle permet de revenir à
 * l'état non filtré directement depuis le menu.
 */
const withToutesOption = (
  options: { value: string; label: string }[]
) => [{ value: "", label: "Tous" }, ...options];

const STATUT_OPTIONS = [
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
];

interface MembreFilterProps {
  filters: MembreFilterValues;

  onFilterChange: (
    key: keyof MembreFilterValues,
    value: string
  ) => void;

  onResetFilters?: () => void;

  equipesOptions?: FilterOption[];
  secteursOptions?: FilterOption[];
  responsablesOptions?: FilterOption[];
}

const MembreFilter: React.FC<MembreFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  equipesOptions = [],
  secteursOptions = [],
  responsablesOptions = [],
}) => {
  const [openDropdown, setOpenDropdown] =
    useState<DropdownKey | null>(null);

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((previous) =>
      previous === key ? null : key
    );
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const equipeOptions = equipesOptions.map((equipe) => ({
    value: String(equipe.id),
    label: equipe.name,
  }));

  const secteurOptions = secteursOptions.map((secteur) => ({
    value: String(secteur.id),
    label: secteur.name,
  }));

  const responsableOptions = responsablesOptions.map(
    (responsable) => ({
      value: String(responsable.id),
      label: responsable.name,
    })
  );

  const selectedEquipeLabel =
    equipeOptions.find(
      (option) => option.value === filters.equipeId
    )?.label ?? null;

  const selectedSecteurLabel =
    secteurOptions.find(
      (option) => option.value === filters.secteurId
    )?.label ?? null;

  const selectedStatutLabel =
    STATUT_OPTIONS.find(
      (option) => option.value === filters.statut
    )?.label ?? null;

  const selectedResponsableLabel =
    responsableOptions.find(
      (option) =>
        option.value === filters.responsableId
    )?.label ?? null;

  // Le bouton « Réinitialiser » n'apparaît que lorsqu'un filtre est réellement
  // actif : la barre reste identique à la maquette à l'état initial.
  const hasActiveFilter =
    Boolean(filters.search) ||
    Boolean(filters.equipeId) ||
    Boolean(filters.secteurId) ||
    Boolean(filters.statut) ||
    Boolean(filters.responsableId) ||
    (Boolean(filters.periode) && filters.periode !== "all") ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const handleReset = () => {
    onFilterChange("search", "");
    onFilterChange("equipeId", "");
    onFilterChange("secteurId", "");
    onFilterChange("statut", "");
    onFilterChange("responsableId", "");
    onFilterChange("periode", "all");
    onFilterChange("dateFrom", "");
    onFilterChange("dateTo", "");

    setOpenDropdown(null);

    onResetFilters?.();
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-dark">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />

          <Input
            placeholder="Rechercher un membre..."
            value={filters.search}
            onChange={(event) =>
              onFilterChange(
                "search",
                event.target.value
              )
            }
            className="h-10 w-full border-gray-200 pl-9 text-sm focus-visible:border-brand-500 focus-visible:ring-0 dark:border-gray-700"
          />
        </div>

        {/* Équipe */}
        <FilterDropdown
          label="Équipe"
          options={withToutesOption(equipeOptions)}
          selectedLabel={selectedEquipeLabel}
          isOpen={openDropdown === "equipe"}
          onToggle={() => toggleDropdown("equipe")}
          onClose={closeDropdown}
          onSelect={(value) => {
            onFilterChange("equipeId", value);
            closeDropdown();
          }}
        />

        {/* Secteur */}
        <FilterDropdown
          label="Secteur"
          options={withToutesOption(secteurOptions)}
          selectedLabel={selectedSecteurLabel}
          isOpen={openDropdown === "secteur"}
          onToggle={() => toggleDropdown("secteur")}
          onClose={closeDropdown}
          onSelect={(value) => {
            onFilterChange("secteurId", value);
            closeDropdown();
          }}
        />

        {/* Statut */}
        <FilterDropdown
          label="Statut"
          options={withToutesOption(STATUT_OPTIONS)}
          selectedLabel={selectedStatutLabel}
          isOpen={openDropdown === "statut"}
          onToggle={() => toggleDropdown("statut")}
          onClose={closeDropdown}
          onSelect={(value) => {
            onFilterChange("statut", value);
            closeDropdown();
          }}
        />

        {/* Responsable */}
        <FilterDropdown
          label="Responsable"
          options={withToutesOption(responsableOptions)}
          selectedLabel={selectedResponsableLabel}
          isOpen={openDropdown === "responsable"}
          onToggle={() => toggleDropdown("responsable")}
          onClose={closeDropdown}
          onSelect={(value) => {
            onFilterChange("responsableId", value);
            closeDropdown();
          }}
        />

        {/* Période — réutilise le sélecteur de plage de dates existant */}
        <div className="min-w-[200px]">
          <span className="mb-1 block text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Période
          </span>

          <PaymentDateRangeFilter
            // Le filtre est le dernier élément à droite de la barre : le
            // panneau (520px) doit s'ouvrir vers la gauche, sinon il sort
            // de l'écran.
            align="right"
            placeholder="Toutes"
            buttonClassName="flex h-6 w-full cursor-pointer items-center justify-between gap-4 whitespace-nowrap bg-transparent transition-colors"
            value={{
              dateFrom: filters.dateFrom,
              dateTo: filters.dateTo,
              preset: filters.periode,
            }}
            isOpen={openDropdown === "periode"}
            onToggle={() => toggleDropdown("periode")}
            onClose={closeDropdown}
            onChange={(range) => {
              onFilterChange("dateFrom", range.dateFrom);
              onFilterChange("dateTo", range.dateTo);
              onFilterChange("periode", range.preset ?? "all");
            }}
          />
        </div>

        {/* Reset */}
        {hasActiveFilter && (
          <Button
            variant="outline"
            size="sm"
            startIcon={<RefreshIcon className="size-4" />}
            onClick={handleReset}
            className="whitespace-nowrap !text-brand-500 !ring-0 hover:!bg-brand-50 dark:!text-brand-400"
          >
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
};

export default MembreFilter;