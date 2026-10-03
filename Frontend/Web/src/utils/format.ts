const priceFormatter = new Intl.NumberFormat("en-IL", { style: "currency", currency: "ILS" });
const countFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

// Auto-compact for stat tiles: 1,284 / 12.9K / 4.2M.
export function formatCount(count: number): string {
  return countFormatter.format(count);
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
