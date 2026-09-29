import type React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import {
  CheckCircleIcon,
  TimeIcon,
  CloseIcon,
  BoltIcon,
  PaperPlaneIcon,
  ShootingStarIcon,
  MoreDotIcon,
} from "../../../icons";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
  PaymentStatusCode,
} from "../../../services/Paymentstatus";

// Le statut est désormais un code numérique (source de vérité API).
// L'affichage continue d'utiliser les libellés texte existants via PAYMENT_STATUS_LABELS.
export type PaymentStatus = PaymentStatusCode;

export interface Payment {
  id: string;
  orderDate: string;
  paymentDate: string;
  paymentTime: string;
  reference: string;
  client: string;
  accountType: string;
  product: string;
  amount: string;
  status: PaymentStatus;
  invoice: string;
}

interface PaymentsTableProps {
  payments: Payment[];
  onView?: (payment: Payment) => void;
  onValidate?: (payment: Payment) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onStatusChange?: (payment: Payment, newStatus: PaymentStatus) => void;
  updatingId?: string | null;
}

const STATUS_STYLES: Record<
  PaymentStatus,
  { badge: string; select: string; icon: React.ReactNode }
> = {
  [PAYMENT_STATUS.ACCEPTED]: {
    badge:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    select:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 focus:ring-green-500/30",
    icon: <CheckCircleIcon className="size-3.5" />,
  },
  [PAYMENT_STATUS.PENDING]: {
    badge:
      "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    select:
      "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 focus:ring-orange-500/30",
    icon: <TimeIcon className="size-3.5" />,
  },
  [PAYMENT_STATUS.REFUSED]: {
    badge: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    select:
      "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 focus:ring-red-500/30",
    icon: <CloseIcon className="size-3.5" />,
  },
};

const PRODUCT_STYLES: Record<
  string,
  { badge: string; icon: React.ReactNode }
> = {
  "Activation Pro": {
    badge: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    icon: <BoltIcon className="size-3.5" />,
  },
  "Solde Ads": {
    badge:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    icon: <PaperPlaneIcon className="size-3.5" />,
  },
  "Pro + Solde Ads": {
    badge: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    icon: <ShootingStarIcon className="size-3.5" />,
  },
  "Solde - Essentiel": {
    badge: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    icon: <BoltIcon className="size-3.5" />,
  },
  "Solde - Avancé": {
    badge: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    icon: <BoltIcon className="size-3.5" />,
  },
  "Solde - Boost": {
    badge: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    icon: <ShootingStarIcon className="size-3.5" />,
  },
  "Solde - Pro Master": {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    icon: <ShootingStarIcon className="size-3.5" />,
  },
  "Publicité": {
    badge: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    icon: <PaperPlaneIcon className="size-3.5" />,
  },
  "Custom": {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
    icon: <BoltIcon className="size-3.5" />,
  },
};

const DEFAULT_PRODUCT_STYLE = {
  badge: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  icon: <BoltIcon className="size-3.5" />,
};

const ProductBadge: React.FC<{ product: string }> = ({ product }) => {
  const style = PRODUCT_STYLES[product] ?? DEFAULT_PRODUCT_STYLE;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
    >
      {style.icon}
      {product || "-"}
    </span>
  );
};

// Dropdown that replaces the old read-only status badge.
// Value transmise/reçue = code numérique, texte affiché = label existant.
const StatusDropdown: React.FC<{
  status: PaymentStatus;
  onChange: (status: PaymentStatus) => void;
  disabled?: boolean;
}> = ({ status, onChange, disabled }) => {
  const style = STATUS_STYLES[status];
  return (
    <div className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-2.5 flex items-center">
        {style.icon}
      </span>
      <select
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) as PaymentStatus)}
        className={`cursor-pointer appearance-none rounded-full border-0 py-1 pl-7 pr-3 text-xs font-medium outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${style.select}`}
      >
        {PAYMENT_STATUS_OPTIONS.map((code) => (
          <option key={code} value={code}>
            {PAYMENT_STATUS_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
};

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onView,
  onValidate,
  onStatusChange,
  updatingId,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-dark">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
            <TableRow>
              {[
                "Date commande",
                "Date paiement",
                "Référence",
                "Client",
                "Produit",
                "Montant",
                "Statut",
                "Facture",
                "Action",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  isHeader
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Aucun paiement trouvé
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Essayez de modifier vos filtres de recherche
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                    {payment.orderDate}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                    {payment.paymentDate}{" "}
                    <span className="text-gray-400">{payment.paymentTime}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-brand-500">
                    {payment.reference}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {payment.client}
                    </div>
                    <div className="text-xs text-gray-400">{payment.accountType}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    <ProductBadge product={payment.product} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-800 dark:text-white/90">
                    {payment.amount}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    <StatusDropdown
                      status={payment.status}
                      disabled={updatingId === payment.id}
                      onChange={(newStatus) =>
                        onStatusChange?.(payment, newStatus)
                      }
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-brand-500">
                    {payment.invoice}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {payment.status === PAYMENT_STATUS.PENDING ? (
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => onValidate?.(payment)}
                        >
                          Valider
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => onView?.(payment)}
                        >
                          Voir
                        </Button>
                      )}
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.05]"
                        aria-label="Plus d'actions"
                      >
                        <MoreDotIcon className="size-4 rotate-90" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsTable;