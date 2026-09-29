
export const formatNumberWithSpaces = (
  value: number | string | null | undefined,
  fallback: string = "0"
): string => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const num = typeof value === "string" ? Number(value) : value;

  if (isNaN(num)) {
    return fallback;
  }

  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return parts.join(".");
};