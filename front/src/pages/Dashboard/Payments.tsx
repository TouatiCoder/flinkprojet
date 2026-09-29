import type React from "react";
import { useMemo, useState } from "react";

import PaymentFilters, { PaymentFiltersValue } from "../../components/dashboard/payments/PaymentFilters";
import Pagination from "../../components/ui/pagination/Pagination";
import PaymentStatCards from "../../components/dashboard/payments/PaymentStatCards";
import PaymentsTable, { Payment, PaymentStatus } from "../../components/dashboard/payments/PaymentsTable";
import { useGetPaymentsQuery, useUpdatePaymentStatusMutation } from "../../services/paymentsApi";
import { PaymentStatCardsSkeleton, PaymentsTableSkeleton } from "../../components/dashboard/payments/PaymentsSkeleton";

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const DEFAULT_FILTERS: PaymentFiltersValue = {
  dateFrom: "",
  dateTo: "",
  status: null,
  product: null,
  client: null,
  amount: null,
  search: "",
};

const parseAmount = (value: string): number => Number(value.replace(/[^\d]/g, ""));

// dd/mm/yyyy -> Date (heure locale)
const parseDDMMYYYY = (value: string): Date => {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
};

// yyyy-mm-dd -> Date (heure locale)
const parseISODate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const matchesFilters = (payment: Payment, filters: PaymentFiltersValue): boolean => {
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    const haystack = `${payment.reference} ${payment.client} ${payment.invoice ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  // Comparaison par code numérique désormais
  if (filters.status !== null && payment.status !== filters.status) return false;
  if (filters.product && payment.product !== filters.product) return false;
  if (filters.client && payment.accountType !== filters.client) return false;

  if (filters.amount) {
    const value = parseAmount(payment.amount);
    if (filters.amount === "< 2 000 DH" && !(value < 2000)) return false;
    if (filters.amount === "2 000 - 5 000 DH" && !(value >= 2000 && value <= 5000)) return false;
    if (filters.amount === "> 5 000 DH" && !(value > 5000)) return false;
  }

  if (filters.dateFrom) {
    const from = parseISODate(filters.dateFrom);
    if (parseDDMMYYYY(payment.orderDate) < from) return false;
  }

  if (filters.dateTo) {
    const to = parseISODate(filters.dateTo);
    if (parseDDMMYYYY(payment.orderDate) > to) return false;
  }

  return true;
};

// Formateur de montant pour l'affichage avec exactement 2 chiffres après la virgule
const formatAmountDisplay = (n: number, devise: string) => {
  const formattedNumber = n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/,/g, " ");
  return `${formattedNumber} ${devise}`;
};

// ---------------------------------------------------------------------------

const Payments: React.FC = () => {
  const { data: apiResponse, isLoading, error } = useGetPaymentsQuery();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const [filters, setFilters] = useState<PaymentFiltersValue>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Transformation des données API au format attendu par le tableau
  const paymentsList: Payment[] = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map((item) => ({
      id: item.id,
      orderDate: item.orderDate,
      paymentDate: item.paymentDate,
      paymentTime: item.paymentTime,
      reference: item.reference,
      client: item.client,
      accountType: item.accountType,
      product: item.product as any,
      amount: formatAmountDisplay(item.amount, item.devise),
      status: item.status as PaymentStatus,
      invoice: item.invoice ?? `-`,
    }));
  }, [apiResponse]);

  const productOptions = apiResponse?.products ?? [];

  const filteredPayments = useMemo(
    () => paymentsList.filter((payment) => matchesFilters(payment, filters)),
    [paymentsList, filters]
  );

  const totalPayments = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalPayments / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPayments = useMemo(
    () => filteredPayments.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredPayments, safePage, pageSize]
  );

  const rangeStart = totalPayments === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalPayments);

  const handleFiltersChange = (next: PaymentFiltersValue) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleView = (payment: Payment) => {
    console.log("view payment", payment.id);
  };

  const handleValidate = (payment: Payment) => {
    console.log("validate payment", payment.id);
  };

  const handleStatusChange = async (payment: Payment, newStatus: PaymentStatus) => {
    if (newStatus === payment.status) return;

    setUpdatingId(payment.id);
    try {
      await updatePaymentStatus({ id: payment.id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Échec de la mise à jour du statut", err);
      // Optional: surface a toast/notification here
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats globales récupérées depuis l'API avec formatage à 2 chiffres après la virgule pour les pourcentages et montants
  const stats = apiResponse?.stats;
  const firstItemDevise = apiResponse?.data?.[0]?.devise ?? "DH";

  const statProps = stats ? {
    totalAmount: formatAmountDisplay(stats.totalAmount, firstItemDevise),
    validatedAmount: formatAmountDisplay(stats.validatedAmount, firstItemDevise),
    validatedPercent: `${stats.validatedPercent.toFixed(2)}% du total`,
    pendingAmount: formatAmountDisplay(stats.pendingAmount, firstItemDevise),
    pendingPercent: `${stats.pendingPercent.toFixed(2)}% du total`,
    refusedAmount: formatAmountDisplay(stats.refusedAmount, firstItemDevise),
    refusedPercent: `${stats.refusedPercent.toFixed(2)}% du total`,
    count: stats.count,
  } : undefined;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Paiements
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Suivi et validation des virements bancaires
        </p>
      </div>

      <PaymentFilters
        productOptions={productOptions}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      {isLoading ? (
        <PaymentStatCardsSkeleton />
      ) : (
        <PaymentStatCards {...statProps} />
      )}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          Une erreur est survenue lors du chargement des paiements.
        </div>
      ) : isLoading ? (
        <PaymentsTableSkeleton />
      ) : (
        <PaymentsTable
          payments={paginatedPayments}
          onView={handleView}
          onValidate={handleValidate}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
        />
      )}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading
              ? "Chargement en cours..."
              : totalPayments === 0
              ? "Aucun paiement trouvé"
              : `Affichage de ${rangeStart} à ${rangeEnd} sur ${totalPayments} paiements`}
          </span>

          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            Lignes par page
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={safePage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Payments;