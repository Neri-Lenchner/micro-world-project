const priceFormatter = new Intl.NumberFormat("en-IL", { style: "currency", currency: "ILS" });
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
