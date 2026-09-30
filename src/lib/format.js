export function formatCurrency(n, currency = "GBP") {
  const val = Number(n) || 0;
  const isWhole = Math.round(val * 100) % 100 === 0;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  } catch {
    return `${val.toFixed(2)}`;
  }
}

export function sum(arr, key) {
  return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
}

export function computeCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
  return totals;
}

/** The bare symbol for a currency code, e.g. "£" for GBP. */
export function currencySymbol(currency = "GBP") {
  try {
    const part = new Intl.NumberFormat("en-GB", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part ? part.value : currency;
  } catch {
    return currency;
  }
}
