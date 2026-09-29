// Mapping central entre les codes numériques (source de vérité côté API)
// et les libellés texte déjà utilisés dans l'UI. On ne touche pas au texte
// affiché à l'utilisateur, seulement à ce qui transite en request/response.

export const PAYMENT_STATUS = {
  ACCEPTED: 1,
  PENDING: 2,
  REFUSED: 0,
} as const;

export type PaymentStatusCode = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// Ordre d'affichage utilisé partout (dropdowns, select, filtres)
export const PAYMENT_STATUS_OPTIONS: PaymentStatusCode[] = [
  PAYMENT_STATUS.ACCEPTED,
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.REFUSED,
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusCode, string> = {
  [PAYMENT_STATUS.ACCEPTED]: "Paiement accepté",
  [PAYMENT_STATUS.PENDING]: "En cours",
  [PAYMENT_STATUS.REFUSED]: "Refusé",
};

export const getPaymentStatusLabel = (code: PaymentStatusCode): string =>
  PAYMENT_STATUS_LABELS[code];

export const getPaymentStatusCodeFromLabel = (
  label: string
): PaymentStatusCode | null => {
  const found = PAYMENT_STATUS_OPTIONS.find(
    (code) => PAYMENT_STATUS_LABELS[code] === label
  );
  return found ?? null;
};