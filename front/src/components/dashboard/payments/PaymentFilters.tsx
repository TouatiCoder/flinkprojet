import type React from "react";
import { useState } from "react";
import Button from "../../ui/button/Button";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../../../icons";
import PaymentDateRangeFilter, { DateRangeValue } from "./PaymentDateRangeFilter";
import { Input } from "../../ui/input/input";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
  PaymentStatusCode,
  getPaymentStatusCodeFromLabel,
} from "../../../services/Paymentstatus";

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

export interface PaymentFiltersValue {
  dateFrom: string;
  dateTo: string;
  status: PaymentStatusCode | null;
  product: string | null;
  client: string | null;
  amount: string | null;
  search: string;
}

type DropdownKey = "dateRange" | "status" | "product" | "client" | "amount";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}) => {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        endIcon={<ChevronDownIcon className="size-4" />}
        onClick={onToggle}
        className="dropdown-toggle whitespace-nowrap !justify-between"
      >
        {selected ?? label}
      </Button>
      <Dropdown isOpen={isOpen} onClose={onClose} className="w-48 p-1.5 max-h-60 overflow-y-auto">
        {options.map((option) => (
          <DropdownItem
            key={option}
            onItemClick={() => onSelect(option)}
            baseClassName="block w-full rounded-md text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-white"
          >
            {option}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
};

// Libellés affichés (inchangés) — dérivés de la source de vérité numérique
const STATUS_LABEL_OPTIONS = PAYMENT_STATUS_OPTIONS.map(
  (code) => PAYMENT_STATUS_LABELS[code]
);
const CLIENT_OPTIONS = ["Compte Pro", "User"];
const AMOUNT_OPTIONS = ["< 2 000 DH", "2 000 - 5 000 DH", "> 5 000 DH"];

interface PaymentFiltersProps {
  productOptions: string[];
  onChange?: (filters: PaymentFiltersValue) => void;
  onReset?: () => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({ productOptions, onChange, onReset }) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<PaymentStatusCode | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [client, setClient] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const toggleDropdown = (key: DropdownKey) =>
    setOpenDropdown((prev) => (prev === key ? null : key));
  const closeDropdown = () => setOpenDropdown(null);

  const emitChange = (next: Partial<PaymentFiltersValue>) => {
    onChange?.({
      dateFrom,
      dateTo,
      status,
      product,
      client,
      amount,
      search,
      ...next,
    });
  };

  const handleDateRangeChange = ({ dateFrom: from, dateTo: to }: DateRangeValue) => {
    setDateFrom(from);
    setDateTo(to);
    emitChange({ dateFrom: from, dateTo: to });
  };

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setStatus(null);
    setProduct(null);
    setClient(null);
    setAmount(null);
    setSearch("");
    setOpenDropdown(null);
    onReset?.();
  };

  const selectedStatusLabel = status !== null ? PAYMENT_STATUS_LABELS[status] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-dark">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Référence, client, facture..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              emitChange({ search: e.target.value });
            }}
            className="h-11 w-64 pl-9 text-sm border-gray-300 focus-visible:border-blue-500 focus-visible:ring-0 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-white"
          />
        </div>

        <FilterDropdown
          label="Statut"
          options={STATUS_LABEL_OPTIONS}
          selected={selectedStatusLabel}
          isOpen={openDropdown === "status"}
          onToggle={() => toggleDropdown("status")}
          onClose={closeDropdown}
          onSelect={(label) => {
            const code = getPaymentStatusCodeFromLabel(label);
            setStatus(code);
            emitChange({ status: code });
            closeDropdown();
          }}
        />

        <FilterDropdown
          label="Produit"
          options={productOptions}
          selected={product}
          isOpen={openDropdown === "product"}
          onToggle={() => toggleDropdown("product")}
          onClose={closeDropdown}
          onSelect={(value) => {
            setProduct(value);
            emitChange({ product: value });
            closeDropdown();
          }}
        />

        <FilterDropdown
          label="Client"
          options={CLIENT_OPTIONS}
          selected={client}
          isOpen={openDropdown === "client"}
          onToggle={() => toggleDropdown("client")}
          onClose={closeDropdown}
          onSelect={(value) => {
            setClient(value);
            emitChange({ client: value });
            closeDropdown();
          }}
        />

        <FilterDropdown
          label="Montant"
          options={AMOUNT_OPTIONS}
          selected={amount}
          isOpen={openDropdown === "amount"}
          onToggle={() => toggleDropdown("amount")}
          onClose={closeDropdown}
          onSelect={(value) => {
            setAmount(value);
            emitChange({ amount: value });
            closeDropdown();
          }}
        />

        <PaymentDateRangeFilter
          value={{ dateFrom, dateTo }}
          isOpen={openDropdown === "dateRange"}
          onToggle={() => toggleDropdown("dateRange")}
          onClose={closeDropdown}
          onChange={handleDateRangeChange}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        startIcon={<RefreshIcon className="size-4" />}
        onClick={handleReset}
        className="whitespace-nowrap !text-brand-500 !ring-0 hover:!bg-brand-50 dark:!text-brand-400"
      >
        Réinitialiser
      </Button>
    </div>
  );
};

export default PaymentFilters;