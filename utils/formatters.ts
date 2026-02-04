/**
 * Formats a ISO date string or database timestamp into a clean YYYY-MM-DD display format.
 * Safe for strings like "2025-02-25T00:00:00+00:00" or "2025-12-04 00:00:00+00".
 */
export const formatDateDisplay = (dateStr: string | undefined | null): string => {
  if (!dateStr || dateStr === "N/A" || dateStr === "Unknown") return "N/A";
  
  // Extract only the date portion (YYYY-MM-DD)
  // Splits by 'T' (ISO standard) or ' ' (common SQL/Postgres format)
  return dateStr.split(/[T ]/)[0];
};

/**
 * Generates a Zillow search link for a given address.
 */
export const getZillowLink = (address: string): string => {
  if (!address) return "https://www.zillow.com";
  const zillowSearchQuery = encodeURIComponent(address.trim());
  return `https://www.zillow.com/homes/${zillowSearchQuery}_rb/`;
};
